# routes/comments.py - Simplified Anonymous Comments API
import json
import logging
import traceback
from datetime import datetime
from flask import Blueprint, jsonify, request
from db import get_db_connection
import mysql.connector
from mysql.connector import Error

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

comments_bp = Blueprint('comments', __name__)

def get_user_identifier():
    """Get user identifier from IP address for reactions"""
    return request.remote_addr or 'unknown'

def format_comment_response(comment_row):
    """Format comment data for API response"""
    try:
        logger.debug(f"Formatting comment row with {len(comment_row)} columns: {comment_row}")
        
        # Handle different row lengths based on query
        result = {
            'id': comment_row[0],
            'content': comment_row[1],
            'anonymous_name': comment_row[2],
            'likes_count': comment_row[3] if len(comment_row) > 3 else 0,
            'dislikes_count': comment_row[4] if len(comment_row) > 4 else 0,
            'created_at': comment_row[5].isoformat() if len(comment_row) > 5 and comment_row[5] else None,
            'replies_count': comment_row[6] if len(comment_row) > 6 else 0
        }
        
        logger.debug(f"Formatted result: {result}")
        return result
    except Exception as e:
        logger.error(f"Error formatting comment: {e}")
        logger.error(f"Comment row data: {comment_row}")
        raise

@comments_bp.route('/movies/<int:movie_id>/comments', methods=['GET'])
def get_movie_comments(movie_id):
    """Get comments for a specific movie with pagination and sorting"""
    connection = None
    cursor = None
    try:
        logger.debug(f"Getting comments for movie_id: {movie_id}")
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        sort = request.args.get('sort', 'newest')
        
        # Validate pagination
        if page < 1:
            page = 1
        if limit > 50:
            limit = 50
            
        offset = (page - 1) * limit
        
        # Determine sort order
        order_by = 'c.created_at DESC'
        if sort == 'oldest':
            order_by = 'c.created_at ASC'
        elif sort == 'most_liked':
            order_by = 'c.likes_count DESC, c.created_at DESC'
        
        connection = get_db_connection()
        cursor = connection.cursor(raw=False)  # Ensure tuple format
        
        # Get comments query - Simplified without user joins
        query = f"""
            SELECT 
                c.id,
                c.content,
                c.anonymous_name,
                c.likes_count,
                c.dislikes_count,
                c.created_at,
                (SELECT COUNT(*) FROM comments WHERE parent_id = c.id AND is_deleted = 0) as replies_count
            FROM comments c
            WHERE c.movie_id = %s 
                AND c.parent_id IS NULL 
                AND c.is_deleted = 0
            ORDER BY {order_by}
            LIMIT %s OFFSET %s
        """
        
        logger.debug(f"Executing query with params: {(movie_id, limit, offset)}")
        cursor.execute(query, (movie_id, limit, offset))
        comments_data = cursor.fetchall()
        
        # Get total count
        count_query = """
            SELECT COUNT(*) as total 
            FROM comments 
            WHERE movie_id = %s AND parent_id IS NULL AND is_deleted = 0
        """
        cursor.execute(count_query, (movie_id,))
        total_count = cursor.fetchone()[0]
        
        # Format response
        comments = [format_comment_response(row) for row in comments_data]
        
        response = {
            'comments': comments,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'totalPages': (total_count + limit - 1) // limit if total_count > 0 else 1
            }
        }
        
        return jsonify(response), 200
        
    except Error as e:
        logger.error(f"Database error: {e}")
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Server error: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@comments_bp.route('/movies/<int:movie_id>/comments', methods=['POST'])
def create_comment(movie_id):
    """Create a new comment for a movie"""
    connection = None
    cursor = None
    try:
        logger.debug(f"Creating comment for movie_id: {movie_id}")
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        content = data.get('content', '').strip()
        anonymous_name = data.get('anonymous_name', 'Người dùng ẩn danh').strip()
        parent_id = data.get('parent_id')
        
        # Validation
        if not content:
            return jsonify({'error': 'Nội dung comment không được để trống'}), 400
            
        if len(content) > 1000:
            return jsonify({'error': 'Comment không được vượt quá 1000 ký tự'}), 400
            
        if len(anonymous_name) > 100:
            anonymous_name = anonymous_name[:100]
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check if it's a reply, verify parent comment exists
        if parent_id:
            cursor.execute(
                "SELECT id FROM comments WHERE id = %s AND movie_id = %s AND is_deleted = 0",
                (parent_id, movie_id)
            )
            if not cursor.fetchone():
                return jsonify({'error': 'Không tìm thấy comment gốc'}), 404
        
        # Insert comment
        insert_query = """
            INSERT INTO comments (movie_id, content, anonymous_name, parent_id)
            VALUES (%s, %s, %s, %s)
        """
        
        cursor.execute(insert_query, (movie_id, content, anonymous_name, parent_id))
        comment_id = cursor.lastrowid
        connection.commit()
        
        # Get the created comment with all needed fields
        get_comment_query = """
            SELECT 
                c.id,
                c.content,
                c.anonymous_name,
                c.likes_count,
                c.dislikes_count,
                c.created_at
            FROM comments c
            WHERE c.id = %s
        """
        
        cursor.execute(get_comment_query, (comment_id,))
        new_comment_data = cursor.fetchone()
        
        logger.debug(f"Retrieved comment data: {new_comment_data}")
        logger.debug(f"Data type: {type(new_comment_data)}")
        
        if not new_comment_data:
            return jsonify({'error': 'Failed to retrieve created comment'}), 500
        
        # Format the response properly - handle both tuple and dict
        if isinstance(new_comment_data, dict):
            # If it's a dictionary (from some MySQL drivers)
            formatted_comment = {
                'id': new_comment_data.get('id'),
                'content': new_comment_data.get('content'),
                'anonymous_name': new_comment_data.get('anonymous_name'),
                'likes_count': new_comment_data.get('likes_count', 0),
                'dislikes_count': new_comment_data.get('dislikes_count', 0),
                'created_at': new_comment_data.get('created_at').isoformat() if new_comment_data.get('created_at') else None,
                'replies_count': 0
            }
        else:
            # If it's a tuple (normal case)
            formatted_comment = {
                'id': new_comment_data[0],
                'content': new_comment_data[1],
                'anonymous_name': new_comment_data[2],
                'likes_count': new_comment_data[3] or 0,
                'dislikes_count': new_comment_data[4] or 0,
                'created_at': new_comment_data[5].isoformat() if new_comment_data[5] else None,
                'replies_count': 0
            }
        
        logger.debug(f"Formatted comment: {formatted_comment}")
        
        response = {
            'message': 'Tạo comment thành công',
            'comment': formatted_comment
        }
        
        return jsonify(response), 201
        
    except Error as e:
        logger.error(f"Database error: {e}")
        if connection:
            connection.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Server error: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@comments_bp.route('/comments/<int:comment_id>/replies', methods=['GET'])
def get_comment_replies(comment_id):
    """Get replies for a specific comment"""
    connection = None
    cursor = None
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 5))
        offset = (page - 1) * limit
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        query = """
            SELECT 
                c.id,
                c.content,
                c.anonymous_name,
                c.likes_count,
                c.dislikes_count,
                c.created_at
            FROM comments c
            WHERE c.parent_id = %s AND c.is_deleted = 0
            ORDER BY c.created_at ASC
            LIMIT %s OFFSET %s
        """
        
        cursor.execute(query, (comment_id, limit, offset))
        replies_data = cursor.fetchall()
        
        # Format replies manually to avoid column mismatch
        replies = []
        for row in replies_data:
            reply = {
                'id': row[0],
                'content': row[1],
                'anonymous_name': row[2],
                'likes_count': row[3] or 0,
                'dislikes_count': row[4] or 0,
                'created_at': row[5].isoformat() if row[5] else None,
                'replies_count': 0  # Replies don't have nested replies
            }
            replies.append(reply)
        
        return jsonify({'replies': replies}), 200
        
    except Error as e:
        logger.error(f"Database error: {e}")
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Server error: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@comments_bp.route('/comments/<int:comment_id>/react', methods=['POST'])
def react_to_comment(comment_id):
    """Like or dislike a comment (based on IP address)"""
    connection = None
    cursor = None
    try:
        data = request.get_json()
        reaction_type = data.get('reaction_type')
        
        if reaction_type not in ['like', 'dislike']:
            return jsonify({'error': 'Loại reaction không hợp lệ'}), 400
        
        user_identifier = get_user_identifier()
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check if comment exists
        cursor.execute("SELECT id FROM comments WHERE id = %s AND is_deleted = 0", (comment_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Không tìm thấy comment'}), 404
        
        # Check existing reaction
        cursor.execute(
            "SELECT id, reaction_type FROM comment_reactions WHERE comment_id = %s AND user_identifier = %s",
            (comment_id, user_identifier)
        )
        existing_reaction = cursor.fetchone()
        
        if existing_reaction:
            existing_reaction_id, existing_type = existing_reaction
            if existing_type == reaction_type:
                # Remove reaction (toggle)
                cursor.execute(
                    "DELETE FROM comment_reactions WHERE comment_id = %s AND user_identifier = %s",
                    (comment_id, user_identifier)
                )
                message = 'Đã hủy reaction'
            else:
                # Update reaction
                cursor.execute(
                    "UPDATE comment_reactions SET reaction_type = %s WHERE comment_id = %s AND user_identifier = %s",
                    (reaction_type, comment_id, user_identifier)
                )
                message = 'Đã cập nhật reaction'
        else:
            # Create new reaction
            cursor.execute(
                "INSERT INTO comment_reactions (comment_id, user_identifier, reaction_type) VALUES (%s, %s, %s)",
                (comment_id, user_identifier, reaction_type)
            )
            message = 'Đã thêm reaction'
        
        connection.commit()
        
        return jsonify({'message': message}), 200
        
    except Error as e:
        logger.error(f"Database error: {e}")
        if connection:
            connection.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Server error: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@comments_bp.route('/comments/stats/<int:movie_id>', methods=['GET'])
def get_comment_stats(movie_id):
    """Get comment statistics for a movie"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Get total comments count
        cursor.execute(
            "SELECT COUNT(*) FROM comments WHERE movie_id = %s AND is_deleted = 0",
            (movie_id,)
        )
        total_comments = cursor.fetchone()[0]
        
        # Get total likes across all comments
        cursor.execute(
            "SELECT SUM(likes_count) FROM comments WHERE movie_id = %s AND is_deleted = 0",
            (movie_id,)
        )
        total_likes = cursor.fetchone()[0] or 0
        
        # Get recent activity (comments in last 24 hours)
        cursor.execute(
            "SELECT COUNT(*) FROM comments WHERE movie_id = %s AND is_deleted = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)",
            (movie_id,)
        )
        recent_activity = cursor.fetchone()[0]
        
        stats = {
            'total_comments': total_comments,
            'total_likes': total_likes,
            'recent_activity': recent_activity
        }
        
        return jsonify(stats), 200
        
    except Error as e:
        logger.error(f"Database error: {e}")
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Server error: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# Debug endpoint to check table structure
@comments_bp.route('/debug-table', methods=['GET'])
def debug_table():
    """Debug table structure"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check table structure
        cursor.execute("DESCRIBE comments")
        columns = cursor.fetchall()
        
        # Check if any data exists
        cursor.execute("SELECT COUNT(*) FROM comments")
        count = cursor.fetchone()[0]
        
        # Sample insert test
        cursor.execute("""
            INSERT INTO comments (movie_id, content, anonymous_name) 
            VALUES (1, 'Test comment', 'Test User')
        """)
        test_id = cursor.lastrowid
        connection.commit()
        
        # Retrieve test comment
        cursor.execute("SELECT * FROM comments WHERE id = %s", (test_id,))
        test_data = cursor.fetchone()
        
        # Clean up test
        cursor.execute("DELETE FROM comments WHERE id = %s", (test_id,))
        connection.commit()
        
        return jsonify({
            'table_structure': columns,
            'total_comments': count,
            'test_insert_data': test_data,
            'test_columns_count': len(test_data) if test_data else 0
        }), 200
        
    except Exception as e:
        logger.error(f"Debug failed: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
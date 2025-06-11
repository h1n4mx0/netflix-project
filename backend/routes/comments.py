# routes/comments.py - Complete Comments API for Movies and Shows
import json
import logging
import traceback
from datetime import datetime
from flask import Blueprint, jsonify, request
from db import get_db_connection
import pymysql
from pymysql.err import MySQLError as Error

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

# ============== MOVIE COMMENTS ==============

@comments_bp.route('/movies/<int:movie_id>/comments', methods=['GET'])
def get_movie_comments(movie_id):
    """Get comments for a specific movie with pagination and sorting"""
    connection = None
    cursor = None
    try:
        logger.debug(f"Getting comments for movie_id: {movie_id}")
        
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        sort = request.args.get('sort', 'newest')
        
        if page < 1:
            page = 1
        if limit > 50:
            limit = 50
            
        offset = (page - 1) * limit
        
        order_by = 'c.created_at DESC'
        if sort == 'oldest':
            order_by = 'c.created_at ASC'
        elif sort == 'most_liked':
            order_by = 'c.likes_count DESC, c.created_at DESC'
        
        connection = get_db_connection()
        cursor = connection.cursor(cursor=pymysql.cursors.Cursor)
        
        query = f"""
            SELECT 
                c.id,
                c.content,
                c.anonymous_name,
                c.likes_count,
                c.dislikes_count,
                c.created_at,
                (SELECT COUNT(*) FROM movie_comments WHERE parent_id = c.id AND is_deleted = 0) as replies_count
            FROM movie_comments c
            WHERE c.movie_id = %s 
                AND c.parent_id IS NULL 
                AND c.is_deleted = 0
            ORDER BY {order_by}
            LIMIT %s OFFSET %s
        """
        
        cursor.execute(query, (movie_id, limit, offset))
        comments_data = cursor.fetchall()
        
        count_query = """
            SELECT COUNT(*) as total 
            FROM movie_comments 
            WHERE movie_id = %s AND parent_id IS NULL AND is_deleted = 0
        """
        cursor.execute(count_query, (movie_id,))
        total_count = cursor.fetchone()[0]
        
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
def create_movie_comment(movie_id):
    """Create a new comment for a movie"""
    connection = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        content = data.get('content', '').strip()
        anonymous_name = data.get('anonymous_name', 'Người dùng ẩn danh').strip()
        parent_id = data.get('parent_id')
        
        if not content:
            return jsonify({'error': 'Nội dung comment không được để trống'}), 400
        if len(content) > 1000:
            return jsonify({'error': 'Comment không được vượt quá 1000 ký tự'}), 400
        if len(anonymous_name) > 100:
            anonymous_name = anonymous_name[:100]
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        if parent_id:
            cursor.execute(
                "SELECT id FROM movie_comments WHERE id = %s AND movie_id = %s AND is_deleted = 0",
                (parent_id, movie_id)
            )
            if not cursor.fetchone():
                return jsonify({'error': 'Không tìm thấy comment gốc'}), 404
        
        insert_query = """
            INSERT INTO movie_comments (movie_id, content, anonymous_name, parent_id)
            VALUES (%s, %s, %s, %s)
        """
        
        cursor.execute(insert_query, (movie_id, content, anonymous_name, parent_id))
        comment_id = cursor.lastrowid
        connection.commit()
        
        get_comment_query = """
            SELECT id, content, anonymous_name, likes_count, dislikes_count, created_at
            FROM movie_comments WHERE id = %s
        """
        
        cursor.execute(get_comment_query, (comment_id,))
        new_comment_data = cursor.fetchone()
        
        if not new_comment_data:
            return jsonify({'error': 'Failed to retrieve created comment'}), 500
        
        if isinstance(new_comment_data, dict):
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
            formatted_comment = {
                'id': new_comment_data[0],
                'content': new_comment_data[1],
                'anonymous_name': new_comment_data[2],
                'likes_count': new_comment_data[3] or 0,
                'dislikes_count': new_comment_data[4] or 0,
                'created_at': new_comment_data[5].isoformat() if new_comment_data[5] else None,
                'replies_count': 0
            }
        
        return jsonify({
            'message': 'Tạo comment thành công',
            'comment': formatted_comment
        }), 201
        
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
def get_movie_comment_replies(comment_id):
    """Get replies for a specific movie comment"""
    connection = None
    cursor = None
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 5))
        offset = (page - 1) * limit
        
        connection = get_db_connection()
        cursor = connection.cursor(cursor=pymysql.cursors.DictCursor)
        
        query = """
            SELECT id, content, anonymous_name, likes_count, dislikes_count, created_at
            FROM movie_comments
            WHERE parent_id = %s AND is_deleted = 0
            ORDER BY created_at ASC
            LIMIT %s OFFSET %s
        """
        
        cursor.execute(query, (comment_id, limit, offset))
        replies_data = cursor.fetchall()
        
        replies = []
        for row in replies_data:
            reply = {
                'id': row['id'],
                'content': row['content'],
                'anonymous_name': row['anonymous_name'],
                'likes_count': row['likes_count'] or 0,
                'dislikes_count': row['dislikes_count'] or 0,
                'created_at': row['created_at'].isoformat() if row['created_at'] else None,
                'replies_count': 0
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
def react_to_movie_comment(comment_id):
    """Like or dislike a movie comment"""
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
        
        cursor.execute("SELECT id FROM movie_comments WHERE id = %s AND is_deleted = 0", (comment_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Không tìm thấy comment'}), 404
        
        cursor.execute(
            "SELECT id, reaction_type FROM movie_comment_reactions WHERE comment_id = %s AND user_identifier = %s",
            (comment_id, user_identifier)
        )
        existing_reaction = cursor.fetchone()
        
        if existing_reaction:
            existing_reaction_id, existing_type = existing_reaction
            if existing_type == reaction_type:
                cursor.execute(
                    "DELETE FROM movie_comment_reactions WHERE comment_id = %s AND user_identifier = %s",
                    (comment_id, user_identifier)
                )
                message = 'Đã hủy reaction'
            else:
                cursor.execute(
                    "UPDATE movie_comment_reactions SET reaction_type = %s WHERE comment_id = %s AND user_identifier = %s",
                    (reaction_type, comment_id, user_identifier)
                )
                message = 'Đã cập nhật reaction'
        else:
            cursor.execute(
                "INSERT INTO movie_comment_reactions (comment_id, user_identifier, reaction_type) VALUES (%s, %s, %s)",
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

# ============== SHOW COMMENTS ==============

@comments_bp.route('/shows/<int:show_id>/comments', methods=['GET'])
def get_show_comments(show_id):
    """Get comments for a specific show with pagination and sorting"""
    connection = None
    cursor = None
    try:
        logger.debug(f"Getting comments for show_id: {show_id}")
        
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        sort = request.args.get('sort', 'newest')
        
        if page < 1:
            page = 1
        if limit > 50:
            limit = 50
            
        offset = (page - 1) * limit
        
        order_by = 'c.created_at DESC'
        if sort == 'oldest':
            order_by = 'c.created_at ASC'
        elif sort == 'most_liked':
            order_by = 'c.likes_count DESC, c.created_at DESC'
        
        connection = get_db_connection()
        cursor = connection.cursor(cursor=pymysql.cursors.Cursor)
        
        query = f"""
            SELECT 
                c.id,
                c.content,
                c.anonymous_name,
                c.likes_count,
                c.dislikes_count,
                c.created_at,
                (SELECT COUNT(*) FROM show_comments WHERE parent_id = c.id AND is_deleted = 0) as replies_count
            FROM show_comments c
            WHERE c.show_id = %s 
                AND c.parent_id IS NULL 
                AND c.is_deleted = 0
            ORDER BY {order_by}
            LIMIT %s OFFSET %s
        """
        
        cursor.execute(query, (show_id, limit, offset))
        comments_data = cursor.fetchall()
        
        count_query = """
            SELECT COUNT(*) as total 
            FROM show_comments 
            WHERE show_id = %s AND parent_id IS NULL AND is_deleted = 0
        """
        cursor.execute(count_query, (show_id,))
        total_count = cursor.fetchone()[0]
        
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

@comments_bp.route('/shows/<int:show_id>/comments', methods=['POST'])
def create_show_comment(show_id):
    """Create a new comment for a show"""
    connection = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        content = data.get('content', '').strip()
        anonymous_name = data.get('anonymous_name', 'Người dùng ẩn danh').strip()
        parent_id = data.get('parent_id')
        
        if not content:
            return jsonify({'error': 'Nội dung comment không được để trống'}), 400
        if len(content) > 1000:
            return jsonify({'error': 'Comment không được vượt quá 1000 ký tự'}), 400
        if len(anonymous_name) > 100:
            anonymous_name = anonymous_name[:100]
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        if parent_id:
            cursor.execute(
                "SELECT id FROM show_comments WHERE id = %s AND show_id = %s AND is_deleted = 0",
                (parent_id, show_id)
            )
            if not cursor.fetchone():
                return jsonify({'error': 'Không tìm thấy comment gốc'}), 404
        
        insert_query = """
            INSERT INTO show_comments (show_id, content, anonymous_name, parent_id)
            VALUES (%s, %s, %s, %s)
        """
        
        cursor.execute(insert_query, (show_id, content, anonymous_name, parent_id))
        comment_id = cursor.lastrowid
        connection.commit()
        
        get_comment_query = """
            SELECT id, content, anonymous_name, likes_count, dislikes_count, created_at
            FROM show_comments WHERE id = %s
        """
        
        cursor.execute(get_comment_query, (comment_id,))
        new_comment_data = cursor.fetchone()
        
        if not new_comment_data:
            return jsonify({'error': 'Failed to retrieve created comment'}), 500
        
        if isinstance(new_comment_data, dict):
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
            formatted_comment = {
                'id': new_comment_data[0],
                'content': new_comment_data[1],
                'anonymous_name': new_comment_data[2],
                'likes_count': new_comment_data[3] or 0,
                'dislikes_count': new_comment_data[4] or 0,
                'created_at': new_comment_data[5].isoformat() if new_comment_data[5] else None,
                'replies_count': 0
            }
        
        return jsonify({
            'message': 'Tạo comment thành công',
            'comment': formatted_comment
        }), 201
        
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

@comments_bp.route('/show-comments/<int:comment_id>/replies', methods=['GET'])
def get_show_comment_replies(comment_id):
    """Get replies for a specific show comment"""
    connection = None
    cursor = None
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 5))
        offset = (page - 1) * limit
        
        connection = get_db_connection()
        cursor = connection.cursor(cursor=pymysql.cursors.DictCursor)
        
        query = """
            SELECT id, content, anonymous_name, likes_count, dislikes_count, created_at
            FROM show_comments
            WHERE parent_id = %s AND is_deleted = 0
            ORDER BY created_at ASC
            LIMIT %s OFFSET %s
        """
        
        cursor.execute(query, (comment_id, limit, offset))
        replies_data = cursor.fetchall()
        
        replies = []
        for row in replies_data:
            reply = {
                'id': row['id'],
                'content': row['content'],
                'anonymous_name': row['anonymous_name'],
                'likes_count': row['likes_count'] or 0,
                'dislikes_count': row['dislikes_count'] or 0,
                'created_at': row['created_at'].isoformat() if row['created_at'] else None,
                'replies_count': 0
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

@comments_bp.route('/show-comments/<int:comment_id>/react', methods=['POST'])
def react_to_show_comment(comment_id):
    """Like or dislike a show comment"""
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
        
        cursor.execute("SELECT id FROM show_comments WHERE id = %s AND is_deleted = 0", (comment_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Không tìm thấy comment'}), 404
        
        cursor.execute(
            "SELECT id, reaction_type FROM show_comment_reactions WHERE comment_id = %s AND user_identifier = %s",
            (comment_id, user_identifier)
        )
        existing_reaction = cursor.fetchone()
        
        if existing_reaction:
            existing_reaction_id, existing_type = existing_reaction
            if existing_type == reaction_type:
                cursor.execute(
                    "DELETE FROM show_comment_reactions WHERE comment_id = %s AND user_identifier = %s",
                    (comment_id, user_identifier)
                )
                message = 'Đã hủy reaction'
            else:
                cursor.execute(
                    "UPDATE show_comment_reactions SET reaction_type = %s WHERE comment_id = %s AND user_identifier = %s",
                    (reaction_type, comment_id, user_identifier)
                )
                message = 'Đã cập nhật reaction'
        else:
            cursor.execute(
                "INSERT INTO show_comment_reactions (comment_id, user_identifier, reaction_type) VALUES (%s, %s, %s)",
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

# ============== STATS ==============

@comments_bp.route('/comments/stats/<int:movie_id>', methods=['GET'])
def get_movie_comment_stats(movie_id):
    """Get comment statistics for a movie"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute(
            "SELECT COUNT(*) FROM comments WHERE movie_id = %s AND is_deleted = 0",
            (movie_id,)
        )
        total_comments = cursor.fetchone()[0]
        
        cursor.execute(
            "SELECT SUM(likes_count) FROM comments WHERE movie_id = %s AND is_deleted = 0",
            (movie_id,)
        )
        total_likes = cursor.fetchone()[0] or 0
        
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

@comments_bp.route('/show-comments/stats/<int:show_id>', methods=['GET'])
def get_show_comment_stats(show_id):
    """Get comment statistics for a show"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute(
            "SELECT COUNT(*) FROM show_comments WHERE show_id = %s AND is_deleted = 0",
            (show_id,)
        )
        total_comments = cursor.fetchone()[0]
        
        cursor.execute(
            "SELECT SUM(likes_count) FROM show_comments WHERE show_id = %s AND is_deleted = 0",
            (show_id,)
        )
        total_likes = cursor.fetchone()[0] or 0
        
        cursor.execute(
            "SELECT COUNT(*) FROM show_comments WHERE show_id = %s AND is_deleted = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)",
            (show_id,)
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

# ============== DEBUG ==============

@comments_bp.route('/debug-table', methods=['GET'])
def debug_table():
    """Debug table structure"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check movie comments table structure
        cursor.execute("DESCRIBE comments")
        movie_columns = cursor.fetchall()
        
        cursor.execute("SELECT COUNT(*) FROM comments")
        movie_count = cursor.fetchone()[0]
        
        # Check show comments table structure  
        cursor.execute("DESCRIBE show_comments")
        show_columns = cursor.fetchall()
        
        cursor.execute("SELECT COUNT(*) FROM show_comments")
        show_count = cursor.fetchone()[0]
        
        return jsonify({
            'movie_comments': {
                'table_structure': movie_columns,
                'total_comments': movie_count
            },
            'show_comments': {
                'table_structure': show_columns,
                'total_comments': show_count
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Debug failed: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
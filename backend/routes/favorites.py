from flask import Blueprint, request, jsonify
from db import get_db_connection
import jwt
import os

favorites_bp = Blueprint('favorites', __name__)
JWT_SECRET = os.getenv("JWT_SECRET")

def get_user_id_from_token():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    print(token)
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        print("⛔ Token hết hạn")
    except jwt.InvalidTokenError:
        print("⛔ Token không hợp lệ")
    except Exception as e:
        print("⛔ Lỗi khi decode token:", e)

    return None

@favorites_bp.route('/favorites', methods=['POST'])
def add_favorite():
    user_id = get_user_id_from_token()
    data = request.get_json()
    
    item_id = data.get('item_id') or data.get('movie_id')  # Backward compatibility
    item_type = data.get('item_type', 'movie')  # Default to movie for backward compatibility
    
    if not user_id or not item_id:
        return jsonify({'error': 'Thiếu thông tin'}), 400
    
    if item_type not in ['movie', 'show']:
        return jsonify({'error': 'Loại không hợp lệ. Chỉ chấp nhận movie hoặc show'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT IGNORE INTO favorites (user_id, item_id, item_type) VALUES (%s, %s, %s)", 
                (user_id, item_id, item_type)
            )
        conn.commit()
        return jsonify({
            'message': f'Đã thêm {item_type} vào yêu thích',
            'item_id': item_id,
            'item_type': item_type
        })
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({'error': 'DB Error'}), 500

@favorites_bp.route('/favorites/<int:item_id>', methods=['DELETE'])
def remove_favorite(item_id):
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    # Get item_type from query params (optional, for specific removal)
    item_type = request.args.get('type')

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if item_type:
                # Remove specific type
                cursor.execute(
                    "DELETE FROM favorites WHERE user_id = %s AND item_id = %s AND item_type = %s", 
                    (user_id, item_id, item_type)
                )
            else:
                # Remove all types of this item (backward compatibility)
                cursor.execute(
                    "DELETE FROM favorites WHERE user_id = %s AND item_id = %s", 
                    (user_id, item_id)
                )
        conn.commit()
        return jsonify({'message': 'Đã xoá khỏi yêu thích'})
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({'error': 'DB Error'}), 500

@favorites_bp.route('/favorites', methods=['GET'])
def get_favorites():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    # Get filter type from query params
    filter_type = request.args.get('type')  # 'movie', 'show', or None for all

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if filter_type and filter_type in ['movie', 'show']:
                cursor.execute(
                    "SELECT item_id, item_type, created_at FROM favorites WHERE user_id = %s AND item_type = %s ORDER BY created_at DESC", 
                    (user_id, filter_type)
                )
            else:
                cursor.execute(
                    "SELECT item_id, item_type, created_at FROM favorites WHERE user_id = %s ORDER BY created_at DESC", 
                    (user_id,)
                )
            
            rows = cursor.fetchall()
            
            # Format response
            favorites = []
            for row in rows:
                if isinstance(row, dict):
                    favorites.append({
                        'item_id': row['item_id'],
                        'item_type': row['item_type'],
                        'created_at': row['created_at'].isoformat() if row['created_at'] else None
                    })
                else:
                    # Handle tuple format
                    favorites.append({
                        'item_id': row[0],
                        'item_type': row[1],
                        'created_at': row[2].isoformat() if row[2] else None
                    })
            
            return jsonify({
                'favorites': favorites,
                'total': len(favorites),
                'filter_type': filter_type
            })
            
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({'error': 'DB Error'}), 500

# Backward compatibility endpoints
@favorites_bp.route('/favorites/movies', methods=['GET'])
def get_favorite_movies():
    """Get only favorite movies for backward compatibility"""
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT item_id FROM favorites WHERE user_id = %s AND item_type = 'movie'", 
                (user_id,)
            )
            rows = cursor.fetchall()
            
            # Return list of movie IDs for backward compatibility
            movie_ids = [row[0] if isinstance(row, tuple) else row['item_id'] for row in rows]
            return jsonify(movie_ids)
            
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({'error': 'DB Error'}), 500

@favorites_bp.route('/favorites/shows', methods=['GET'])
def get_favorite_shows():
    """Get only favorite shows"""
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT item_id FROM favorites WHERE user_id = %s AND item_type = 'show'", 
                (user_id,)
            )
            rows = cursor.fetchall()
            
            show_ids = [row[0] if isinstance(row, tuple) else row['item_id'] for row in rows]
            return jsonify(show_ids)
            
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({'error': 'DB Error'}), 500

@favorites_bp.route('/favorites/check/<int:item_id>', methods=['GET'])
def check_favorite(item_id):
    """Check if an item is in favorites"""
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    item_type = request.args.get('type')
    print(f"🔍 Checking favorite: user_id={user_id}, item_id={item_id}, item_type={item_type}")

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if item_type:
                query = "SELECT COUNT(*) FROM favorites WHERE user_id = %s AND item_id = %s AND item_type = %s"
                params = (user_id, item_id, item_type)
                print(f"📝 Query with type: {query}")
                print(f"📝 Params: {params}")
                cursor.execute(query, params)
            else:
                query = "SELECT COUNT(*) FROM favorites WHERE user_id = %s AND item_id = %s"
                params = (user_id, item_id)
                print(f"📝 Query without type: {query}")
                print(f"📝 Params: {params}")
                cursor.execute(query, params)
            
            result = cursor.fetchone()
            print(f"📊 Query result: {result}")
            if isinstance(result, dict):
                count = result.get('COUNT(*)', 0)
            else:
                count = result[0] if result else 0
            
            response = {
                'is_favorite': count > 0,
                'item_id': item_id,
                'item_type': item_type
            }
            print(f"✅ Response: {response}")
            return jsonify(response)
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'DB Error', 'details': str(e)}), 500
    finally:
        if conn:
            conn.close()
            print("🔐 Connection closed")
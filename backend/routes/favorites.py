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
        print("✅ Payload decoded:", payload)
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
    movie_id = request.json.get('movie_id')
    if not user_id or not movie_id:
        return jsonify({'error': 'Thiếu thông tin'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("INSERT IGNORE INTO favorites (user_id, movie_id) VALUES (%s, %s)", (user_id, movie_id))
        conn.commit()
        return jsonify({'message': 'Đã thêm vào yêu thích'})
    except:
        return jsonify({'error': 'DB Error'}), 500

@favorites_bp.route('/favorites/<int:movie_id>', methods=['DELETE'])
def remove_favorite(movie_id):
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM favorites WHERE user_id = %s AND movie_id = %s", (user_id, movie_id))
        conn.commit()
        return jsonify({'message': 'Đã xoá khỏi yêu thích'})
    except:
        return jsonify({'error': 'DB Error'}), 500

@favorites_bp.route('/favorites', methods=['GET'])
def get_favorites():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT movie_id FROM favorites WHERE user_id = %s", (user_id,))
            rows = cursor.fetchall()
        return jsonify([row['movie_id'] for row in rows])
    except:
        return jsonify({'error': 'DB Error'}), 500

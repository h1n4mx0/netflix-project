from flask import Blueprint, request, jsonify
from db import get_db_connection
import jwt
import datetime
import os

login_bp = Blueprint('login', __name__)
JWT_SECRET = os.getenv("JWT_SECRET")

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    print("Connecting to database...")
    if not conn:
        return jsonify({'error': 'Không thể kết nối đến cơ sở dữ liệu'}), 500
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if not user:
                return jsonify({'error': 'Email không tồn tại'}), 401

            if user['password'] != password:
                return jsonify({'error': 'Sai mật khẩu'}), 401
            
            if not user['is_verified']:
                return jsonify({'error': 'Tài khoản chưa xác minh qua email'}), 403
            
            payload = {
                'user_id': user['id'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
            }

            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
            return jsonify({'token': token})

    except Exception as e:
        return jsonify({'error': 'Lỗi server'}), 500


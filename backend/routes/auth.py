from flask import Blueprint, request, jsonify
from db import get_db_connection
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__)
JWT_SECRET = os.getenv("JWT_SECRET")

@auth_bp.route('/login', methods=['POST'])
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

            payload = {
                'user_id': user['id'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
            }

            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
            return jsonify({'token': token})

    except Exception as e:
        return jsonify({'error': 'Lỗi server'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    phone = data.get("phone")
    birthdate = data.get("birthdate")  # định dạng YYYY-MM-DD

    if not all([name, email, password, phone, birthdate]):
        return jsonify({'error': 'Thiếu thông tin'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({'error': 'Email đã tồn tại'}), 409

            cursor.execute(
                "INSERT INTO users (name, email, password, phone, birthdate) VALUES (%s, %s, %s, %s, %s)",
                (name, email, password, phone, birthdate)
            )
        conn.commit()
        return jsonify({'message': 'Đăng ký thành công'}), 201
    except Exception as e:
        print("[❌ Register Error]", e)
        return jsonify({'error': 'Lỗi server'}), 500
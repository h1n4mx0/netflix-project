from flask import Blueprint, request, jsonify
from db import get_db_connection
import uuid
from utils.email_utils import send_verification_email  # helper for sending verification email

register_bp = Blueprint('register', __name__)

@register_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    phone = data.get("phone")
    birthdate = data.get("birthdate")  # định dạng YYYY-MM-DD

    if not all([name, email, password, phone, birthdate]):
        return jsonify({'error': 'Thiếu thông tin'}), 400

    verification_token = str(uuid.uuid4())  # tạo token xác minh

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({'error': 'Email đã tồn tại'}), 409

            cursor.execute("""
                INSERT INTO users (name, email, password, phone, birthdate, is_verified, verification_token)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (name, email, password, phone, birthdate, False, verification_token))
        conn.commit()

        # Gửi email xác minh
        verify_url = f"http://localhost:5173/verify?token={verification_token}"  # hoặc dùng domain thật
        send_verification_email(email, verify_url)

        return jsonify({'message': 'Đăng ký thành công, vui lòng kiểm tra email để xác minh'}), 201
    except Exception as e:
        print("[❌ Register Error]", e)
        return jsonify({'error': 'Lỗi server'}), 500




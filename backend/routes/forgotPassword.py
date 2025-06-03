import datetime
from flask import Blueprint, request, jsonify
from db import get_db_connection
import uuid
from utils.email_utils import send_verification_email  
forgot_password_bp = Blueprint('forgot_password', __name__)

@forgot_password_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'Email không tồn tại'}), 404

        token = str(uuid.uuid4())
        expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)

        cursor.execute("""
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (%s, %s, %s)
        """, (user['id'], token, expires))
        conn.commit()

    reset_link = f"http://localhost:5173/reset-password?token={token}"
    send_verification_email(email, reset_link)  # tái sử dụng hàm gửi mail

    return jsonify({'message': 'Đã gửi email khôi phục mật khẩu'})


@forgot_password_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    print("Reset token:", token)
    new_password = data.get('new_password')

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT user_id FROM password_reset_tokens
            WHERE token = %s
        """, (token,))
        row = cursor.fetchone()
        
        print("Token row:", row)
        if not row:
            return jsonify({'error': 'Token không hợp lệ hoặc đã hết hạn'}), 400

        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (new_password, row['user_id']))
        cursor.execute("UPDATE password_reset_tokens SET used = TRUE WHERE token = %s", (token,))
        conn.commit()

    return jsonify({'message': 'Đổi mật khẩu thành công'})

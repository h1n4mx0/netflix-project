from flask import Blueprint, request, jsonify
from db import get_db_connection
import uuid
from utils.email_utils import send_verification_email  

verify_bp = Blueprint('verify', __name__)

@verify_bp.route('/verify', methods=['GET'])
def verify_email():
    token = request.args.get('token')
    if not token:
        return jsonify({'error': 'Thiếu token'}), 400

    conn = get_db_connection()
    print("hellooooooooooooooooooooooooooooooooooooooooooooo")
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE verification_token = %s", (token,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'Token không hợp lệ'}), 400

        cursor.execute("UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = %s", (user['id'],))
        conn.commit()

    return jsonify({'message': 'Tài khoản đã được xác thực thành công'})

@verify_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.get_json()
    email = data.get('email')

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE email = %s AND is_verified = FALSE", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'Email không tồn tại hoặc đã xác minh'}), 404

        token = str(uuid.uuid4())
        cursor.execute("UPDATE users SET verification_token = %s WHERE id = %s", (token, user['id']))
        conn.commit()

        verify_url = f"http://localhost:5173/verify?token={token}"  
        send_verification_email(email, verify_url)

        return jsonify({'message': 'Email xác minh mới đã được gửi'}), 200
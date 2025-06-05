import datetime
from flask import Blueprint, request, jsonify
from db import get_db_connection
from utils.utils import get_user_id_from_token

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT name, email, birthdate, phone FROM users WHERE id = %s
        """, (user_id,))
        user = cursor.fetchone()
        return jsonify(user)
    
@profile_bp.route('/profile', methods=['PUT'])
def update_profile():
    user_id = get_user_id_from_token()
    data = request.get_json()
    name = data.get("name")
    birthdate_raw = data.get("birthdate")
    phone = data.get("phone")
    if not user_id or not name or not phone:
        return jsonify({'error': 'Thiếu dữ liệu'}), 400

    conn = get_db_connection()
    with conn.cursor() as cursor:
        if not birthdate_raw:
            cursor.execute("SELECT birthdate FROM users WHERE id = %s", (user_id,))
            birthdate = cursor.fetchone()["birthdate"]
        else:
            try:
                birthdate = datetime.datetime.strptime(
                    birthdate_raw[:10], '%Y-%m-%d'
                ).date()
            except:
                return jsonify({'error': 'Định dạng ngày không hợp lệ'}), 400
        cursor.execute("""
            UPDATE users
            SET name = %s, birthdate = %s, phone = %s
            WHERE id = %s
        """, (name, birthdate,phone, user_id))
    conn.commit()
    return jsonify({'message': 'Cập nhật thành công'})


@profile_bp.route('/change-password', methods=['POST'])
def change_password():
    user_id = get_user_id_from_token()
    data = request.get_json()
    old = data.get("old_password")
    new = data.get("new_password")

    if not old or not new:
        return jsonify({'error': 'Thiếu thông tin'}), 400

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT password FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user or user['password'] != old:
            return jsonify({'error': 'Sai mật khẩu cũ'}), 400

        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (new, user_id))
        conn.commit()
    return jsonify({'message': 'Đổi mật khẩu thành công'})


# @profile_bp.route('/history', methods=['GET'])
# def get_history():
#     user_id = get_user_id_from_token()
#     conn = get_db_connection()
#     with conn.cursor() as cursor:
#         cursor.execute("""
#             SELECT m.id, m.title, m.poster_path, h.viewed_at
#             FROM history h
#             JOIN movies m ON h.movie_id = m.id
#             WHERE h.user_id = %s
#             ORDER BY h.viewed_at DESC
#             LIMIT 20
#         """, (user_id,))
#         rows = cursor.fetchall()
#     return jsonify(rows)


# @profile_bp.route('/history', methods=['POST'])
# def log_view_history():
#     user_id = get_user_id_from_token()
#     movie_id = request.json.get("movie_id")
#     if not user_id or not movie_id:
#         return jsonify({'error': 'Thiếu dữ liệu'}), 400

#     conn = get_db_connection()
#     with conn.cursor() as cursor:
#         cursor.execute("""
#             INSERT INTO history (user_id, movie_id, viewed_at)
#             VALUES (%s, %s, NOW())
#         """, (user_id, movie_id))
#         conn.commit()
#     return jsonify({'message': 'Đã ghi vào lịch sử'})




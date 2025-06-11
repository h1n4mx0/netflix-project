from functools import wraps
from flask import request, jsonify
from utils.utils import get_user_id_from_token
from db import get_db_connection

def admin_required(f):
    """Decorator to check if user has admin privileges"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get user from token
        user_id = get_user_id_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Check if user is admin
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT role FROM users WHERE id = %s", 
                    (user_id,)
                )
                user = cursor.fetchone()
                print(f"🔍 User role check: user_id={user_id}, role={user.get('role', 'None') if user else 'None'}")
                if not user or not user.get('role', False):
                    return jsonify({'error': 'Admin access required'}), 403
                    
        except Exception as e:
            return jsonify({'error': 'Database error'}), 500
        finally:
            conn.close()
            
        return f(*args, **kwargs)
    return decorated_function
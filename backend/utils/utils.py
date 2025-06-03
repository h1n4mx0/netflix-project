from flask import request
import jwt
import os 

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
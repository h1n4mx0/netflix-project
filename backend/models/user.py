from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId

class UserModel:
    def __init__(self, db):
        self.users = db['users']

    def create_user(self, email, password):
        # check trùng email
        if self.users.find_one({'email': email}):
            return None  # hoặc raise error nếu muốn

        hashed_pw = generate_password_hash(password)
        result = self.users.insert_one({
            'email': email,
            'password': hashed_pw,
        })
        return str(result.inserted_id)

    def find_by_email(self, email):
        return self.users.find_one({'email': email})

    def verify_password(self, plain_password, hashed_password):
        return check_password_hash(hashed_password, plain_password)

    def get_by_id(self, user_id):
        return self.users.find_one({'_id': ObjectId(user_id)})

from flask import Flask,send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from routes.movies import movies_bp
from routes.favorites import favorites_bp
from routes.login import login_bp
from routes.register import register_bp
from routes.verify import verify_bp
from routes.profile import profile_bp
from routes.forgotPassword import forgot_password_bp

load_dotenv()

app = Flask(__name__, static_folder="static")
CORS(app)

@app.route('/api/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)


# Import route
app.register_blueprint(profile_bp, url_prefix='/api')
app.register_blueprint(login_bp, url_prefix='/api')
app.register_blueprint(register_bp, url_prefix='/api')
app.register_blueprint(forgot_password_bp, url_prefix='/api')
app.register_blueprint(verify_bp, url_prefix='/api')
app.register_blueprint(movies_bp, url_prefix='/api')
app.register_blueprint(favorites_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)

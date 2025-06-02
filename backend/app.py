from flask import Flask,send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from routes.movies import movies_bp
from routes.favorites import favorites_bp


load_dotenv()

app = Flask(__name__, static_folder="static")
CORS(app)

@app.route('/api/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)


# Import route
from routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(movies_bp, url_prefix='/api')
app.register_blueprint(favorites_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)

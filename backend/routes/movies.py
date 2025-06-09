import json
from flask import Blueprint, jsonify, request
from db import get_db_connection

movies_bp = Blueprint('movies', __name__)

@movies_bp.route('/movies', methods=['GET'])
def get_movies():
    movie_type = request.args.get("type")
    conn = get_db_connection()

    try:
        with conn:
            with conn.cursor() as cursor:
                if movie_type:
                    cursor.execute("SELECT * FROM movies WHERE tag = %s", (movie_type,))
                else:
                    cursor.execute("SELECT * FROM movies ORDER BY created_at DESC LIMIT 50")

                movies = cursor.fetchall()

        result = [{
            'id': m['id'],
            'title': m['title'],
            'poster_path': f"/api/static/posters/{m['poster_path']}" if m['poster_path'] else None,
            'backdrop_path': f"/api/static/backdrops/{m['backdrop_path']}" if m['backdrop_path'] else None,
            'overview': m['overview'],
            'release_date': m['release_date'].strftime('%Y-%m-%d') if m['release_date'] else ''
        } for m in movies]

        return jsonify(result)

    except Exception as e:
        print("[❌ DB ERROR]", e)
        return jsonify({'error': 'Lỗi server hoặc DB'}), 500


# ✅ API mới: Lấy chi tiết 1 phim theo ID
@movies_bp.route('/movies/<int:movie_id>', methods=['GET'])
def get_movie_detail(movie_id):
    conn = get_db_connection()

    try:
        with conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM movies WHERE id = %s", (movie_id,))
                m = cursor.fetchone()

        if not m:
            return jsonify({'error': 'Phim không tồn tại'}), 404


        movie = {
            'id': m['id'],
            'title': m['title'],
            'original_title': m.get('original_title'),
            'poster_path': f"/api/static/posters/{m['poster_path']}" if m['poster_path'] else None,
            'backdrop_path': f"/api/static/backdrops/{m['backdrop_path']}" if m['backdrop_path'] else None,
            'overview': m['overview'],
            'release_date': m['release_date'].strftime('%Y-%m-%d') if m['release_date'] else '',
            'genre_ids': m.get('genre_ids'),
            'original_language': m.get('original_language'),
            'vote_average': m.get('vote_average'),
            'vote_count': m.get('vote_count'),
            'runtime': m.get('runtime'),
            'cast': json.loads(m['cast']) if m.get('cast') else []  # 👈 convert từ chuỗi JSON sang object
        }



        return jsonify(movie)

    except Exception as e:
        print("[❌ DB ERROR]", e)
        return jsonify({'error': 'Lỗi server hoặc DB'}), 500




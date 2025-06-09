from flask import Blueprint, jsonify, request
from db import get_db_connection

search_bp = Blueprint('search', __name__)

@search_bp.route('/search', methods=['GET'])
def search_all():
    query = request.args.get("q")
    if not query:
        return jsonify([])

    conn = get_db_connection()

    try:
        with conn:
            with conn.cursor() as cursor:
                like_query = f"%{query.lower()}%"

                # Search in movies
                cursor.execute("""
                    SELECT id, title, poster_path, backdrop_path, overview, release_date,
                           'movie' AS content_type
                    FROM movies
                    WHERE LOWER(title) LIKE %s OR LOWER(overview) LIKE %s OR LOWER(tag) LIKE %s
                    ORDER BY created_at DESC
                    LIMIT 25
                """, (like_query, like_query, like_query))
                movies = cursor.fetchall()

                # Search in shows (title + description)
                cursor.execute("""
                    SELECT id, title, show_poster AS poster_path, NULL AS backdrop_path,
                        description AS overview, NULL AS release_date,
                        'show' AS content_type
                    FROM shows
                    WHERE LOWER(title) LIKE %s OR LOWER(description) LIKE %s
                    ORDER BY created_at DESC
                    LIMIT 25
                """, (like_query, like_query))
                shows = cursor.fetchall()

        # Merge and format result
        combined = list(movies) + list(shows)
        result = []
        for row in combined:
            poster_path = row['poster_path']
            poster_prefix = "/api/static/posters/" if row['content_type'] == 'movie' else "/api/static/show-poster/"
            result.append({
                'id': row['id'],
                'title': row['title'],
                'poster_path': f"{poster_prefix}{poster_path}" if poster_path else None,
                'backdrop_path': f"/api/static/backdrops/{row['backdrop_path']}" if row.get('backdrop_path') else None,
                'overview': row['overview'],
                'release_date': row['release_date'].strftime('%Y-%m-%d') if row.get('release_date') else '',
                'type': row['content_type']  # 'movie' or 'show'
            })

        return jsonify(result)

    except Exception as e:
        print("[❌ SEARCH ERROR]", e)
        return jsonify({'error': 'Lỗi tìm kiếm từ server'}), 500
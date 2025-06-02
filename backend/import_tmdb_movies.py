import os
import sys
import requests
import pymysql
from dotenv import load_dotenv
from urllib.parse import urlsplit
import json

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT")),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "cursorclass": pymysql.cursors.DictCursor
}

ENDPOINTS = {
    "trending": f"https://api.themoviedb.org/3/trending/movie/week?api_key={TMDB_API_KEY}&language=vi-VN",
    "top_rated": f"https://api.themoviedb.org/3/movie/top_rated?api_key={TMDB_API_KEY}&language=vi-VN",
    "upcoming": f"https://api.themoviedb.org/3/movie/upcoming?api_key={TMDB_API_KEY}&language=vi-VN"
}

def download_image(url, folder):
    if not url:
        return None
    try:
        filename = os.path.basename(urlsplit(url).path)
        folder_path = os.path.join('static', folder)
        os.makedirs(folder_path, exist_ok=True)

        path = os.path.join(folder_path, filename)
        if not os.path.exists(path):
            img_data = requests.get(f"https://image.tmdb.org/t/p/w500{url}").content
            with open(path, 'wb') as f:
                f.write(img_data)
        return filename
    except Exception as e:
        print(f"[❌ Lỗi tải ảnh {url}]:", e)
        return None

def fetch_movies(movie_type):
    url = ENDPOINTS.get(movie_type)
    if not url:
        print(f"[❌] Loại phim không hợp lệ: {movie_type}")
        return []

    res = requests.get(url)
    return res.json().get("results", [])

def fetch_movie_detail(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&language=vi-VN"
    try:
        res = requests.get(url)
        return res.json()
    except Exception as e:
        print(f"[❌] Lỗi lấy chi tiết phim {movie_id}:", e)
        return {}

def fetch_movie_cast(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}/credits"
    try:
        res = requests.get(url, params={"api_key": TMDB_API_KEY, "language": "vi-VN"})
        credits = res.json()
        cast = []
        for c in credits.get("cast", [])[:10]:
            profile_path = c["profile_path"]
            local_filename = download_image(profile_path, 'cast') if profile_path else None
            cast.append({
                "name": c["name"],
                "character": c["character"],
                "profile_path": f"/api/static/cast/{local_filename}" if local_filename else None
            })
        return json.dumps(cast, ensure_ascii=False)
    except Exception as e:
        print(f"[❌] Lỗi lấy diễn viên cho phim {movie_id}:", e)
        return "[]"

def insert_movies(movies, tag):
    conn = pymysql.connect(**DB_CONFIG)
    inserted = 0

    with conn:
        with conn.cursor() as cursor:
            for movie in movies:
                try:
                    detail = fetch_movie_detail(movie['id'])
                    cast_json = fetch_movie_cast(movie['id'])

                    poster_file = download_image(movie.get('poster_path'), 'posters')
                    backdrop_file = download_image(movie.get('backdrop_path'), 'backdrops')

                    cursor.execute("""
                        INSERT INTO movies 
                        (tmdb_id, title, original_title, overview, poster_path, backdrop_path, release_date, genre_ids, original_language, vote_average, vote_count, runtime, tag, cast)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            title=VALUES(title), 
                            overview=VALUES(overview),
                            poster_path=VALUES(poster_path),
                            backdrop_path=VALUES(backdrop_path),
                            release_date=VALUES(release_date),
                            genre_ids=VALUES(genre_ids),
                            original_language=VALUES(original_language),
                            vote_average=VALUES(vote_average),
                            vote_count=VALUES(vote_count),
                            runtime=VALUES(runtime),
                            tag=VALUES(tag),
                            cast=VALUES(cast)
                    """, (
                        movie['id'],
                        movie.get('title') or movie.get('name'),
                        detail.get('original_title'),
                        movie.get('overview'),
                        poster_file,
                        backdrop_file,
                        movie.get('release_date'),
                        str(movie.get('genre_ids')),
                        detail.get('original_language'),
                        detail.get('vote_average'),
                        detail.get('vote_count'),
                        detail.get('runtime'),
                        tag,
                        cast_json
                    ))
                    inserted += cursor.rowcount
                except Exception as e:
                    print(f"[❌ Lỗi insert phim ID {movie['id']}]:", e)

        conn.commit()
    print(f"[✅ Đã thêm/cập nhật {inserted} phim loại {tag}]")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("⚠️ Hãy chạy: python import_tmdb_movies.py [trending|top_rated|upcoming]")
        sys.exit(1)

    movie_type = sys.argv[1]
    print(f"🚀 Đang lấy dữ liệu từ TMDB ({movie_type})...")
    data = fetch_movies(movie_type)
    insert_movies(data, tag=movie_type)
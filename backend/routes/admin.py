# routes/admin.py - Updated with admin middleware
import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from db import get_db_connection
from utils.utils import get_user_id_from_token
from utils.check_admin import admin_required
import json
from PIL import Image
import logging

admin_bp = Blueprint('admin', __name__)

# Configuration
UPLOAD_FOLDER = 'static'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'}
MAX_FILE_SIZE = 16 * 1024 * 1024 * 1024  # 16GB

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def save_image(file, folder):
    """Save and optimize image file"""
    print(f"[DEBUG] save_image called with file={file.filename}, folder={folder}")
    if file and allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        # Generate unique filename
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
        
        # Create directory if it doesn't exist
        save_path = os.path.join(UPLOAD_FOLDER, folder)
        os.makedirs(save_path, exist_ok=True)
        
        # Full file path
        file_path = os.path.join(save_path, unique_filename)
        
        try:
            # Save original file
            file.save(file_path)
            
            # Optimize image if it's too large
            with Image.open(file_path) as img:
                # Convert RGBA to RGB if necessary
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                
                # Resize if too large
                if folder == 'posters':
                    max_size = (500, 750)  # Poster size
                elif folder == 'backdrops':
                    max_size = (1920, 1080)  # Backdrop size
                else:
                    max_size = (800, 600)
                
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                img.save(file_path, optimize=True, quality=85)
            
            return unique_filename
        except Exception as e:
            logging.error(f"Error saving image: {e}")
            # Remove file if error occurred
            if os.path.exists(file_path):
                os.remove(file_path)
            return None
    return None

def save_video(file):
    """Save video file"""
    print(f"[DEBUG] save_video called with file={file.filename}")
    if file and allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS):
        # Generate unique filename
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
        
        # Create directory if it doesn't exist
        save_path = os.path.join(UPLOAD_FOLDER, 'videos')
        os.makedirs(save_path, exist_ok=True)
        
        # Full file path
        file_path = os.path.join(save_path, unique_filename)
        
        try:
            file.save(file_path)
            return unique_filename
        except Exception as e:
            logging.error(f"Error saving video: {e}")
            return None
    return None

@admin_bp.route('/admin/upload-movie', methods=['POST'])
@admin_required
def upload_movie():
    """Upload a new movie"""
    print("[DEBUG] upload_movie endpoint called")
    try:
        # Get form data
        title = request.form.get('title', '').strip()
        original_title = request.form.get('original_title', '').strip()
        overview = request.form.get('overview', '').strip()
        release_date = request.form.get('release_date', '').strip()
        genre_ids = request.form.get('genre_ids', '').strip()
        original_language = request.form.get('original_language', 'vi')
        vote_average = float(request.form.get('vote_average', 0))
        vote_count = int(request.form.get('vote_count', 0))
        runtime = int(request.form.get('runtime', 0))
        tag = request.form.get('tag', 'trending')
        cast_json = request.form.get('cast', '[]')
        
        # Validate required fields
        if not title or not overview or not release_date:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Parse cast data
        try:
            cast_data = json.loads(cast_json)
        except json.JSONDecodeError:
            cast_data = []
        
        # Handle file uploads
        poster_filename = None
        backdrop_filename = None
        video_filename = None
        
        # Save poster (required)
        if 'poster' in request.files:
            print("[DEBUG] Poster file found in request.files")
            poster_file = request.files['poster']
            if poster_file.filename:
                poster_filename = save_image(poster_file, 'posters')
                if not poster_filename:
                    return jsonify({'error': 'Failed to save poster image'}), 400
        
        if not poster_filename:
            return jsonify({'error': 'Poster is required'}), 400
        
        # Save backdrop (optional)
        if 'backdrop' in request.files:
            print("[DEBUG] Backdrop file found in request.files")
            backdrop_file = request.files['backdrop']
            if backdrop_file.filename:
                backdrop_filename = save_image(backdrop_file, 'backdrops')
        
        # Save video (optional)
        if 'video' in request.files:
            print("[DEBUG] Video file found in request.files")
            video_file = request.files['video']
            if video_file.filename:
                video_filename = save_video(video_file)
        
        # Insert movie into database
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                print("[DEBUG] Inserting movie into database")
                insert_query = """
                    INSERT INTO movies (
                        title, original_title, overview, release_date, genre_ids,
                        original_language, vote_average, vote_count, runtime,
                        poster_path, backdrop_path, video_file, tag, cast, created_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
                    )
                """
                
                cursor.execute(insert_query, (
                    title, original_title, overview, release_date, genre_ids,
                    original_language, vote_average, vote_count, runtime,
                    poster_filename, backdrop_filename, video_filename, tag,
                    json.dumps(cast_data)
                ))
                
                movie_id = cursor.lastrowid
                conn.commit()
                
                print(f"[DEBUG] Movie inserted with ID: {movie_id}")
                return jsonify({
                    'message': 'Movie uploaded successfully',
                    'movie_id': movie_id,
                    'poster': poster_filename,
                    'backdrop': backdrop_filename,
                    'video': video_filename
                }), 201
                
        except Exception as e:
            print(f"[DEBUG] Exception during DB insert: {e}")
            conn.rollback()
            
            # Clean up uploaded files if database insert failed
            for filename, folder in [
                (poster_filename, 'posters'),
                (backdrop_filename, 'backdrops'),
                (video_filename, 'videos')
            ]:
                if filename:
                    file_path = os.path.join(UPLOAD_FOLDER, folder, filename)
                    if os.path.exists(file_path):
                        os.remove(file_path)
            
            return jsonify({'error': 'Failed to save movie to database'}), 500
            
        finally:
            conn.close()
            
    except Exception as e:
        print(f"[DEBUG] Exception in upload_movie: {e}")
        logging.error(f"Upload error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/admin/movies', methods=['GET'])
@admin_required
def get_admin_movies():
    """Get all movies for admin management"""
    print("[DEBUG] get_admin_movies endpoint called")
    try:
        print(f"[DEBUG] Query params: page={request.args.get('page')}, limit={request.args.get('limit')}, search={request.args.get('search')}")
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search', '').strip()
        
        offset = (page - 1) * limit
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                print("[DEBUG] Fetching movies from database")
                # Base query
                base_query = """
                    FROM movies 
                    WHERE 1=1
                """
                params = []
                
                # Add search filter
                if search:
                    base_query += " AND (title LIKE %s OR original_title LIKE %s)"
                    search_param = f"%{search}%"
                    params.extend([search_param, search_param])
                
                # Get total count
                count_query = "SELECT COUNT(*) " + base_query
                cursor.execute(count_query, params)
                total_count = cursor.fetchone()['COUNT(*)']
                
                # Get movies
                movies_query = f"""
                    SELECT id, title, original_title, poster_path, backdrop_path,
                           release_date, vote_average, tag, created_at
                    {base_query}
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                """
                cursor.execute(movies_query, params + [limit, offset])
                movies = cursor.fetchall()
                
                # Format response
                formatted_movies = []
                for movie in movies:
                    formatted_movies.append({
                        'id': movie['id'],
                        'title': movie['title'],
                        'original_title': movie['original_title'],
                        'poster_path': f"/api/static/posters/{movie['poster_path']}" if movie['poster_path'] else None,
                        'backdrop_path': f"/api/static/backdrops/{movie['backdrop_path']}" if movie['backdrop_path'] else None,
                        'release_date': movie['release_date'].strftime('%Y-%m-%d') if movie['release_date'] else '',
                        'vote_average': movie['vote_average'],
                        'tag': movie['tag'],
                        'created_at': movie['created_at'].isoformat() if movie['created_at'] else None
                    })
                
                print(f"[DEBUG] Total movies found: {total_count}")
                print(f"[DEBUG] Movies returned: {len(formatted_movies)}")
                
                return jsonify({
                    'movies': formatted_movies,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total_count,
                        'totalPages': (total_count + limit - 1) // limit if total_count > 0 else 1
                    }
                }), 200
                
        finally:
            conn.close()
            
    except Exception as e:
        print(f"[DEBUG] Exception in get_admin_movies: {e}")
        logging.error(f"Get movies error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/admin/movies/<int:movie_id>', methods=['DELETE'])
@admin_required
def delete_movie(movie_id):
    """Delete a movie"""
    print(f"[DEBUG] delete_movie endpoint called for movie_id={movie_id}")
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                print("[DEBUG] Fetching movie info for deletion")
                # Get movie info first
                cursor.execute(
                    "SELECT poster_path, backdrop_path, video_file FROM movies WHERE id = %s",
                    (movie_id,)
                )
                movie = cursor.fetchone()
                
                if not movie:
                    print(f"[DEBUG] Movie with id={movie_id} not found")
                    return jsonify({'error': 'Movie not found'}), 404
                
                print("[DEBUG] Deleting movie from database")
                # Delete movie from database
                cursor.execute("DELETE FROM movies WHERE id = %s", (movie_id,))
                conn.commit()
                
                print("[DEBUG] Deleting associated files")
                # Delete associated files
                for filename, folder in [
                    (movie['poster_path'], 'posters'),
                    (movie['backdrop_path'], 'backdrops'),
                    (movie['video_file'], 'videos')
                ]:
                    if filename:
                        file_path = os.path.join(UPLOAD_FOLDER, folder, filename)
                        if os.path.exists(file_path):
                            os.remove(file_path)
                
                return jsonify({'message': 'Movie deleted successfully'}), 200
                
        finally:
            conn.close()
            
    except Exception as e:
        print(f"[DEBUG] Exception in delete_movie: {e}")
        logging.error(f"Delete movie error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    """Get admin dashboard statistics"""
    print("[DEBUG] get_admin_stats endpoint called")
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                print("[DEBUG] Fetching stats from database")
                stats = {}
                
                # Total movies
                cursor.execute("SELECT COUNT(*) as count FROM movies")
                stats['total_movies'] = cursor.fetchone()['count']
                
                # Total users
                cursor.execute("SELECT COUNT(*) as count FROM users")
                stats['total_users'] = cursor.fetchone()['count']
                
                # Total comments
                cursor.execute("SELECT COUNT(*) as count FROM comments WHERE is_deleted = 0")
                stats['total_comments'] = cursor.fetchone()['count']
                
                # Movies by tag
                cursor.execute("""
                    SELECT tag, COUNT(*) as count 
                    FROM movies 
                    GROUP BY tag
                """)
                stats['movies_by_tag'] = {row['tag']: row['count'] for row in cursor.fetchall()}
                
                # Recent uploads (last 7 days)
                cursor.execute("""
                    SELECT COUNT(*) as count 
                    FROM movies 
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                """)
                stats['recent_uploads'] = cursor.fetchone()['count']
                
                print(f"[DEBUG] Stats: {stats}")
                
                return jsonify(stats), 200
                
        finally:
            conn.close()
    except Exception as e:
        print(f"[DEBUG] Exception in get_admin_stats: {e}")
        logging.error(f"Get stats error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
import os
import uuid
import json
import logging
import subprocess
import shutil
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from db import get_db_connection
from utils.check_admin import admin_required
from PIL import Image

admin_bp = Blueprint('admin', __name__)

# Video processing configuration
MOVIE_VIDEO_PATH = os.getenv("MOVIE_VIDEO_PATH", "C:/Users/PC/Desktop/netflix-project/video/movie")
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm'}
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "C:/Users/PC/Desktop/netflix-project/backend/static")
FFMPEG_PATH = "ffmpeg"  # Đảm bảo ffmpeg đã được thêm vào PATH

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
def allowed_file(filename, allowed_extensions):
    """Check if file extension is allowed"""
    return '.' in filename and \
           os.path.splitext(filename)[1].lower() in allowed_extensions

def clean_filename(filename):
    """Clean filename for use as folder name"""
    # Remove extension and clean special characters
    name = os.path.splitext(filename)[0]
    # Replace special characters with underscore
    import re
    clean_name = re.sub(r'[^\w\s-]', '_', name)
    # Replace spaces with underscore
    clean_name = re.sub(r'\s+', '_', clean_name)
    return clean_name

def process_video_to_hls(input_file_path, output_dir, base_name):
    """Convert video to HLS format using FFmpeg"""
    try:
        print(f"[DEBUG] Starting HLS conversion for: {input_file_path}")
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Output files
        playlist_file = os.path.join(output_dir, f"{base_name}.m3u8")
        
        # FFmpeg command for HLS conversion
        ffmpeg_cmd = [
            FFMPEG_PATH,
            "-i", input_file_path,
            "-profile:v", "baseline",
            "-level", "3.0", 
            "-start_number", "0",
            "-hls_time", "10",
            "-hls_list_size", "0",
            "-f", "hls",
            "-hls_segment_filename", os.path.join(output_dir, f"{base_name}_%03d.ts"),
            playlist_file
        ]
        
        print(f"[DEBUG] FFmpeg command: {' '.join(ffmpeg_cmd)}")
        
        # Run FFmpeg
        result = subprocess.run(
            ffmpeg_cmd,
            capture_output=True,
            text=True,
            timeout=3600  # 1 hour timeout
        )
        
        if result.returncode == 0:
            print(f"[DEBUG] HLS conversion successful. Playlist: {playlist_file}")
            return playlist_file
        else:
            print(f"[DEBUG] FFmpeg error: {result.stderr}")
            logging.error(f"FFmpeg conversion failed: {result.stderr}")
            return None
            
    except subprocess.TimeoutExpired:
        print("[DEBUG] FFmpeg conversion timed out")
        logging.error("FFmpeg conversion timed out")
        return None
    except Exception as e:
        print(f"[DEBUG] Exception during video processing: {e}")
        logging.error(f"Video processing error: {e}")
        return None

def save_and_process_video(file, movie_title):
    """Save video file and convert to HLS"""
    print(f"[DEBUG] save_and_process_video called with file={file.filename}")
    
    if not file or not allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS):
        return None, None
    
    try:
        # Create movie folder name from title
        clean_title = clean_filename(movie_title) if movie_title else clean_filename(file.filename)
        movie_folder = os.path.join(MOVIE_VIDEO_PATH, clean_title)
        
        # Create temporary file for processing
        temp_dir = os.path.join(MOVIE_VIDEO_PATH, "temp")
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save original file temporarily
        original_filename = secure_filename(file.filename)
        temp_file_path = os.path.join(temp_dir, f"temp_{uuid.uuid4().hex[:8]}_{original_filename}")
        
        print(f"[DEBUG] Saving temp file to: {temp_file_path}")
        file.save(temp_file_path)
        
        # Generate HLS base name
        hls_base_name = clean_filename(movie_title) if movie_title else "movie"
        
        # Process video to HLS
        print(f"[DEBUG] Converting to HLS in folder: {movie_folder}")
        playlist_path = process_video_to_hls(temp_file_path, movie_folder, hls_base_name)
        
        if playlist_path:
            # Calculate relative path for database storage
            relative_playlist_path = os.path.relpath(playlist_path, MOVIE_VIDEO_PATH)
            relative_playlist_path = relative_playlist_path.replace("\\", "/")  # Use forward slashes
            
            print(f"[DEBUG] HLS conversion successful. Relative path: {relative_playlist_path}")
            
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            
            return relative_playlist_path, movie_folder
        else:
            # Clean up temp file on failure
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            return None, None
            
    except Exception as e:
        print(f"[DEBUG] Error in save_and_process_video: {e}")
        logging.error(f"Error processing video: {e}")
        return None, None

@admin_bp.route('/admin/upload-movie', methods=['POST'])
@admin_required
def upload_movie():
    """Upload a new movie with HLS video processing"""
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
        video_file_path = None
        video_folder = None
        
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
        
        # Process video (optional but convert to HLS if provided)
        if 'video' in request.files:
            print("[DEBUG] Video file found in request.files")
            video_file = request.files['video']
            if video_file.filename:
                print(f"[DEBUG] Processing video: {video_file.filename}")
                video_file_path, video_folder = save_and_process_video(video_file, title)
                
                if not video_file_path:
                    return jsonify({'error': 'Failed to process video file'}), 400
        
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
                    poster_filename, backdrop_filename, video_file_path, tag,
                    json.dumps(cast_data)
                ))
                
                movie_id = cursor.lastrowid
                conn.commit()
                
                print(f"[DEBUG] Movie inserted with ID: {movie_id}")
                return jsonify({
                    'message': 'Movie uploaded and processed successfully',
                    'movie_id': movie_id,
                    'poster': poster_filename,
                    'backdrop': backdrop_filename,
                    'video_playlist': video_file_path,
                    'video_folder': video_folder
                }), 201
                
        except Exception as e:
            print(f"[DEBUG] Exception during DB insert: {e}")
            conn.rollback()
            
            # Clean up uploaded files if database insert failed
            cleanup_files = []
            
            # Clean up image files
            for filename, folder in [
                (poster_filename, 'posters'),
                (backdrop_filename, 'backdrops')
            ]:
                if filename:
                    file_path = os.path.join(UPLOAD_FOLDER, folder, filename)
                    if os.path.exists(file_path):
                        cleanup_files.append(file_path)
            
            # Clean up video folder
            if video_folder and os.path.exists(video_folder):
                cleanup_files.append(video_folder)
            
            # Perform cleanup
            for file_path in cleanup_files:
                try:
                    if os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                    else:
                        os.remove(file_path)
                except:
                    pass
            
            return jsonify({'error': 'Failed to save movie to database'}), 500
            
        finally:
            conn.close()
            
    except Exception as e:
        print(f"[DEBUG] Exception in upload_movie: {e}")
        logging.error(f"Upload error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Endpoint để kiểm tra trạng thái FFmpeg
@admin_bp.route('/admin/check-ffmpeg', methods=['GET'])
def check_ffmpeg():
    """Check if FFmpeg is available"""
    try:
        result = subprocess.run([FFMPEG_PATH, "-version"], capture_output=True, text=True)
        if result.returncode == 0:
            return jsonify({
                'ffmpeg_available': True,
                'version_info': result.stdout.split('\n')[0]
            })
        else:
            return jsonify({'ffmpeg_available': False, 'error': result.stderr})
    except FileNotFoundError:
        return jsonify({
            'ffmpeg_available': False, 
            'error': 'FFmpeg not found. Please install FFmpeg and add it to PATH.'
        })
    except Exception as e:
        return jsonify({'ffmpeg_available': False, 'error': str(e)})

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
                cursor.execute("SELECT COUNT(*) as count FROM movie_comments WHERE is_deleted = 0")
                movie_comments = cursor.fetchone()['count']
                cursor.execute("SELECT COUNT(*) as count FROM show_comments WHERE is_deleted = 0")
                show_comments = cursor.fetchone()['count']
                stats['total_comments'] = movie_comments + show_comments
                
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
from flask import Blueprint, Response, request, jsonify, send_file, send_from_directory
from db import get_db_connection
import os
import mimetypes

stream_bp = Blueprint('stream', __name__)

# Đường dẫn lưu video
MOVIE_VIDEO_PATH = os.getenv("MOVIE_VIDEO_PATH", "C:/Users/PC/Desktop/netflix-project/video/movies")
SHOW_VIDEO_PATH = os.getenv("SHOW_VIDEO_PATH", "C:/Users/PC/Desktop/netflix-project/video/show/")


@stream_bp.route('/stream/show/<int:show_id>/episode/<int:episode_id>')
def stream_show_episode_hls(show_id, episode_id):
    """Stream HLS playlist (m3u8) cho show episode"""
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT se.filepath, s.title as show_name
                FROM show_episodes se
                JOIN shows s ON s.id = se.show_id
                WHERE se.show_id = %s AND se.id = %s
            """, (show_id, episode_id))
            
            result = cursor.fetchone()
            
            if not result or not result.get('filepath'):
                return jsonify({'error': 'Episode không tồn tại'}), 404
            
            # filepath từ DB: /videos/shows/1/ep1/movie.m3u8
            # Chuyển thành path thực tế
            filepath = result['filepath'].replace('/video/show/', '')
            m3u8_path = os.path.join(SHOW_VIDEO_PATH, filepath)
            print(m3u8_path)
            
            if not os.path.exists(m3u8_path):
                print(f"[❌] M3U8 file not found: {m3u8_path}")
                return jsonify({'error': 'File m3u8 không tìm thấy'}), 404
            
            # Trả về file m3u8
            response = send_file(
                m3u8_path,
                mimetype='application/vnd.apple.mpegurl',
                as_attachment=False
            )
            response.headers['Cache-Control'] = 'no-cache'
            return response
            
    except Exception as e:
        print(f"[❌ Stream Show Episode Error] {e}")
        return jsonify({'error': 'Lỗi khi stream video'}), 500

@stream_bp.route('/stream/show/<int:show_id>/episode/<int:episode_id>/<path:segment>')
def stream_show_segment(show_id, episode_id, segment):
    """Stream các file .ts segments cho HLS"""
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT filepath
                FROM show_episodes
                WHERE show_id = %s AND id = %s
            """, (show_id, episode_id))
            
            result = cursor.fetchone()
            
            if not result:
                return jsonify({'error': 'Episode không tồn tại'}), 404
            
            # Lấy thư mục chứa file m3u8
            filepath = result['filepath'].replace('/video/show/', '')
            episode_dir = os.path.dirname(SHOW_VIDEO_PATH+filepath)
            print(episode_dir)
            # Path đến file .ts
            ts_path = f"{episode_dir}/"+segment
            
            if not os.path.exists(ts_path):
                print(f"[❌] TS segment not found: {ts_path}")
                return jsonify({'error': 'Segment không tìm thấy'}), 404
            
            # Trả về file .ts
            return send_file(
                ts_path,
                mimetype='video/mp2t',
                as_attachment=False,
                conditional=True
            )
            
    except Exception as e:
        print(f"[❌ Stream Segment Error] {e}")
        return jsonify({'error': 'Lỗi khi stream segment'}), 500



# API lấy thông tin video
@stream_bp.route('/video-info/movie/<int:movie_id>')
def get_movie_video_info(movie_id):
    """Lấy thông tin video phim"""
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT video_file, duration, quality, file_size 
                FROM movies 
                WHERE id = %s
            """, (movie_id,))
            
            movie = cursor.fetchone()
            
            if not movie:
                return jsonify({'error': 'Phim không tồn tại'}), 404
            
            return jsonify({
                'duration': movie.get('duration'),
                'quality': movie.get('quality', '1080p'),
                'file_size': movie.get('file_size'),
                'has_video': bool(movie.get('video_file')),
                'type': 'mp4'
            })
            
    except Exception as e:
        print(f"[❌ Get Movie Info Error] {e}")
        return jsonify({'error': 'Lỗi lấy thông tin video'}), 500

@stream_bp.route('/video-info/show/<int:show_id>/episode/<int:episode_id>')
def get_episode_video_info(show_id, episode_id):
    """Lấy thông tin video episode"""
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT filepath, duration, quality, file_size 
                FROM show_episodes 
                WHERE show_id = %s AND id = %s
            """, (show_id, episode_id))
            
            episode = cursor.fetchone()
            
            if not episode:
                return jsonify({'error': 'Tập phim không tồn tại'}), 404
            
            return jsonify({
                'duration': episode.get('duration'),
                'quality': episode.get('quality', '1080p'),
                'file_size': episode.get('file_size'),
                'has_video': bool(episode.get('filepath')),
                'type': 'hls'
            })
            
    except Exception as e:
        print(f"[❌ Get Episode Info Error] {e}")
        return jsonify({'error': 'Lỗi lấy thông tin video'}), 500
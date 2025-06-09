import json
from flask import Blueprint, jsonify, request
from db import get_db_connection

shows_bp = Blueprint('shows', __name__)

@shows_bp.route('/shows', methods=['GET'])
def get_shows():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM shows ORDER BY created_at DESC")
            shows = cursor.fetchall()

        return jsonify([{
            'id': s['id'],
            'title': s['title'],
            'description': s.get('description', ''),
            'genre': s.get('genre', ''),
            'year': s.get('year'),
            'show_poster': f"/api/static/show-poster/{s['show_poster']}" if s['show_poster'] else None,

        } for s in shows])
    except Exception as e:
        print("[❌ GET /api/shows]", e)
        return jsonify({'error': 'Lỗi server'}), 500



@shows_bp.route('/shows/<int:show_id>', methods=['GET'])
def get_show_detail(show_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM shows WHERE id = %s", (show_id,))
            show = cursor.fetchone()
            if not show:
                return jsonify({'error': 'Không tìm thấy chương trình'}), 404

            cursor.execute("""
                SELECT id, title, episode_number, thumbnail_url
                FROM show_episodes
                WHERE show_id = %s
                ORDER BY episode_number
            """, (show_id,))
            episodes = cursor.fetchall()

        return jsonify({
            'id': show['id'],
            'title': show['title'],
            'description': show.get('description', ''),
            'genre': show.get('genre', ''),
            'year': show.get('year'),
            'show_poster': f"/api/static/show-poster/{show['show_poster']}" if show['show_poster'] else None,
            'episodes': episodes
        })
    except Exception as e:
        print("[❌ GET /api/shows/<id>]", e)
        return jsonify({'error': 'Lỗi server'}), 500

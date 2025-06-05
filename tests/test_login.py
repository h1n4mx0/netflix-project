import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from app import app

class DummyCursor:
    def __init__(self, user=None):
        self.user = user
    def execute(self, query, params):
        pass
    def fetchone(self):
        return self.user
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        pass

class DummyConn:
    def __init__(self, user=None):
        self.user = user
    def cursor(self):
        return DummyCursor(self.user)

def create_client(monkeypatch, user=None):
    def fake_conn():
        return DummyConn(user)
    monkeypatch.setattr('routes.login.get_db_connection', fake_conn)
    return app.test_client()

def test_login_invalid_credentials(monkeypatch):
    user = {'id': 1, 'email': 'test@example.com', 'password': 'secret', 'is_verified': True}
    client = create_client(monkeypatch, user)
    resp = client.post('/api/login', json={'email': 'test@example.com', 'password': 'wrong'})
    assert resp.status_code == 401


def test_login_missing_password(monkeypatch):
    client = create_client(monkeypatch)
    resp = client.post('/api/login', json={'email': 'test@example.com'})
    assert resp.status_code == 400

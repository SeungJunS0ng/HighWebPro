import sqlite3
from datetime import datetime
import os
import config

DB_PATH = config.DB_PATH


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            message TEXT,
            response TEXT,
            timestamp TEXT
        )
    ''')
    conn.commit()
    conn.close()


def save_conversation(user_id, message, response):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('INSERT INTO conversations (user_id, message, response, timestamp) VALUES (?, ?, ?, ?)',
              (user_id, message, response, datetime.now().isoformat()))
    conn.commit()
    conn.close()


def get_conversation_history(user_id, limit=5):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT message, response FROM conversations WHERE user_id = ? ORDER BY id DESC LIMIT ?',
              (user_id, limit))
    rows = c.fetchall()
    conn.close()
    return rows[::-1]


def clear_conversation_history(user_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('DELETE FROM conversations WHERE user_id = ?', (user_id,))
    conn.commit()
    conn.close()


# ✅ 수정된 삭제 함수
def delete_conversation_by_message(user_id, title):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # title이 '...'로 끝날 경우 앞부분만 비교
    if title.endswith('...'):
        like_pattern = f"{title[:-3]}%"
    else:
        like_pattern = f"{title}%"

    c.execute('''
        DELETE FROM conversations
        WHERE user_id = ? AND message LIKE ?
    ''', (user_id, like_pattern))

    conn.commit()
    conn.close()


# 앱 실행 시 자동 DB 초기화
if not os.path.exists(DB_PATH):
    init_db()

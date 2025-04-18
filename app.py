from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import config
import database as db
from chat_engine import get_response

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/config', methods=['GET'])
def get_config():
    return jsonify({
        "API_URL": f"http://{config.HOST}:{config.PORT}/api",
        "THEME_COLOR": "#4a6fa5"
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '').strip()
    user_id = data.get('user_id', 'anonymous')
    # print(f"서버에서 받은 user_id (chat): {user_id}")  # 디버깅 로그 제거

    if not user_message:
        return jsonify({"status": "prompt", "message": "검색어를 입력해주세요."})

    history = db.get_conversation_history(user_id, limit=5)
    response_data = get_response(user_message, history)

    if response_data.get("status") == "success":
        db.save_conversation(user_id, user_message, response_data.get("summary", ""))

    return jsonify(response_data)

@app.route('/api/reset', methods=['POST'])
def reset_conversation():
    data = request.get_json()
    user_id = data.get('user_id', 'anonymous')
    # print(f"서버에서 받은 user_id (reset): {user_id}")  # 디버깅 로그 제거
    db.clear_conversation_history(user_id)
    return jsonify({'status': 'success', 'message': '대화가 초기화되었습니다.'})

@app.route('/api/delete', methods=['POST'])
def delete_conversation():
    data = request.get_json()
    user_id = data.get('user_id', '')
    title = data.get('title', '')
    # print(f"서버에서 받은 user_id: {user_id}, title: {title}")  # 디버깅 로그 제거
    if not title:
        return jsonify({'status': 'error', 'message': '삭제할 대화 제목이 필요합니다.'})
    db.delete_conversation_by_message(user_id, title)
    return jsonify({'status': 'success', 'message': f'"{title}" 대화가 DB에서 삭제되었습니다.'})

if __name__ == '__main__':
    app.run(debug=config.DEBUG, host=config.HOST, port=config.PORT)
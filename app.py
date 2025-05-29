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

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        user_id = data.get('user_id', 'anonymous')

        if not user_message:
            return jsonify({"status": "prompt", "message": "검색어를 입력해주세요."}), 400
        if not user_id:
            return jsonify({"status": "error", "message": "user_id가 필요합니다."}), 400

        history = db.get_conversation_history(user_id, limit=5)
        response_data = get_response(user_message, history)

        if response_data.get("status") == "success":
            title = user_message[:10] + ('...' if len(user_message) > 10 else '')
            db.save_conversation(user_id, title, user_message, response_data.get("summary", ""))
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"status": "error", "message": f"서버 오류: {str(e)}"}), 500

@app.route('/api/reset', methods=['POST'])
def reset_conversation():
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'anonymous')
        if not user_id:
            return jsonify({'status': 'error', 'message': 'user_id가 필요합니다.'}), 400

        db.clear_conversation_history(user_id)
        return jsonify({'status': 'success', 'message': '대화가 초기화되었습니다.'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'서버 오류: {str(e)}'}), 500

@app.route('/api/delete', methods=['POST'])
def delete_conversation():
    try:
        data = request.get_json()
        user_id = data.get('user_id', '')
        title = data.get('title', '')

        if not user_id:
            return jsonify({'status': 'error', 'message': 'user_id가 필요합니다.'}), 400
        if not title:
            return jsonify({'status': 'error', 'message': '삭제할 대화 제목이 필요합니다.'}), 400

        db.delete_conversation_by_message(user_id, title)
        return jsonify({'status': 'success', 'message': f'"{title}" 대화가 DB에서 삭제되었습니다.'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'서버 오류: {str(e)}'}), 500

@app.route('/api/conversations', methods=['POST'])
def list_conversations():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'status': 'error', 'message': 'user_id가 필요합니다.'}), 400

        titles = db.get_conversation_titles(user_id)
        return jsonify({'status': 'success', 'titles': titles})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=config.DEBUG, host=config.HOST, port=config.PORT)

파일 및 역할(빠른 참고)

루트
- app.py: Flask 앱 엔트리포인트. API 라우트 정의 (/api/chat, /api/reset, /api/delete, /api/conversations)
- chat_engine.py: 크롤링 및 요약 로직. TF-IDF를 사용하여 요약문 생성
- database.py: SQLite DB 초기화 및 CRUD 헬퍼 함수
- config.py: dotenv 로딩 및 설정값 (DEBUG/HOST/PORT/DB_PATH)
- requirements.txt: Python 패키지 목록
- package.json: 프론트엔드 의존성(현재 dompurify)
- chatbot.db: SQLite DB 파일 (버전 관리에서 제외 권장)

templates/
- index.html: 프론트엔드 진입점

static/
- style.css: 기본 스타일
- js/config.js: 프론트엔드에서 사용하는 API URL 등의 설정
- js/main.js: 앱 초기화, 이벤트 바인딩, 사이드바 렌더링 등 UI 흐름
- js/chat.js: 서버와 통신하는 함수들 (fetch 사용)
- js/storage.js: localStorage 사용 유틸
- js/ui.js: UI 구성 유틸 (메시지 추가, 타이핑 인디케이터, DOMPurify 사용)

노트
- 프론트엔드와 백엔드가 `API_URL`로 http://127.0.0.1:5000/api 를 사용하도록 구성되어 있습니다. 배포 시 config.js를 수정하거나 프록시를 사용하세요.

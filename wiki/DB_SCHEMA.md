데이터베이스 스키마 (SQLite)

파일 위치
- 기본 DB 파일: `chatbot.db` (config.py의 DB_PATH로 변경 가능)

테이블: conversations
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- user_id (TEXT) : 사용자 식별자
- title (TEXT) : 대화 제목 (프론트엔드에서 메시지 일부로 생성)
- message (TEXT) : 사용자가 입력한 메시지(또는 대화 내용 직렬화)
- response (TEXT) : 챗봇이 반환한 요약/응답(텍스트)
- timestamp (TEXT) : ISO 포맷의 저장 시각

주요 쿼리 함수 (database.py)
- init_db(): DB 및 테이블 생성
- save_conversation(user_id, title, message, response)
- get_conversation_history(user_id, limit=5) -> 최근 limit개의 (message, response) 튜플 반환(과거->최근 순)
- clear_conversation_history(user_id)
- delete_conversation_by_message(user_id, title)
- get_conversation_titles(user_id) -> 중복 제거된 title 리스트 반환

운영 팁
- 백업: 파일 기반 DB이므로 정기적으로 `chatbot.db` 파일을 백업하세요.
- 마이그레이션: 현재 마이그레이션 도구 미포함. 스키마 변경 시 수동 migration 필요
- 동시성: sqlite는 동시 쓰기에 제약이 있음. 동시 사용자/높은 트래픽 환경에서는 PostgreSQL 같은 RDBMS 고려

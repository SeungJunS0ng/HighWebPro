프로젝트 아키텍처 개요

목표
- 사용자 입력(키워드)을 받아 뉴스(네이버) 기사들을 수집하고 요약을 제공하는 서비스

컴포넌트
1) Backend (Flask)
   - 파일: `app.py`
   - 역할: HTTP 엔드포인트 제공 (/api/*), 요청 파싱, DB 접근, `chat_engine` 호출
   - CORS 활성화

2) Chat Engine (크롤링 + 요약)
   - 파일: `chat_engine.py`
   - 역할: 네이버 뉴스 검색 페이지에서 기사 링크를 추출 (`get_naver_news_links`), 각 기사에서 본문 추출(`fetch_naver_article_content`), 텍스트 전처리, TF-IDF 기반 요약 생성
   - 동시성: ThreadPoolExecutor로 병렬 기사 수집

3) Database (SQLite)
   - 파일: `database.py`
   - 역할: 대화 저장/조회/삭제, 앱 시작 시 DB 초기화
   - 스키마: conversations(id, user_id, title, message, response, timestamp)

4) Frontend (Static JS + HTML)
   - 파일: `templates/index.html`, `static/js/*.js`, `static/style.css`
   - 역할: SPA 형태로 사용자 입력 전송, 대화 목록 로컬 저장, 서버와 상호작용
   - 보안: DOMPurify로 서버가 반환한 HTML 일부 sanitize

데이터 흐름 (요약)
사용자 입력 -> 프론트엔드가 /api/chat 호출 -> `app.py`에서 `chat_engine.get_response` 호출 -> 뉴스 크롤링 및 요약 -> 결과 저장(DB) 및 응답 -> 프론트엔드가 결과를 렌더링

운영 관점
- 네이버 등 외부 사이트의 robots 정책/Rate-limit에 유의해야 함
- 프로덕션에서는 Flask 내장 서버 대신 WSGI 서버(gunicorn/uwsgi) 사용 권장
- 크롤링 실패/빈 결과에 대비한 graceful fallback(이미 구현되어 있음)

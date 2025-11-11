# 뉴스 요약 챗봇 (highwebproject)

간단한 뉴스 크롤링 기반 요약 챗봇 프로젝트입니다. 사용자가 입력한 키워드로 네이버 뉴스 링크들을 수집하고, 본문을 추출해 TF-IDF 기반의 간단한 요약을 제공합니다. 백엔드(Flask)와 SPA 스타일의 프론트엔드로 구성되어 있으며, 대화 기록은 SQLite에 저장됩니다.

요약
- 입력 키워드로 네이버 뉴스 검색 링크 수집
- 기사 본문 추출 및 텍스트 전처리
- TF-IDF 유사도 기반 요약 생성
- 사용자별 대화 기록을 SQLite에 저장
- 프론트엔드는 로컬스토리지로 대화 보관 및 UI 렌더링

목차
- 빠른 시작
- API 사용법
- 아키텍처
- 데이터베이스(스키마)
- 파일 맵(주요 파일 설명)
- 로컬 개발 가이드
- 배포 가이드
- 보안 및 운영상 주의사항

빠른 시작
1) Python 의존성 설치
```cmd
python -m pip install -r requirements.txt
```

2) (선택) 프론트엔드 의존성 설치
```cmd
npm install
```

3) 환경변수(.env) 설정(선택)
- `.env`에 다음 키들을 추가할 수 있습니다:
  - DEBUG (True/False, 기본 True)
  - HOST (기본 127.0.0.1)
  - PORT (기본 5000)
  - DB_PATH (기본 chatbot.db)

4) 앱 실행
```cmd
python app.py
```
브라우저에서 http://127.0.0.1:5000 에 접속하세요.

API 엔드포인트
- POST /api/chat
  - 요청 JSON: { "user_id": "user_abc", "message": "검색어" }
  - 역할: 입력 키워드로 뉴스를 크롤링하고 요약을 반환
  - 응답(성공 예):
    {
      "status": "success",
      "query": "...",
      "summary": "요약문...",
      "results": [{ "title": "..", "link": "..", "snippet": "..." }]
    }

- POST /api/reset
  - 요청 JSON: { "user_id": "user_abc" }
  - 역할: 해당 사용자의 모든 대화 기록 삭제

- POST /api/delete
  - 요청 JSON: { "user_id": "user_abc", "title": "대화 제목" }
  - 역할: 특정 제목의 대화(대화 스레드) 삭제

- POST /api/conversations
  - 요청 JSON: { "user_id": "user_abc" }
  - 역할: 사용자의 대화 제목 목록 반환

아키텍처 개요
컴포넌트
- Backend (Flask)
  - 파일: `app.py`
  - 역할: HTTP 엔드포인트 제공, 요청 파싱, DB 접근, `chat_engine` 호출
  - 특징: CORS 활성화, 간단한 에러/입력 검증

- Chat Engine (크롤링 + 요약)
  - 파일: `chat_engine.py`
  - 역할: 네이버 뉴스 검색 페이지에서 기사 링크 추출, 각 기사에서 본문 추출, 텍스트 전처리, TF-IDF 기반 요약 생성
  - 특징: ThreadPoolExecutor로 병렬 기사 수집, BeautifulSoup 기반 HTML 파싱

- Database (SQLite)
  - 파일: `database.py`
  - 역할: 대화 저장/조회/삭제, 앱 시작 시 DB 초기화
  - 스키마: conversations(id, user_id, title, message, response, timestamp)

- Frontend (Static HTML/JS)
  - 파일: `templates/index.html`, `static/js/*`, `static/style.css`
  - 역할: SPA 스타일 UI 제공, 사용자 입력 전송, 로컬 저장 및 사이드바 렌더링
  - 보안: 서버에서 반환된 HTML을 DOMPurify로 일부 sanitize

데이터 흐름
사용자 입력 → 프론트엔드가 /api/chat 호출 → `app.py`가 `chat_engine.get_response` 호출 → 뉴스 크롤링 및 요약 생성 → DB 저장 → 프론트엔드가 결과 렌더링

데이터베이스 (스키마)
- 기본 DB 파일: `chatbot.db` (config.py의 DB_PATH로 변경 가능)

테이블: `conversations`
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- user_id: TEXT
- title: TEXT
- message: TEXT
- response: TEXT
- timestamp: TEXT (ISO 포맷)

주요 DB 함수 (database.py)
- init_db(): DB 및 테이블 생성
- save_conversation(user_id, title, message, response)
- get_conversation_history(user_id, limit=5) -> (message, response) 리스트
- clear_conversation_history(user_id)
- delete_conversation_by_message(user_id, title)
- get_conversation_titles(user_id)

파일 맵 (주요 파일)
- `app.py`: Flask 앱 엔트리포인트. API 라우트 정의
- `chat_engine.py`: 네이버 뉴스 크롤링 및 요약 로직
- `database.py`: SQLite DB 초기화 및 CRUD 유틸
- `config.py`: 환경 변수 로딩 및 기본값
- `requirements.txt`: Python 패키지 목록
- `package.json`: 프론트엔드 의존성 (dompurify)
- `templates/index.html`: 프론트엔드 진입점
- `static/style.css`: 스타일
- `static/js/config.js`: 프론트엔드 API URL 설정
- `static/js/main.js`: 앱 초기화 및 UI 이벤트 처리
- `static/js/chat.js`: 서버 통신 함수
- `static/js/storage.js`: localStorage 유틸
- `static/js/ui.js`: UI 유틸(메시지 렌더링, DOMPurify 사용)

로컬 개발 가이드
1) 가상환경(권장)
```cmd
python -m venv .venv
.venv\Scripts\activate
```
2) 의존성 설치
```cmd
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```
3) 실행
```cmd
python app.py
```

테스트 팁
- `chat_engine.get_response('원하는 키워드')`를 직접 호출해 반환 형태를 확인
- DB 함수들은 임시 DB 파일을 가리키도록 `config.DB_PATH`를 수정해 테스트

배포 가이드(간단)
- 개발용 Flask 내장 서버 대신 WSGI 서버(gunicorn, uWSGI 등) 사용 권장
- 정적 파일은 Nginx/CDN으로 분리 서빙 권장
- 예시 (gunicorn 사용, Linux):
```bash
python -m pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

운영 주의사항
- SQLite는 파일 기반 DB로 동시 쓰기 제약이 있어 멀티 워커 환경에서는 충돌 가능. 프로덕션에서는 PostgreSQL 등 서버형 DB 권장
- 외부 사이트(네이버) 크롤링에 의존하므로 robots 정책, Rate-limit, 구조 변경에 주의
- 반환되는 HTML을 프론트엔드에서 DOMPurify로 sanitize하지만, 추가적인 보안 검토(서버 측 필터링, CSP, XSS 점검)를 권장

GitHub Wiki 관련
- 이 저장소의 루트에 `wiki/` 폴더를 포함하고 있으므로 Markdown 파일은 리포지토리 파일 트리에서 바로 확인 가능합니다.
- 정식 GitHub Wiki(탭)로 올리려면 리포지토리의 Wiki 기능을 활성화하고 `.wiki.git` 원격에 푸시해야 합니다. (저에게 권한을 주시면 대신 업로드해 드립니다.)

향후 개선 아이디어
- 크롤링 안정성: 요청 재시도, User-Agent 로테이션, 프록시 지원
- 요약 개선: TextRank 또는 Transformer 기반 요약 모델 도입
- 인증/보안: user_id가 임의로 지정되는 현재 구조에 인증/세션 추가
- CI: 유닛 테스트 및 GitHub Actions로 자동화

문서 및 위키 업데이트 완료
- 이 README는 `wiki/` 내용(아키텍처, DB 스키마, 파일 맵, 개발/배포 가이드)을 통합한 것입니다.
- 추가 수정이나 더 상세한 항목(예: API 샘플 응답, 스크린샷, 예제 테스트 스크립트)을 원하시면 알려주세요.

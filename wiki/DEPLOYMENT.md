배포 가이드 (간단)

개요
- 개발용 Flask 내장 서버 대신 WSGI 서버(예: gunicorn, uWSGI)를 사용하세요.
- 정적 파일은 CDN 또는 Nginx 등으로 서빙하면 성능 향상

예: Linux(권장)에서 gunicorn + systemd
1. 의존성 설치
```bash
python -m pip install gunicorn
```
2. gunicorn 실행 예
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```
3. Nginx를 앞단에 두고 프록시 설정

Windows에서 간단 실행
- 개발/테스트 용도로는 `python app.py`로 실행
# 뉴스 요약 챗봇 (highwebproject)
주의사항
- SQLite 사용시 다중 워커(gunicorn 워커 수>1) 환경에서 동시 쓰기 충돌 발생 가능. 프로덕션에서는 파일 DB 대신 서버형 DB 사용 권장
- 외부 사이트 크롤링 정책 및 트래픽 제한 준수
- 환경변수로 DB 경로 등 민감 정보를 관리

로드맵(권장)
- 컨테이너화(Dockerfile 작성) -> 오케스트레이션(Kubernetes)
- 자동화된 배포(CI/CD) 파이프라인 구축
- HTTPS, 인증, 로그/모니터링 추가

간단한 뉴스 크롤링 기반 요약 챗봇 프로젝트입니다. 사용자가 입력한 키워드로 네이버 뉴스 링크들을 수집하고, 본문을 추출해 간단한 TF-IDF 기반 요약을 제공하는 백엔드(Flask)와
로컬 스토리지를 이용한 간단한 프론트엔드(HTML/JS)로 구성되어 있습니다.

주요 기능
- 입력 키워드 기반 뉴스 링크 수집 (네이버 뉴스 검색)
- 본문 추출 및 텍스트 클렌징
- TF-IDF 기반 간단한 요약 생성
- 대화 기록을 SQLite로 저장(사용자별)
- SPA 스타일의 프론트엔드: 대화 목록, 다크모드, 로컬 저장

빠른 시작
1. Python 의존성 설치
```cmd
python -m pip install -r requirements.txt
```

2. (선택) 프론트엔드 의존성 설치
```cmd
npm install
```

3. 환경변수(.env) 설정 (선택)
- DEBUG: True/False (기본: True)
- HOST: 호스트 (기본: 127.0.0.1)
- PORT: 포트 (기본: 5000)
- DB_PATH: SQLite 파일 경로 (기본: chatbot.db)

4. 앱 실행
```cmd
python app.py
```
웹 브라우저에서 http://127.0.0.1:5000 접속

API 엔드포인트 요약
- POST /api/chat
  - 요청 JSON: { "user_id": "user_abc", "message": "검색어" }
  - 응답 예: { "status":"success", "query":"...", "summary":"요약문...", "results":[{title, link, snippet}] }

- POST /api/reset
  - 요청 JSON: { "user_id": "user_abc" }
  - 역할: 해당 사용자의 모든 대화 기록 삭제

- POST /api/delete
  - 요청 JSON: { "user_id": "user_abc", "title": "대화 제목" }
  - 역할: 특정 제목의 대화(대화 스레드) 삭제

- POST /api/conversations
  - 요청 JSON: { "user_id": "user_abc" }
  - 응답: 대화 제목 목록

데이터베이스
- 기본적으로 프로젝트 루트의 `chatbot.db` (config.DB_PATH)를 사용
- 테이블: conversations(id, user_id, title, message, response, timestamp)

주의 및 한계
- 외부 사이트(네이버 등) 크롤링에 의존하므로 차단/구조 변경에 취약합니다.
- 요약 알고리즘은 간단한 TF-IDF 기반으로 복잡한 추론/중복 제거에 한계가 있습니다.
- 반환되는 요약/HTML은 프론트엔드에서 DOMPurify로 일부 sanitize 되지만, 서버에서 HTML을 그대로 반환하므로 추가 보안 검토 권장

파일 수정 금지
- 요청에 따라 코드 수정은 하지 않았습니다. 문서만 추가했습니다.

더 읽을거리
- wiki/ 폴더에 아키텍처, DB 스키마, 파일 설명, 개발/배포 가이드가 있습니다.

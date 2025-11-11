개발 가이드

로컬 개발 환경 설정
1. Python 가상환경 생성(권장)
```cmd
python -m venv .venv
.venv\Scripts\activate
```
2. 의존성 설치
```cmd
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```
3. (프론트 엔드) 의존성
```cmd
npm install
```

환경 변수
- .env 파일로 설정 가능 (config.py에서 load_dotenv 사용)
- 주요 키: DEBUG, HOST, PORT, DB_PATH

실행
```cmd
python app.py
```

디버깅 포인트
- 크롤링 실패: 로그가 warnings 레벨로 남습니다. `chat_engine.py`의 requests 호출에 타임아웃(기본 5초) 설정되어 있음
- HTML 파싱: `fetch_naver_article_content`에서 여러 selector를 시도합니다. 뉴스사 마크업이 달라지면 본문 추출 실패 가능
- 요약: `summarize()`가 충분한 문장 길이를 요구합니다. 너무 짧으면 "요약할 수 있는 정보가 부족합니다."를 반환

테스트
- 현재 자동화된 단위 테스트 파일은 포함되어 있지 않습니다. 간단한 테스트 아이디어:
  - `chat_engine.get_response('긴 키워드')` 호출 후 형태 검사
  - `database.py`의 CRUD 함수들(임시 DB 경로 사용) 테스트

권장 개선
- 크롤링 안정성: User-Agent 로테이션, 요청 재시도, 프록시 지원
- 요약 품질: TextRank, transformers 기반 요약 모델 등 도입
- DB 확장: SQLite -> PostgreSQL 등으로 이전
- API 인증: user_id를 임의로 지정할 수 있어 보안상 취약. 인증/세션 추가 권장

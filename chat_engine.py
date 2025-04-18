import requests
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

API_KEY = "2af01f9317b542bf9e6469c072ca1567"
NEWSAPI_URL = "https://newsapi.org/v2/everything"

def get_response(user_message, _=None):
    query = user_message.strip()
    if not query:
        return {"status": "prompt", "message": "검색어를 입력해주세요."}
    return crawl_news(query)

def crawl_news(query, page_size=3):
    params = {
        "q": query,
        "language": "ko",
        "pageSize": page_size,
        "apiKey": API_KEY
    }

    try:
        response = requests.get(NEWSAPI_URL, params=params)
        data = response.json()
        articles = data.get("articles", [])
    except Exception as e:
        return {"status": "error", "message": f"뉴스 불러오기 실패: {e}"}

    results = []
    full_texts = []

    for article in articles:
        title = article.get("title")
        link = article.get("url")
        desc = article.get("description", "")

        results.append({
            "title": title,
            "link": link,
            "snippet": desc or "내용 없음"
        })

        if desc:
            full_texts.append(desc)

    summary = summarize(clean_texts(full_texts), query) if full_texts else "요약할 내용이 충분하지 않습니다."

    return {
        "status": "success" if results else "no_results",
        "query": query,
        "summary": summary,
        "results": results
    }

def clean_texts(texts):
    seen = set()
    return [
        re.sub(r'\s+', ' ', t.strip())
        for t in texts
        if len(t.strip()) >= 30 and not (t in seen or seen.add(t))
    ]

def summarize(texts, query, max_sentences=3):
    joined = ' '.join(texts)
    sentences = [s.strip() for s in re.split(r'[.!?]', joined) if len(s.strip()) > 30]

    if not sentences:
        return "요약할 수 있는 정보가 부족합니다."

    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform([query] + sentences)
    scores = (matrix[1:] @ matrix[0].T).toarray().flatten()
    top_indices = np.argsort(scores)[::-1][:max_sentences]
    return ' '.join([sentences[i] for i in top_indices]) + '.'

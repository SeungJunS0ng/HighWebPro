import re
import time
import logging
import numpy as np
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from sklearn.feature_extraction.text import TfidfVectorizer

logging.basicConfig(level=logging.INFO)

def get_response(user_message, _=None):
    query = user_message.strip()
    if not query:
        return {"status": "prompt", "message": "검색어를 입력해주세요."}

    result = crawl_news(query, max_links=10)
    if result['status'] == 'success':
        first_sentence = result['summary'].split('.')[0].strip()
        result['title'] = first_sentence[:30] or query
    return result

def crawl_news(query, max_links=10):
    links = get_naver_news_links(query, max_links)
    logging.info(f"[{query}] 수집된 뉴스 링크 수: {len(links)}")

    if not links:
        return {
            "status": "no_results",
            "query": query,
            "summary": "관련 뉴스 기사를 찾을 수 없습니다.",
            "results": []
        }

    results = []
    full_texts = []
    seen_links = set()

    for link in links:
        if link in seen_links:
            continue
        seen_links.add(link)

        content = fetch_naver_article_content(link)
        if not content or len(content.strip()) < 70:
            continue

        title = extract_title_from_content(content)
        results.append({
            "title": title or link.split('/')[-1],
            "link": link,
            "snippet": content[:100] + "..." if len(content) > 100 else content
        })
        full_texts.append(content)

    if not full_texts:
        return {
            "status": "success",
            "query": query,
            "summary": "본문 요약이 어려웠습니다. 아래 뉴스 링크를 참고해보세요.",
            "results": results
        }

    cleaned_texts = clean_texts(full_texts)
    summary = summarize(cleaned_texts, query) if cleaned_texts else "요약할 내용이 충분하지 않습니다."

    return {
        "status": "success",
        "query": query,
        "summary": summary,
        "results": results
    }

def get_naver_news_links(query, max_links=10, retry=2):
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    for attempt in range(retry + 1):
        try:
            driver = webdriver.Chrome(options=options)
            search_url = f"https://search.naver.com/search.naver?where=news&query={query}"
            driver.get(search_url)

            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'a[href*="naver.com"]'))
            )
            news_elements = driver.find_elements(By.CSS_SELECTOR, 'a[href*="naver.com"]')
            links = []
            for el in news_elements:
                href = el.get_attribute('href')
                if not href:
                    continue
                if any(sub in href for sub in ['promotion', 'event', 'static']):
                    continue
                if re.search(r'(news|sports|entertain)\.naver\.com', href) and href not in links:
                    links.append(href)
                if len(links) >= max_links:
                    break
            return links
        except Exception as e:
            logging.warning(f"[시도 {attempt + 1}] 뉴스 링크 크롤링 실패: {e}")
            time.sleep(1)
        finally:
            try:
                driver.quit()
            except:
                pass
    return []

def fetch_naver_article_content(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(res.text, 'html.parser')

        selectors = [
            '#newsct_article', '#dic_area', '#articleBodyContents',
            '#articeBody', 'article', '.newsct_article', '.content',
            '#wrap #content .article_area', 'section.article_body'
        ]
        for selector in selectors:
            tag = soup.select_one(selector)
            if tag and len(tag.get_text(strip=True)) > 70:
                return tag.get_text(strip=True)

        og_desc = soup.select_one('meta[property="og:description"]')
        if og_desc and og_desc.get("content") and len(og_desc["content"].strip()) > 50:
            return og_desc["content"].strip()

        for script in soup.find_all("script", type="application/ld+json"):
            try:
                import json
                data = json.loads(script.string)
                if isinstance(data, dict) and "articleBody" in data:
                    text = data["articleBody"].strip()
                    if len(text) > 50:
                        return text
            except Exception:
                continue

        if soup.title:
            return soup.title.get_text(strip=True)

        return ""
    except Exception as e:
        logging.warning(f"뉴스 본문 수집 실패 - URL: {url} / 에러: {e}")
        return ""

def extract_title_from_content(content):
    sentences = re.split(r'[.!?]', content)
    return sentences[0].strip() if sentences else ""

def clean_texts(texts):
    seen = set()
    return [
        re.sub(r'\\s+', ' ', t.strip())
        for t in texts
        if len(t.strip()) >= 30 and not (t in seen or seen.add(t))
    ]

def summarize(texts, query, max_sentences=3):
    joined = ' '.join(texts)
    sentences = [s.strip() for s in re.split(r'[.!?]', joined) if len(s.strip()) > 30]

    if not sentences:
        return "요약할 수 있는 정보가 부족합니다."

    keyword_sentences = [s for s in sentences if query in s]
    keyword_sentences = keyword_sentences[:1]
    remaining_sentences = [s for s in sentences if s not in keyword_sentences]

    if not remaining_sentences:
        return ' '.join(keyword_sentences)

    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform([query] + remaining_sentences)
    scores = (matrix[1:] @ matrix[0].T).toarray().flatten()
    top_indices = np.argsort(scores)[::-1]

    selected = keyword_sentences + [remaining_sentences[i] for i in top_indices if remaining_sentences[i] not in keyword_sentences]
    summary = ' '.join(selected[:max_sentences])

    if not summary.endswith('.'):
        summary += '.'
    return summary
 export function addMessageToUI(chatMessages, type, content, options = {}) {
    const div = document.createElement('div');
    div.className = `message ${type}-message`;
    div.setAttribute('data-role', type);

    const inner = document.createElement('div');
    inner.className = 'message-content';

    if (type === 'user') {
        inner.textContent = content;
    } else {
        inner.innerHTML = DOMPurify.sanitize(content);
    }

    div.appendChild(inner);
    chatMessages.appendChild(div);

    if (options.scroll !== false) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

export function addTypingIndicator(chatMessages) {
    const existing = chatMessages.querySelector('.typing-indicator');
    if (existing) return existing.parentElement;  // 중복 방지

    const div = document.createElement('div');
    div.className = 'message bot-message';
    div.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(div);
    return div;
}

export function formatBotMessage(data) {
    if (data.status === 'no_results') {
        return `📌 <strong>요약:</strong><br>요약할 내용이 충분하지 않습니다.<br><br><em>관련 뉴스가 없습니다.</em>`;
    }

    if (data.status !== 'success') {
        return `⚠️ ${data.message || '에러가 발생했습니다.'}`;
    }

    // 📌 요약 문장 분리 및 줄바꿈 처리
    const summaryLines = data.summary
        .split(/(?<=[.?!])\s+(?=[가-힣])/g)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => `• ${line}<br>`)
        .join('');

    let msg = data.summary
        ? `📌 <strong>요약:</strong><br>${summaryLines}<br>`
        : `📌 <strong>요약 없음</strong><br><br>`;

    // 📰 관련 뉴스 필터링
    if (data.results?.length > 0) {
        const filtered = data.results.filter(item => {
            const title = item.title || "";
            return (
                title.length >= 5 &&
                !title.includes('네이버') &&
                !title.includes('홈') &&
                !title.includes('스포츠') &&
                !title.includes('구독') &&
                !title.includes('편집') &&
                !title.includes('뉴스') &&
                !title.match(/^언론|^뉴스|^홈/)
            );
        });

        if (filtered.length > 0) {
            msg += `<strong>📰 관련 뉴스:</strong><ul>` +
                filtered.map(item => `<li><a href="${item.link}" target="_blank">${item.title}</a></li>`).join('') +
                `</ul>`;
        } else {
            msg += `<em>관련 뉴스가 없습니다.</em>`;
        }
    } else {
        msg += `<em>관련 뉴스가 없습니다.</em>`;
    }

    return msg;
}

export function toggleDarkMode() {
    document.body.classList.toggle('dark');
    return document.body.classList.contains('dark');
}

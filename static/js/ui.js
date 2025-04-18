export function addMessageToUI(chatMessages, type, content, options = {}) {
    const div = document.createElement('div');
    div.className = `message ${type}-message`;

    const inner = document.createElement('div');
    inner.className = 'message-content';
    inner.innerHTML = content;

    div.appendChild(inner);
    chatMessages.appendChild(div);

    if (options.scroll !== false) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}


export function addTypingIndicator(chatMessages) {
    const div = document.createElement('div');
    div.className = 'message bot-message';
    div.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(div);
    return div;
}

export function formatBotMessage(data) {
    if (data.status !== 'success') return `⚠️ ${data.message || '에러가 발생했습니다.'}`;
    let msg = data.summary ? `📌 <strong>요약</strong>:<br>${data.summary}<br><br>` : `📌 <strong>요약 없음</strong><br><br>`;
    if (data.results?.length > 0) {
        msg += `<strong>📰 관련 뉴스:</strong><ul>` +
               data.results.map(item => `<li><a href="${item.link}" target="_blank">${item.title}</a></li>`).join('') +
               `</ul>`;
    } else {
        msg += `<em>관련 뉴스가 없습니다.</em>`;
    }
    return msg;
}

export function toggleDarkMode() {
    document.body.classList.toggle('dark');
    return document.body.classList.contains('dark');
}
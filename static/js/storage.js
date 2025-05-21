const CONVERSATION_KEY = 'chatbot_conversations';
const DARKMODE_KEY = 'chatbot_darkmode';

export function saveConversation(title, messages) {
    const conversations = loadConversations();
    if (conversations[title]) {
        console.warn(`⚠️ 동일한 제목("${title}")이 이미 존재하여 덮어씁니다.`);
    }
    conversations[title] = messages;
    localStorage.setItem(CONVERSATION_KEY, JSON.stringify(conversations));
}

export function loadConversations() {
    try {
        const raw = localStorage.getItem(CONVERSATION_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.warn('⚠️ 대화 데이터 파싱 실패: 초기화됨');
        localStorage.removeItem(CONVERSATION_KEY);
        return {};
    }
}

export function deleteConversation(title) {
    const conversations = loadConversations();
    delete conversations[title];
    localStorage.setItem(CONVERSATION_KEY, JSON.stringify(conversations));
}

export function saveDarkModeState(isDark) {
    localStorage.setItem(DARKMODE_KEY, isDark);
}

export function loadDarkModeState() {
    return localStorage.getItem(DARKMODE_KEY) === 'true';
}

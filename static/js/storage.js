const CONVERSATION_KEY = 'chatbot_conversations';
const DARKMODE_KEY = 'chatbot_darkmode';

// 전체 conversations를 localStorage에 저장
export function saveAllConversations(conversations) {
    localStorage.setItem(CONVERSATION_KEY, JSON.stringify(conversations));
}

// 특정 대화 저장 (기존 대화 덮어쓰기 가능)
export function saveConversation(title, messages) {
    const conversations = loadConversations();
    conversations[title] = messages;
    saveAllConversations(conversations);
}

// 모든 대화 불러오기
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

// 특정 대화 삭제
export function deleteConversation(title) {
    const conversations = loadConversations();
    delete conversations[title];
    saveAllConversations(conversations);
}

// 다크모드 상태 저장
export function saveDarkModeState(isDark) {
    localStorage.setItem(DARKMODE_KEY, isDark);
}

// 다크모드 상태 불러오기
export function loadDarkModeState() {
    return localStorage.getItem(DARKMODE_KEY) === 'true';
}

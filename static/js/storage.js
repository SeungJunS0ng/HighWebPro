export function saveConversation(title, messages) {
    const conversations = loadConversations();
    conversations[title] = messages;
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

export function loadConversations() {
    return JSON.parse(localStorage.getItem('conversations') || '{}');
}

export function deleteConversation(title) {
    const conversations = loadConversations();
    delete conversations[title];
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

export function saveDarkModeState(isDark) {
    localStorage.setItem('darkmode', isDark);
}

export function loadDarkModeState() {
    return localStorage.getItem('darkmode') === 'true';
}
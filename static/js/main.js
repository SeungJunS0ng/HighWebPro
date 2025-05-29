import {
    sendChatMessage,
    resetChat,
    deleteConversationOnServer,
    fetchConversationTitles
} from './chat.js';
import {
    saveConversation,
    loadConversations,
    deleteConversation,
    saveDarkModeState,
    loadDarkModeState
} from './storage.js';
import {
    addMessageToUI,
    addTypingIndicator,
    formatBotMessage,
    toggleDarkMode
} from './ui.js';

// ✅ 상수 선언
const BOT = 'bot';
const USER = 'user';
const LOCAL_KEY = 'chatbot_conversations';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
let userId = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substring(2, 9);
localStorage.setItem('userId', userId);
let currentConversationTitle = null;

// ✅ 에러 메시지 출력 함수
function showBotError(message) {
    addMessageToUI(chatMessages, BOT, `⚠️ ${message}`);
}

// ✅ 초기화 관련 함수 분리
async function loadInitialConversations() {
    const localConversations = loadConversations();
    const serverTitles = await fetchConversationTitles(userId);

    serverTitles.forEach(title => {
        if (!localConversations[title]) {
            localConversations[title] = [];
        }
    });

    localStorage.setItem(LOCAL_KEY, JSON.stringify(localConversations));
}

// ✅ 이벤트 리스너 분리
function setupEventListeners() {
    document.getElementById('send-btn').onclick = handleSendMessage;
    document.getElementById('reset-btn').onclick = handleResetChat;
    document.getElementById('darkmode-toggle').onclick = () => {
        saveDarkModeState(toggleDarkMode());
    };

    userInput.onkeypress = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };
}

// ✅ 앱 초기화
async function initApp() {
    await loadInitialConversations();
    renderSidebar();

    if (loadDarkModeState()) {
        document.body.classList.add('dark');
    }

    setupEventListeners();
}

// ✅ 메시지 전송 처리
async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    userInput.value = '';
    userInput.disabled = true;
    addMessageToUI(chatMessages, USER, message);

    const typing = addTypingIndicator(chatMessages);

    try {
        const data = await sendChatMessage(userId, message);
        chatMessages.removeChild(typing);
        addMessageToUI(chatMessages, BOT, formatBotMessage(data));
    } catch (error) {
        chatMessages.removeChild(typing);
        showBotError('서버 응답 중 오류가 발생했습니다.');
    } finally {
        userInput.disabled = false;
        userInput.focus();
    }

    const messages = Array.from(chatMessages.querySelectorAll('.message')).map(div => ({
        type: div.classList.contains('user-message') ? USER : BOT,
        text: div.querySelector('.message-content')?.innerHTML || ''
    }));

    const title = message.slice(0, 10) + (message.length > 10 ? '...' : '');
    currentConversationTitle = title;
    saveConversation(title, messages);
    renderSidebar();
}

// ✅ 대화 초기화
async function handleResetChat() {
    try {
        const data = await resetChat(userId);
        chatMessages.innerHTML = '';
        if (data.status === 'success') {
            addMessageToUI(chatMessages, BOT, '안녕하세요! 챗봇입니다. 어떤 정보가 필요하신가요?');
        } else {
            showBotError(data.message);
        }
    } catch (error) {
        showBotError('대화 초기화 중 오류가 발생했습니다.');
    }
}

// ✅ 사이드바 렌더링
function renderSidebar() {
    const list = document.getElementById('conversation-list');
    list.innerHTML = '';
    const conversations = loadConversations();

    Object.entries(conversations).forEach(([title]) => {
        const li = document.createElement('li');
        if (title === currentConversationTitle) {
            li.classList.add('active');
        }

        const span = document.createElement('span');
        span.textContent = title;
        span.style.flex = '1';
        span.style.cursor = 'pointer';
        span.onclick = () => loadConversation(conversations[title], title);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑';
        deleteBtn.onclick = async (e) => {
            e.stopPropagation();
            if (confirm(`"${title}" 대화를 삭제하시겠습니까?`)) {
                try {
                    deleteConversation(title);
                    await deleteConversationOnServer(userId, title);
                    list.removeChild(li);
                    if (title === currentConversationTitle) {
                        currentConversationTitle = null;
                        chatMessages.innerHTML = '';
                        addMessageToUI(chatMessages, BOT, '🗑 대화가 삭제되었습니다.');
                    }
                    renderSidebar();
                } catch (error) {
                    showBotError('대화 삭제 중 오류가 발생했습니다.');
                }
            }
        };

        li.appendChild(span);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

// ✅ 대화 불러오기
function loadConversation(messages, title) {
    currentConversationTitle = title;
    chatMessages.innerHTML = '';

    messages.forEach(msg => {
        const type = msg.type === USER ? USER : BOT;
        addMessageToUI(chatMessages, type, msg.text);
    });

    userInput.focus();
}

document.addEventListener('DOMContentLoaded', initApp);

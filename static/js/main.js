import { sendChatMessage, resetChat, deleteConversationOnServer } from './chat.js';
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

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
let userId = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substring(2, 9);
localStorage.setItem('userId', userId); // 디버깅 로그 제거
let currentConversationTitle = null;

// 나머지 코드는 동일 (initApp, handleSendMessage, handleResetChat, renderSidebar, getCurrentConversationTitle, loadConversation)
function initApp() {
    renderSidebar();

    if (loadDarkModeState()) {
        document.body.classList.add('dark');
    }

    document.getElementById('send-btn').onclick = handleSendMessage;
    document.getElementById('reset-btn').onclick = handleResetChat;
    document.getElementById('darkmode-toggle').onclick = () => {
        saveDarkModeState(toggleDarkMode());
    };

    userInput.onkeypress = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };
}

async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    userInput.value = '';
    userInput.disabled = true;
    addMessageToUI(chatMessages, 'user', message);

    const typing = addTypingIndicator(chatMessages);

    try {
        const data = await sendChatMessage(userId, message);
        chatMessages.removeChild(typing);
        addMessageToUI(chatMessages, 'bot', formatBotMessage(data));
    } catch (error) {
        chatMessages.removeChild(typing);
        addMessageToUI(chatMessages, 'bot', '⚠️ 서버 응답 중 오류가 발생했습니다.');
    } finally {
        userInput.disabled = false;
        userInput.focus();
    }

    const messages = Array.from(chatMessages.querySelectorAll('.message')).map(div => ({
        type: div.classList.contains('user-message') ? 'user' : 'bot',
        text: div.innerHTML
    }));

    const title = message.slice(0, 10) + (message.length > 10 ? '...' : '');
    saveConversation(title, messages);
    renderSidebar();
}

async function handleResetChat() {
    try {
        const data = await resetChat(userId);
        chatMessages.innerHTML = '';
        if (data.status === 'success') {
            addMessageToUI(chatMessages, 'bot', '안녕하세요! 챗봇입니다. 어떤 정보가 필요하신가요?');
        } else {
            addMessageToUI(chatMessages, 'bot', `⚠️ ${data.message}`);
        }
    } catch (error) {
        addMessageToUI(chatMessages, 'bot', '⚠️ 대화 초기화 중 오류가 발생했습니다.');
    }
}

function renderSidebar() {
    const list = document.getElementById('conversation-list');
    list.innerHTML = '';
    const conversations = loadConversations();

    Object.entries(conversations).forEach(([title]) => {
        const li = document.createElement('li');

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
                        addMessageToUI(chatMessages, 'bot', '🗑 대화가 삭제되었습니다.');
                    }
                    renderSidebar();
                } catch (error) {
                    console.error('대화 삭제 중 오류:', error); // 오류 로그 유지
                    addMessageToUI(chatMessages, 'bot', '⚠️ 대화 삭제 중 오류가 발생했습니다.');
                }
            }
        };

        li.appendChild(span);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

function getCurrentConversationTitle() {
    const lastUserMessage = [...chatMessages.querySelectorAll('.user-message .message-content')]
        .map(el => el.innerText.trim())[0];
    return lastUserMessage ? lastUserMessage.slice(0, 10) + (lastUserMessage.length > 10 ? '...' : '') : '';
}

function loadConversation(messages, title) {
    currentConversationTitle = title;
    chatMessages.innerHTML = '';
    messages.forEach(msg => addMessageToUI(chatMessages, msg.type, msg.text));
}

document.addEventListener('DOMContentLoaded', initApp);
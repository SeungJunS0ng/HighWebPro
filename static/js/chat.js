import { API_URL } from './config.js';

// 공통 POST 요청 함수
async function postToApi(endpoint, payload) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${result.message || response.statusText}`);
        }

        console.log(`✅ [${endpoint}] 응답:`, result);
        return result;
    } catch (error) {
        console.error(`❌ [${endpoint}] 호출 중 에러:`, error.message);
        return { status: 'error', message: error.message };
    }
}

// 메시지 전송
export function sendChatMessage(userId, message) {
    return postToApi('chat', { user_id: userId, message });
}

// 서버에서 대화 삭제
export function deleteConversationOnServer(userId, title) {
    return postToApi('delete', { user_id: userId, title });
}

// 대화 초기화
export function resetChat(userId) {
    return postToApi('reset', { user_id: userId });
}

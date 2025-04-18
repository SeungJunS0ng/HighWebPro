import { API_URL } from './config.js';

export async function sendChatMessage(userId, message) {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, user_id: userId })
        });

        if (!response.ok) {
            throw new Error(`서버 에러 발생: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API 호출 중 에러:', error); // 오류 로그 유지
        return { status: 'error', message: error.message };
    }
}

export async function deleteConversationOnServer(userId, title) {
    try {
        const response = await fetch(`${API_URL}/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, title })
        });

        if (!response.ok) {
            throw new Error('서버 삭제 실패');
        }

        const result = await response.json();
        // console.log('✅ DB 삭제 결과:', result.message); // 성공 로그 제거
        return result;
    } catch (error) {
        console.error('❌ DB 삭제 중 오류:', error.message); // 오류 로그 유지
        throw error;
    }
}

export async function resetChat(userId) {
    try {
        const response = await fetch(`${API_URL}/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });

        if (!response.ok) {
            throw new Error(`서버 에러 발생: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('대화 초기화 중 에러:', error); // 오류 로그 유지
        return { status: 'error', message: error.message };
    }
}
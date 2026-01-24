import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOCAL_IP } from '../config/network';

export interface AiChatResponse {
  assistantReply?: string;
  action?: any;
  actionResult?: any;
}

// Try AIbox on common ports (8081, 8083) - fallback if first port not reachable
async function tryPost(url: string, options: RequestInit) {
  try {
    const resp = await fetch(url, options);
    if (!resp.ok) throw new Error(`Status ${resp.status}`);
    return resp;
  } catch (err) {
    // rethrow for caller to handle
    throw err;
  }
}

const chatWithAi = async (message: string, conversationId?: number): Promise<AiChatResponse> => {
  const token = await AsyncStorage.getItem('customer_token');
  const ports = ['8081', '8083'];
  const body = {
    conversationId: conversationId || null,
    messages: [{ role: 'user', content: message }]
  };
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let lastError: any = null;
  for (const port of ports) {
    const url = `http://${LOCAL_IP}:${port}/api/ai/chat`;
    try {
      const resp = await tryPost(url, { method: 'POST', headers, body: JSON.stringify(body) });
      const json = await resp.json();
      return json as AiChatResponse;
    } catch (err) {
      lastError = err;
      // try next port
    }
  }

  // as a final attempt try without specifying port (use default resolver)
  try {
    const url = `http://${LOCAL_IP}/api/ai/chat`;
    const resp = await tryPost(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const json = await resp.json();
    return json as AiChatResponse;
  } catch (err) {
    throw lastError || err;
  }
};

const isAvailable = async (): Promise<boolean> => {
  const ports = ['8081', '8083'];
  for (const port of ports) {
    const url = `http://${LOCAL_IP}:${port}/api/ai/chat`;
    try {
      const resp = await fetch(url, { method: 'OPTIONS' });
      if (resp && resp.status && resp.status < 500) return true;
    } catch (err) {
      // ignore and try next
    }
  }
  return false;
};

export default { chatWithAi, isAvailable };
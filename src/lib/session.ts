import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_ID_KEY = 'shopcorner_session_id';

let cachedSessionId: string | null = null;

function generateSessionId() {
  return `sid_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export async function getSessionId(): Promise<string> {
  if (cachedSessionId) return cachedSessionId;

  const stored = await AsyncStorage.getItem(SESSION_ID_KEY);
  if (stored) {
    cachedSessionId = stored;
    return stored;
  }

  const next = generateSessionId();
  await AsyncStorage.setItem(SESSION_ID_KEY, next);
  cachedSessionId = next;
  return next;
}

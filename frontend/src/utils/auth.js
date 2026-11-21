const STORAGE_KEY = "pulsecall.user";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const user = JSON.parse(raw);
    if (!user?.name || !user?.email || !user?.userId) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function saveUser({ name, email }) {
  const user = {
    userId: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

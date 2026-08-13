// Helpers de sesión y puntajes en localStorage — solo client-side.

export interface User {
  name: string;
}

export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

export function getUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function setUser(u: User | null): void {
  if (u) {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function appendScore(entry: { game: string; score: number; name: string }): void {
  try {
    const all: SavedScore[] = JSON.parse(localStorage.getItem(SCORES_KEY) || "[]");
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {
    // localStorage no disponible — no-op
  }
}

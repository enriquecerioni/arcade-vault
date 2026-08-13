"use client";

// Helpers de sesión y puntajes en localStorage — solo client-side.

import { useSyncExternalStore } from "react";

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

function parseUser(raw: string | null): User | null {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getUser(): User | null {
  return parseUser(localStorage.getItem(USER_KEY));
}

const userListeners = new Set<() => void>();

function emitUserChange() {
  for (const listener of userListeners) listener();
}

export function setUser(u: User | null): void {
  if (u) {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  emitUserChange();
}

function subscribeToUser(callback: () => void) {
  userListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    userListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getUserSnapshot(): string | null {
  return localStorage.getItem(USER_KEY);
}

function getUserServerSnapshot(): string | null {
  return null;
}

/** Sesión actual, sincronizada con localStorage (misma pestaña y otras). */
export function useUser(): User | null {
  const raw = useSyncExternalStore(subscribeToUser, getUserSnapshot, getUserServerSnapshot);
  return parseUser(raw);
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

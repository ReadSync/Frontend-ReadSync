import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Book } from "../hooks/useBooks";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =========== FAVORITES UTILITY FUNCTIONS ===========
const FAVORITES_STORAGE_KEY = 'readsync_favorites';

export function getFavorites(): Book[] {
  if (typeof window === 'undefined') return [];

  try {
    const favoritesJson = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!favoritesJson) return [];
    return JSON.parse(favoritesJson);
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
}

export function addToFavorites(book: Book): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const favorites = getFavorites();

    // Check if book already exists in favorites
    if (favorites.some(fav => fav.id === book.id)) {
      return false; // Already in favorites
    }

    favorites.push(book);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
}

export function removeFromFavorites(bookId: number): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(fav => fav.id !== bookId);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
}

export function isFavorite(bookId: number): boolean {
  if (typeof window === 'undefined') return false;

  const favorites = getFavorites();
  return favorites.some(fav => fav.id === bookId);
}

// =========== SEARCH HISTORY UTILITY FUNCTIONS ===========
const SEARCH_HISTORY_STORAGE_KEY = 'readsync_search_history';
const MAX_SEARCH_HISTORY = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const historyJson = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (!historyJson) return [];
    return JSON.parse(historyJson);
  } catch (error) {
    console.error('Error reading search history from localStorage:', error);
    return [];
  }
}

export function addToSearchHistory(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;

  try {
    const history = getSearchHistory();

    // Remove duplicate queries
    const filtered = history.filter(item => item.query.toLowerCase() !== query.toLowerCase().trim());

    // Add new query at the beginning
    const newHistory = [
      { query: query.trim(), timestamp: Date.now() },
      ...filtered
    ].slice(0, MAX_SEARCH_HISTORY); // Keep only last MAX_SEARCH_HISTORY items

    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
}

export function removeFromSearchHistory(timestamp: number): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getSearchHistory();
    const filtered = history.filter(item => item.timestamp !== timestamp);
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from search history:', error);
  }
}

// =========== NOTIFICATIONS UTILITY FUNCTIONS ===========
const NOTIFICATIONS_STORAGE_KEY = 'readsync_notifications';

export interface Notification {
  id: string;
  type: 'borrow' | 'return' | 'approval' | 'rejection' | 'reminder' | 'fine';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  bookId?: number;
  bookTitle?: string;
  fineAmount?: number;
}

export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];

  try {
    const notificationsJson = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!notificationsJson) return [];
    return JSON.parse(notificationsJson);
  } catch (error) {
    console.error('Error reading notifications from localStorage:', error);
    return [];
  }
}

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
  if (typeof window === 'undefined') return;

  try {
    const notifications = getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false
    };

    notifications.unshift(newNotification);
    // Keep only last 50 notifications
    const limited = notifications.slice(0, 50);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('Error adding notification:', error);
  }
}

export function markNotificationAsRead(notificationId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const notifications = getNotifications();
    const updated = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

export function markAllNotificationsAsRead(): void {
  if (typeof window === 'undefined') return;

  try {
    const notifications = getNotifications();
    const updated = notifications.map(notif => ({ ...notif, read: true }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

export function deleteNotification(notificationId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const notifications = getNotifications();
    const filtered = notifications.filter(notif => notif.id !== notificationId);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
}

export function getUnreadNotificationCount(): number {
  if (typeof window === 'undefined') return 0;

  const notifications = getNotifications();
  return notifications.filter(notif => !notif.read).length;
}

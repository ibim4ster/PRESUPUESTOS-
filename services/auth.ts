
import { User } from '../types';

export const authService = {
  // Helper to hash password using SHA-256
  hashPassword: async (password: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Session Management (using sessionStorage so it expires when tab closes, or localStorage if persistent)
  setSession: (user: User) => {
    // Remove password hash from session storage for security
    const { passwordHash, ...safeUser } = user;
    sessionStorage.setItem('proquote_session', JSON.stringify(safeUser));
  },

  getSession: (): User | null => {
    const data = sessionStorage.getItem('proquote_session');
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    sessionStorage.removeItem('proquote_session');
  },

  isAdmin: (user: User | null): boolean => {
    return user?.role === 'admin';
  }
};

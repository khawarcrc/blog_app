import { create } from 'zustand';
import { User } from '@/types/user';

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (!res.ok) {
        set({ user: null });
        return;
      }
      const data = await res.json();
      set({ user: data.user });
    } catch (err) {
      console.error('Fetch user failed:', err);
      set({ user: null });
    }
  },
}));

import { useEffect, useState, useCallback } from 'react';
import liff from '@line/liff';
import { useAppStore } from '../stores/useAppStore';
import type { User } from '../types';

export function useLiff() {
  const [error, setError] = useState<string | null>(null);
  const { setUser, setLiffState, isLiffInitialized, isInLineClient } = useAppStore();

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({
          liffId: import.meta.env.VITE_LIFF_ID,
        });
        
        const inClient = liff.isInClient();
        setLiffState(true, inClient);
        
        // ログイン状態の確認
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          const user: User = {
            id: profile.userId,
            lineUserId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            membershipType: 'free', // デフォルト
            createdAt: new Date(),
          };
          setUser(user);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'LIFF initialization failed');
        console.error('LIFF init error:', e);
      }
    };

    initLiff();
  }, [setUser, setLiffState]);

  const login = useCallback(async () => {
    if (!liff.isLoggedIn()) {
      liff.login();
    }
  }, []);

  const logout = useCallback(() => {
    if (liff.isLoggedIn()) {
      liff.logout();
      setUser(null);
      window.location.reload();
    }
  }, [setUser]);

  const getProfile = useCallback(async () => {
    if (liff.isLoggedIn()) {
      return await liff.getProfile();
    }
    return null;
  }, []);

  const sendMessage = useCallback(async (messages: any[]) => {
    if (liff.isInClient()) {
      await liff.sendMessages(messages);
    }
  }, []);

  const shareMessage = useCallback(async (messages: any[]) => {
    if (liff.isApiAvailable('shareTargetPicker')) {
      const result = await liff.shareTargetPicker(messages);
      return result?.status === 'success';
    }
    return false;
  }, []);

  const closeWindow = useCallback(() => {
    liff.closeWindow();
  }, []);

  return {
    isInitialized: isLiffInitialized,
    isInClient: isInLineClient,
    isLoggedIn: liff.isLoggedIn?.() ?? false,
    error,
    login,
    logout,
    getProfile,
    sendMessage,
    shareMessage,
    closeWindow,
  };
}

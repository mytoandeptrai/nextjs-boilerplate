'use client';
import { useStorageState } from '@/hooks/use-storage-state';
import { useContext, createContext, type PropsWithChildren } from 'react';

const AuthContext = createContext<{
  signIn: (accessToken: string, refreshToken: string) => void;
  signOut: () => void;
  accessToken?: string | null;
  refreshToken?: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}>({
  signIn: () => {},
  signOut: () => {},
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
});

// This hook can be used to access the user info.
export function useAuth() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isLoadingAccessToken, accessToken], setAccessToken] = useStorageState('accessToken');
  const [[isLoadingRefreshToken, refreshToken], setRefreshToken] = useStorageState('refreshToken');

  return (
    <AuthContext.Provider
      value={{
        signIn: (accessToken: string, refreshToken: string) => {
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
        },
        signOut: () => {
          setAccessToken(null);
          setRefreshToken(null);
        },
        accessToken,
        refreshToken,
        isLoading: isLoadingAccessToken || isLoadingRefreshToken,
        isAuthenticated: !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

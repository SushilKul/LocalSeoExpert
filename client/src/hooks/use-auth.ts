import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  getStoredToken, 
  setStoredToken, 
  removeStoredToken,
  getStoredUser,
  setStoredUser,
  clearAuth,
  type User 
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is authenticated by verifying token with server
  const { isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = getStoredToken();
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();
      return data.user;
    },
    enabled: !!getStoredToken() && !isInitialized,
    retry: false,
    onSuccess: (userData) => {
      setUser(userData);
      setStoredUser(userData);
      setIsInitialized(true);
    },
    onError: () => {
      // Token is invalid, clear auth data
      clearAuth();
      setUser(null);
      setIsInitialized(true);
    },
  });

  // Initialize auth state on mount
  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    
    if (!token || !storedUser) {
      setIsInitialized(true);
    }
  }, []);

  const login = (userData: User, token: string) => {
    setStoredToken(token);
    setStoredUser(userData);
    setUser(userData);
    
    // Set up authorization header for future requests
    queryClient.setDefaultOptions({
      queries: {
        ...queryClient.getDefaultOptions().queries,
        retry: (failureCount, error: any) => {
          // Don't retry on 401 errors
          if (error?.message?.includes("401")) {
            return false;
          }
          return failureCount < 3;
        },
      },
    });
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Clear local storage first
      clearAuth();
      setUser(null);
      
      // Clear all queries
      queryClient.clear();
      
      // Optional: notify server about logout
      try {
        await apiRequest("POST", "/api/auth/logout", {});
      } catch {
        // Ignore logout errors - user is logged out locally anyway
      }
    },
    onSettled: () => {
      // Force redirect to login page
      window.location.href = "/login";
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook for protecting routes
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, isLoading]);

  return { user, isLoading };
}

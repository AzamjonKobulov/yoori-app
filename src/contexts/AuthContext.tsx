import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiCP, apiID } from "../http/apis";

interface User {
  id: string;
  email: string;
  domain: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing tokens on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const managerId = localStorage.getItem("manager_id");

      if (accessToken && refreshToken && managerId) {
        try {
          // Set the token for API calls
          apiCP.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;

          // Get user info
          const userInfo = await apiCP.get("/user/v1/current/info");
          setUser({
            id: userInfo.data.id,
            email: userInfo.data.email,
            domain: userInfo.data.domain,
            first_name: userInfo.data.first_name,
            last_name: userInfo.data.last_name,
          });
        } catch (error) {
          console.error("Auth check failed:", error);
          // Clear invalid tokens
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("manager_id");
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiID.post("/auth/v1/login/", {
        email,
        password,
      });

      const { access_token, refresh_token } = response.data;

      // Store tokens
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);

      // Set authorization header
      apiCP.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      // Get user info
      const userInfo = await apiCP.get("/user/v1/current/info");
      localStorage.setItem("manager_id", userInfo.data.id);
      apiCP.defaults.baseURL = `https://${userInfo.data.domain}`;

      setUser({
        id: userInfo.data.id,
        email: userInfo.data.email,
        domain: userInfo.data.domain,
        first_name: userInfo.data.first_name,
        last_name: userInfo.data.last_name,
      });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    // Clear tokens and user data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("manager_id");

    // Clear API headers
    delete apiCP.defaults.headers.common["Authorization"];

    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const response = await apiID.post("/auth/v1/token/refresh/", {
        refresh: refreshTokenValue,
      });

      const { access } = response.data;
      localStorage.setItem("accessToken", access);
      apiCP.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

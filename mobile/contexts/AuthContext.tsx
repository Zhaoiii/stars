import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "@/services/api";

export interface User {
  _id: string;
  username: string;
  phone: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    username: string,
    phone: string,
    password: string
  ) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从本地存储加载认证信息
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("auth_token");
      const storedUser = await AsyncStorage.getItem("auth_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("加载认证信息失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(phone, password);

      const data = await response.data;

      console.log(response);

      if (response.data && data.token) {
        setToken(data.token);
        setUser(data.user);

        // 保存到本地存储
        await AsyncStorage.setItem("auth_token", data.token);
        await AsyncStorage.setItem("auth_user", JSON.stringify(data.user));

        return true;
      } else {
        throw new Error(data.message || "登录失败");
      }
    } catch (error) {
      console.error("登录错误:", error);
      return false;
    }
  };

  const register = async (
    username: string,
    phone: string,
    password: string
  ): Promise<boolean> => {
    try {
      //   const response = await fetch(
      //     "http://172.20.10.2:5001/api/auth/register",
      //     {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({ username, phone, password }),
      //     }
      //   );
      const response = await authAPI.register(username, phone, password);

      const data = await response.data;

      if (response.data) {
        setToken(data.token);
        setUser(data.user);

        // 保存到本地存储
        await AsyncStorage.setItem("auth_token", data.token);
        await AsyncStorage.setItem("auth_user", JSON.stringify(data.user));

        return true;
      } else {
        throw new Error(data.message || "注册失败");
      }
    } catch (error) {
      console.error("注册错误:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // 调用后端登出接口
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error("登出请求失败:", error);
    } finally {
      // 清除本地状态和存储
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("auth_user");
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!token) return;

    try {
      const response = await authAPI.getProfile();
      const data = await response.data;

      if (response.data) {
        if (data.success && data.data) {
          setUser(data.data);
          await AsyncStorage.setItem("auth_user", JSON.stringify(data.data));
        }
      }
    } catch (error) {
      console.error("刷新用户信息失败:", error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    register,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

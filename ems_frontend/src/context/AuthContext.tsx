import React, { createContext, useContext, useEffect, useState } from "react";
import api, { tokenStore } from "../api/axios";
import type { User, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

// keep all auth endpoints under /api/main/
const AUTH_PREFIX = "/api/main";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Try to restore session on hard refresh
  useEffect(() => {
    const hasRefresh = tokenStore.refresh;
    if (!hasRefresh) {
      setAuthReady(true);
      return;
    }

    // 1) Try profile (will 401 without access)
    // 2) Interceptor will auto-refresh using refresh token
    api
      .get(`${AUTH_PREFIX}/profile/`)
      .then((res) => {
        const u: User = {
          username: res.data?.username,
          name: res.data?.full_name ?? res.data?.name ?? res.data?.username,
          email: res.data?.email,
          phone: res.data?.phone ?? null,
          avatar: res.data?.avatar ?? null,
          createdAt: localStorage.getItem("ems_created_at") || undefined,
        };
        setUser(u);
      })
      .catch(() => {
        // refresh may have failed; stay logged out
        tokenStore.clear();
      })
      .finally(() => setAuthReady(true));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // backend expects username + password; you’re using email as username
      const { data } = await api.post(`${AUTH_PREFIX}/login/`, {
        username: email,
        password,
      });

      const access = data?.access;
      const refresh = data?.refresh;
      if (!access || !refresh) return false;

      tokenStore.access = access;
      tokenStore.refresh = refresh;

      const prof = await api.get(`${AUTH_PREFIX}/profile/`);
      const u: User = {
        username: prof.data?.username,
        name: prof.data?.full_name ?? prof.data?.name ?? prof.data?.username,
        email: prof.data?.email,
        phone: prof.data?.phone ?? null,
        avatar: prof.data?.avatar ?? null,
        createdAt: new Date().toISOString(),
      };
      setUser(u);
      localStorage.setItem("ems_created_at", u.createdAt!);
      return true;
    } catch {
      tokenStore.clear();
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // you asked to send email as username and include name
      await api.post(`${AUTH_PREFIX}/register/`, {
        username: email,
        email,
        password,
        name, // saved to first_name on backend
      });

      // you commented auto-login earlier; keep behavior consistent:
      // return await login(email, password);
      return true;
    } catch {
      return false;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    // Support updating full_name + phone (your backend accepts full_name/name + phone)
    const payload: any = {};
    if (typeof (data as any).full_name !== "undefined") payload.full_name = (data as any).full_name;
    if (typeof data.name !== "undefined" && typeof payload.full_name === "undefined") {
      payload.full_name = data.name;
    }
    if (typeof data.phone !== "undefined") payload.phone = data.phone;

    try {
      const res = await api.put(`${AUTH_PREFIX}/profile/`, payload);
      const updated: User = {
        ...user,
        name: res.data?.full_name ?? res.data?.name ?? payload.full_name ?? user.name,
        phone: res.data?.phone ?? payload.phone ?? user.phone ?? null,
      };
      setUser(updated);
      return true;
    } catch {
      return false;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await api.put(`${AUTH_PREFIX}/change-password/`, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    tokenStore.clear();
    localStorage.removeItem("ems_created_at");
  };

  const value: AuthContextType = {
    user,
    authReady,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

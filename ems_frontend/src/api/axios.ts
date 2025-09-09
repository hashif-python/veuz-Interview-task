// src/api/axios.ts
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: false, // using Authorization header (not cookies)
});

// ---- Token storage helpers ----
const ACCESS_KEY = "ems_access_token";
const REFRESH_KEY = "ems_refresh_token";

export const tokenStore = {
    get access() {
        return sessionStorage.getItem(ACCESS_KEY);
    },
    set access(v: string | null) {
        if (v) sessionStorage.setItem(ACCESS_KEY, v);
        else sessionStorage.removeItem(ACCESS_KEY);
    },
    get refresh() {
        return localStorage.getItem(REFRESH_KEY);
    },
    set refresh(v: string | null) {
        if (v) localStorage.setItem(REFRESH_KEY, v);
        else localStorage.removeItem(REFRESH_KEY);
    },
    clear() {
        this.access = null;
        this.refresh = null;
    },
};

// ---- Attach access token on every request ----
api.interceptors.request.use((config) => {
    const token = tokenStore.access;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ---- Auto refresh on 401 once ----
let isRefreshing = false;
let pendingQueue: Array<(t: string | null) => void> = [];

const flushQueue = (token: string | null) => {
    pendingQueue.forEach((cb) => cb(token));
    pendingQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const status = error?.response?.status;

        if (status === 401 && !original._retry) {
            original._retry = true;

            if (isRefreshing) {
                // queue the request until refresh finishes
                return new Promise((resolve, reject) => {
                    pendingQueue.push((newToken) => {
                        if (!newToken) return reject(error);
                        original.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(original));
                    });
                });
            }

            try {
                isRefreshing = true;
                const refresh = tokenStore.refresh;
                if (!refresh) throw new Error("No refresh token");

                const resp = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/admin/refresh/`,
                    { refresh },
                    { headers: { "Content-Type": "application/json" } }
                );

                const newAccess = resp.data?.access;
                if (!newAccess) throw new Error("No access in refresh");

                tokenStore.access = newAccess;
                flushQueue(newAccess);

                original.headers.Authorization = `Bearer ${newAccess}`;
                return api(original);
            } catch (e) {
                tokenStore.clear();
                flushQueue(null);
                // optional: redirect to login
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

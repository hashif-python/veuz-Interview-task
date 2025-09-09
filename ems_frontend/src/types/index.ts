export interface User {
  id?: number;            // (not returned by our /profile/ right now)
  username?: string;
  name?: string;          // we’ll map username -> name for UI
  email?: string;
  phone?: string | null;
  avatar?: string | null; // path from backend
  createdAt?: string;     // local-only convenience
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'password' | 'date' | 'textarea' | 'select';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select fields
}

export interface CustomForm {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
}

export interface Employee {
  id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  authReady: boolean;                 // 👈 add this
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

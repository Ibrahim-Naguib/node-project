// ============================================
// AUTHENTICATION & JWT TYPES
// ============================================

export interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'user' | 'admin';
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

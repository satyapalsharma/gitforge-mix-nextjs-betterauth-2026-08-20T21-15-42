export interface Session {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

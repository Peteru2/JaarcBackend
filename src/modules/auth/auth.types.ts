export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface LoginResult {
  user: AuthenticatedUser;
  token: string;
  expiresIn: string;
}
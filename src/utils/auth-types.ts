export type UserRole = 'team_leader' | 'team_member' | 'client';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, never store plain text passwords
  role: UserRole;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
} 
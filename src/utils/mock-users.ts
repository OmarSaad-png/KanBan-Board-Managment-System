import { User } from './auth-types';

export const users: User[] = [
  {
    id: '1',
    username: 'teamlead1',
    password: 'leader123', // In real app, use hashed passwords
    role: 'team_leader',
    name: 'John Leader'
  },
  {
    id: '2',
    username: 'member1',
    password: 'member123',
    role: 'team_member',
    name: 'Alice Member'
  },
  {
    id: '3',
    username: 'member2',
    password: 'member123',
    role: 'team_member',
    name: 'Bob Member'
  },
  {
    id: '4',
    username: 'client1',
    password: 'client123',
    role: 'client',
    name: 'Carol Client'
  },
  {
    id: '5',
    username: 'client2',
    password: 'client123',
    role: 'client',
    name: 'David Client'
  }
]; 
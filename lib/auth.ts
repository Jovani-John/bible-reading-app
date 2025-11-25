import { User } from './types';
import { getFromLocalStorage, saveToLocalStorage } from './utils';

export const registerUser = (name: string, email: string, password: string): User | null => {
  try {
    const users = getFromLocalStorage<User[]>('users', []);
    
    // Check if email exists
    if (users.find(u => u.email === email)) {
      return null;
    }
    
    const newUser: User = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
      notificationsEnabled: false
    };
    
    users.push(newUser);
    saveToLocalStorage('users', users);
    
    return newUser;
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
};

export const loginUser = (email: string, password: string): User | null => {
  try {
    const users = getFromLocalStorage<User[]>('users', []);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      saveToLocalStorage('currentUser', user);
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = (): User | null => {
  return getFromLocalStorage<User>('currentUser', null);
};

export const updateUser = (userId: string, updates: Partial<User>): boolean => {
  try {
    const users = getFromLocalStorage<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    users[userIndex] = { ...users[userIndex], ...updates };
    saveToLocalStorage('users', users);
    
    // Update current user if it's the same
    const currentUser = getCurrentUser();
    if (currentUser?.id === userId) {
      saveToLocalStorage('currentUser', users[userIndex]);
    }
    
    return true;
  } catch (error) {
    console.error('Update user error:', error);
    return false;
  }
};

import { SignInCredentials, SignUpCredentials, AuthSession } from './authTypes';
import loginService from './loginService';
import registrationService from './registrationService';
import sessionService from './sessionService';
import userService from './userService';
import passwordService from './passwordService';

/**
 * Combined auth service that exports all authentication functionality
 */
const authService = {
  // Login operations
  signIn: loginService.signIn,
  
  // Registration operations
  signUp: registrationService.signUp,
  
  // Session operations
  signOut: sessionService.signOut,
  isAuthenticated: sessionService.isAuthenticated,
  
  // User operations
  getCurrentUser: userService.getCurrentUser,
  
  // Password operations
  forgotPassword: passwordService.forgotPassword,
  updatePassword: passwordService.updatePassword,
};

export type { SignInCredentials, SignUpCredentials, AuthSession };
export default authService;

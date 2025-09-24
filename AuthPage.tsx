import React, { useState } from 'react';
import { CommunityIcon } from './icons/CommunityIcon';
import Footer from './Footer';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface AuthPageProps {
  onSwitchToLanding: () => void;
  onOpenPolicyModal: (type: 'tos' | 'privacy' | 'conduct') => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSwitchToLanding, onOpenPolicyModal }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (mode: 'login' | 'signup' | 'reset') => {
    setError('');
    setSuccessMessage('');
    setPassword('');
    setAuthMode(mode);
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (authMode === 'reset') {
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage('Check your email! A password reset link has been sent.');
        } catch (err: any) {
            console.error('❌ Firebase password reset error:', err.code, err.message);
            setError(err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email' 
                ? 'Could not find an account with that email address.' 
                : 'Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
        return;
    }

    try {
        if (authMode === 'login') {
            await signInWithEmailAndPassword(auth, email, password);
        } else { // 'signup'
            if (fullName.trim() === '') {
                setError('Please enter your full name to sign up.');
                setIsLoading(false);
                return;
            }
            if (!agreeToTerms) {
                setError('You must agree to the Shared Commitment and Privacy Policy to sign up.');
                setIsLoading(false);
                return;
            }
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "applicants", user.uid), {
                id: user.uid,
                name: fullName.trim(),
                profilePictureUrl: `https://picsum.photos/seed/${fullName.trim().replace(/\s/g, '')}/200`,
                bio: "",
                jobHistory: [],
                skills: [],
                endorsedSkills: {},
                isVerifiedSAId: false,
            });
            console.log("✅ Firestore doc created for user:", user.uid);
        }
    } catch (err: any) {
        console.error(`❌ Firebase ${authMode} error:`, err.code, err.message);
        let friendlyMessage: React.ReactNode = 'An unexpected error occurred. Please try again.';
        switch (err.code) {
            case 'auth/invalid-credential':
                friendlyMessage = (
                    <span>
                        Incorrect email or password. Don't have an account?{' '}
                        <button type="button" onClick={() => switchMode('signup')} className="font-bold underline hover:text-primary-700">
                            Sign up here
                        </button>
                        .
                    </span>
                );
                break;
            case 'auth/email-already-in-use':
                friendlyMessage = (
                     <span>
                        An account with this email already exists.{' '}
                        <button type="button" onClick={() => switchMode('login')} className="font-bold underline hover:text-primary-700">
                            Log in instead
                        </button>
                        .
                    </span>
                );
                break;
            case 'auth/weak-password':
                friendlyMessage = 'Your password is too weak. It must be at least 6 characters long.';
                break;
            case 'auth/invalid-email':
                friendlyMessage = 'The email address you entered is not valid.';
                break;
            default:
                 friendlyMessage = err.message.replace("Firebase: ", "").replace(/ \(auth\/.*\)\.$/, ".");
        }
        setError(friendlyMessage);
    } finally {
        setIsLoading(false);
    }
  };

  const getTitle = () => {
      switch (authMode) {
          case 'login': return 'Welcome Back!';
          case 'signup': return 'Create Your VouchWork Account';
          case 'reset': return 'Reset Your Password';
      }
  };

  const getSubtitle = () => {
      switch (authMode) {
          case 'login': return 'Log in to continue.';
          case 'signup': return 'Create an account to get started.';
          case 'reset': return 'Enter your email to receive a reset link.';
      }
  };

  return (
    <div>
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up mb-8 mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800">{getTitle()}</h2>
            <p className="text-center text-gray-500 mt-2">{getSubtitle()}</p>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            {successMessage && (
                 <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-4" role="alert">
                    <p className="font-bold">Success</p>
                    <p>{successMessage}</p>
                </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleAuthAction}>
              {authMode === 'signup' && (
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1">
                    <input id="fullname" name="fullname" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., Alex Ryder" />
                  </div>
                </div>
              )}
              
              {authMode === 'reset' && successMessage ? null : (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="mt-1">
                    <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="you@example.com" />
                  </div>
                </div>
              )}
              
              {authMode !== 'reset' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1">
                    <input id="password" name="password" type="password" autoComplete="current-password" required={authMode !== 'reset'} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="••••••••" />
                  </div>
                </div>
              )}

              {authMode === 'login' && (
                <div className="text-sm text-right">
                    <button type="button" onClick={() => switchMode('reset')} className="font-medium text-primary-600 hover:text-primary-500">
                        Forgot your password?
                    </button>
                </div>
              )}

              {authMode === 'signup' && (
                <div className="flex items-center">
                  <input
                    id="agree-terms"
                    name="agree-terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the Shared Commitment and Privacy Policy.
                  </label>
                </div>
              )}

              {!successMessage && (
                <div>
                  <button 
                    type="submit" 
                    disabled={isLoading || (authMode === 'signup' && !agreeToTerms)}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : (authMode === 'login' ? 'Log In' : authMode === 'signup' ? 'Sign Up' : 'Send Reset Link')}
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              {authMode === 'login' && (
                  <button onClick={() => switchMode('signup')} className="font-medium text-primary-600 hover:text-primary-500">
                      Don't have an account? Sign Up
                  </button>
              )}
              {authMode === 'signup' && (
                  <button onClick={() => switchMode('login')} className="font-medium text-primary-600 hover:text-primary-500">
                      Already have an account? Log In
                  </button>
              )}
              {authMode === 'reset' && (
                  <button onClick={() => switchMode('login')} className="font-medium text-primary-600 hover:text-primary-500">
                      Back to Login
                  </button>
              )}
            </div>
        </div>
        <Footer onOpenPolicyModal={onOpenPolicyModal} />
    </div>
  );
};

export default AuthPage;
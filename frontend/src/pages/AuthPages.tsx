import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        const role = data.data.user.role;
        if (role === 'ADMIN') navigate('/admin-dashboard');
        else navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError('');
    setLoading(true);

    const GOOGLE_CLIENT_ID = '567724376989-cv84qea0ml1nu6a9600jri3dflj5apn6.apps.googleusercontent.com';

    try {
      const google = (window as any).google;
      if (!google?.accounts?.id) {
        setError('Google Sign-In is loading. Please try again in a moment.');
        setLoading(false);
        return;
      }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            // Decode the JWT credential to get user info
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            const data = await googleLogin({
              email: payload.email,
              name: payload.name,
              avatar: payload.picture,
            });
            if (data.success) {
              const role = data.data.user.role;
              if (role === 'ADMIN') navigate('/admin-dashboard');
              else if (!data.data.user.onboardingCompleted) navigate('/onboarding');
              else navigate('/dashboard');
            }
          } catch (err: any) {
            setError(err || 'Google login failed');
          } finally {
            setLoading(false);
          }
        },
      });

      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: open the popup manually
          google.accounts.id.renderButton(
            document.getElementById('google-signin-fallback')!,
            { theme: 'outline', size: 'large', width: 380 }
          );
          (document.getElementById('google-signin-fallback')?.querySelector('div[role="button"]') as HTMLElement | null)?.click();
          setLoading(false);
        }
      });
    } catch (err) {
      setError('Failed to initialize Google Sign-In');
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-stack-lg min-h-screen flex items-center justify-center px-gutter bg-background">
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-headline-lg text-headline-lg text-on-background">Welcome Back</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Log in to manage properties and view tours.</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container border border-error/20 p-3 rounded-lg text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-label-md text-on-surface-variant">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-label-md text-on-surface-variant">Password</label>
              <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-sm font-label-md hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-outline-variant/20"></div>
          <span className="flex-shrink mx-4 text-xs text-outline uppercase tracking-wider font-label-sm">Or</span>
          <div className="flex-grow border-t border-outline-variant/20"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 border border-outline-variant/40 hover:bg-surface-container-low text-on-background rounded-lg text-sm font-label-md transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <div id="google-signin-fallback" className="hidden"></div>

        <p className="text-center text-xs text-on-surface-variant">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary hover:underline font-bold">Register</Link>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerUser(name, email, password, 'USER');
      if (data.success) {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-stack-lg min-h-screen flex items-center justify-center px-gutter bg-background">
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-headline-lg text-headline-lg text-on-background">Create Account</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Join XYZ Homes and explore premium residences.</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container border border-error/20 p-3 rounded-lg text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-label-md text-on-surface-variant">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-label-md text-on-surface-variant">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-label-md text-on-surface-variant">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-sm font-label-md hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-xs text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary hover:underline font-bold">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axios.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess('Password reset link sent to your email.');
        setResetToken(res.data.token); // Store this to pass on to the reset password redirect link mock!
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-stack-lg min-h-screen flex items-center justify-center px-gutter bg-background">
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-headline-lg text-headline-lg text-on-background">Forgot Password</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Enter your email to receive a password reset link.</p>
        </div>

        {error && <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs font-bold text-center">{error}</div>}
        {success && (
          <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-lg text-xs font-bold text-center">
            {success}
            {resetToken && (
              <div className="mt-3">
                <Link to={`/auth/reset-password?token=${resetToken}`} className="underline font-bold text-primary">
                  [Simulated Reset Link] Click to reset password
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-label-md text-on-surface-variant">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-sm font-label-md hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm"
          >
            {loading ? 'Sending...' : 'Send Link'}
          </button>
        </form>

        <p className="text-center text-xs text-primary">
          <Link to="/auth/login" className="hover:underline">Back to Log In</Link>
        </p>
      </div>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/auth/reset-password', { token, password });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-stack-lg min-h-screen flex items-center justify-center px-gutter bg-background">
      <div className="w-full max-w-md bg-surface border border-outline-variant/30 rounded-xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-headline-lg text-headline-lg text-on-background">Reset Password</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Create a secure new password for your account.</p>
        </div>

        {error && <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs font-bold text-center">{error}</div>}
        {success ? (
          <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-lg text-center space-y-2">
            <p className="font-bold text-xs">Password reset successful!</p>
            <button
              onClick={() => navigate('/auth/login')}
              className="bg-primary text-on-primary text-xs font-label-md px-4 py-1.5 rounded-lg hover:bg-primary-container"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-label-md text-on-surface-variant">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-label-md text-on-surface-variant">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-sm font-label-md hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm"
            >
              {loading ? 'Saving...' : 'Save Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

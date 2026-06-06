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
        else if (role === 'AGENT') navigate('/agent-dashboard');
        else navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await googleLogin({
        email: 'john.doe@gmail.com',
        name: 'John Doe',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACKaOeOpLUyLIUjGmqUTe5QtBj6UGepUiAAdwEejW3ZJEsDm4uku-rKvlerfagNlAOsXVW09JA3TrJMKeLYHUaLqn_VYU3TF3XmjSS3Q1sMsUTQw2Ytv_fRJPrgtWfdKOf_RSOy8O3-evSzXkyZufvQgatU0ueDRzmKg7qnXz-qNwBlpK5aYQZ30LR0hzE6izDSr2w2az4HG44Kgwvg2Xoc7q374yIStKuIrbAHU1iUw6oYAr7cZuW-v1hVY5x4tqdEH_VwwBLrrc',
      });
      if (data.success) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err || 'Google login failed');
    } finally {
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
          <img
            src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&q=80&w=20"
            alt="Google"
            className="w-4 h-4 rounded-full"
          />
          Continue with Google
        </button>

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
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerUser(name, email, password, role);
      if (data.success) {
        if (role === 'AGENT') navigate('/agent-dashboard');
        else navigate('/dashboard');
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
          <div className="space-y-1">
            <label className="block text-xs font-label-md text-on-surface-variant">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-background focus:outline-none"
            >
              <option value="USER">Home Buyer / seeker</option>
              <option value="AGENT">Real Estate Agent</option>
            </select>
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

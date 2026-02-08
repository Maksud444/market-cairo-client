import { useState } from 'react';
import { useRouter } from 'next/router';
import { useGoogleLogin } from '@react-oauth/google';
import { FiX, FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { useAuthStore, useUIStore } from '../lib/store';
import toast from 'react-hot-toast';

export default function AuthModal() {
  const router = useRouter();
  const { login, register, googleLogin, isLoading, user } = useAuthStore();
  const { isLoginModalOpen, isRegisterModalOpen, closeAuthModals, openLoginModal, openRegisterModal } = useUIStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const isOpen = isLoginModalOpen || isRegisterModalOpen;
  const isLogin = isLoginModalOpen;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Google OAuth login handler
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const googleUser = await userInfoResponse.json();

        // Send to our backend
        const result = await googleLogin({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
        });

        if (result.success) {
          closeAuthModals();
          setFormData({ name: '', email: '', password: '', phone: '' });

          // Redirect based on user role
          const currentUser = useAuthStore.getState().user;
          if (currentUser?.isAdmin) {
            toast.success('Welcome back, Admin!');
            router.push('/admin');
          } else {
            toast.success('Welcome!');
            router.push('/dashboard');
          }
        } else {
          toast.error(result.message || 'Google login failed');
        }
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Failed to login with Google');
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      toast.error('Google login failed');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        closeAuthModals();
        setFormData({ name: '', email: '', password: '', phone: '' });

        // Redirect based on user role
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.isAdmin) {
          toast.success('Welcome back, Admin!');
          router.push('/admin');
        } else {
          toast.success('Welcome back!');
          router.push('/dashboard');
        }
      } else {
        toast.error(result.message || 'Login failed');
      }
    } else {
      const result = await register(formData.name, formData.email, formData.password, formData.phone);
      if (result.success) {
        toast.success('Account created successfully!');
        closeAuthModals();
        setFormData({ name: '', email: '', password: '', phone: '' });
        router.push('/dashboard');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    }
  };

  const switchMode = () => {
    if (isLogin) {
      openRegisterModal();
    } else {
      openLoginModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={closeAuthModals}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl animate-fade-in">
        {/* Close button */}
        <button
          onClick={closeAuthModals}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={20} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">MySouqify</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-center text-gray-500 mb-6">
            {isLogin 
              ? 'Login to continue to your account' 
              : 'Sign up to start buying and selling'}
          </p>

          {/* Social Auth */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle size={20} />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    required
                    className="input pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number (optional)"
                    className="input pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary-600 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          {/* Switch mode */}
          <p className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={switchMode}
              className="text-primary-600 font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, modalAnimation }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [tempUserEmail, setTempUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { login, googleLogin, githubLogin, finalizeLogin } = useAuth();

  // Countdown timer for resend
  useEffect(() => {
    if (showOTP && timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showOTP && timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timeLeft, canResend, showOTP]);

  // Reset OTP when modal opens
  useEffect(() => {
    if (showOTP) {
      setOtpCode(['', '', '', '', '', '']);
      setOtpError('');
      setTimeLeft(60);
      setCanResend(false);
      // Focus first input after a short delay
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }, [showOTP]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(0, 1);
    setOtpCode(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, rememberMe);
    
    if (result.success) {
      // Always show OTP modal after successful login (for demo/testing)
      setTempUserEmail(formData.email);
      setShowOTP(true);
      setIsLoading(false);
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otpCode.join('');
    
    if (otpValue.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }
    
    setIsLoading(true);
    setOtpError('');
    
    // Virtual OTP verification - accept "000000" for testing
    if (otpValue === '000000') {
      // Success - close modals and navigate to home
      setShowOTP(false);
      onClose();
      setFormData({ email: '', password: '' });
      setRememberMe(false);
      setOtpCode(['', '', '', '', '', '']);
      setIsLoading(false);
      // Now navigate to home after OTP verification
      finalizeLogin();
    } else {
      setOtpError('Invalid verification code. Please use 000000 for testing.');
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    // For testing, just reset timer
    setTimeLeft(60);
    setCanResend(false);
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    const result = await googleLogin();
    if (result.success) {
      setTempUserEmail(result.email || 'user@gmail.com');
      setShowOTP(true);
      setIsLoading(false);
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError('');
    const result = await githubLogin();
    if (result.success) {
      setTempUserEmail(result.email || 'user@github.com');
      setShowOTP(true);
      setIsLoading(false);
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowOTP(false);
    setOtpCode(['', '', '', '', '', '']);
    setOtpError('');
  };

  const getModalAnimationClass = () => {
    switch (modalAnimation) {
      case 'opening': return 'scale-95 opacity-0';
      case 'open': return 'scale-100 opacity-100';
      case 'closing': return 'scale-95 opacity-0';
      case 'switching': return 'scale-90 opacity-0';
      default: return 'scale-95 opacity-0';
    }
  };

  if (!isOpen) return null;

  // Show OTP Modal
  if (showOTP) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-md transition-all duration-300 ease-out opacity-100"
          onClick={handleBackToLogin}
        />
        
        <div className={`relative w-full max-w-md bg-gradient-to-b from-gray-900 to-black rounded-2xl 
                        border border-white/10 shadow-2xl shadow-purple-500/20
                        transition-all duration-300 ease-out transform
                        ${getModalAnimationClass()}`}>
          
          <button
            onClick={handleBackToLogin}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-8">
            <div className="text-center mb-8 transform transition-all duration-300 delay-100">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 
                            rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Verify Your Identity</h2>
              <p className="text-white/60 text-sm">
                We've sent a verification code to<br />
                <span className="text-purple-400 font-medium">{tempUserEmail}</span>
              </p>
              <p className="text-yellow-500/60 text-xs mt-2">
                🔐 Demo Mode: Use code <span className="font-mono font-bold text-yellow-400">000000</span>
              </p>
            </div>
            
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              {/* OTP Input Fields */}
              <div className="flex justify-center gap-2 sm:gap-3 transform transition-all duration-300 delay-150">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold
                             bg-white/5 border-2 border-white/10 rounded-xl text-white
                             focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30
                             transition-all duration-300"
                    placeholder="•"
                  />
                ))}
              </div>
              
              {/* Resend Code */}
              <div className="text-center transform transition-all duration-300 delay-200">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-300"
                  >
                    Didn't receive code? Resend
                  </button>
                ) : (
                  <p className="text-sm text-white/40">
                    Resend code in <span className="text-purple-400">{timeLeft}s</span>
                  </p>
                )}
              </div>
              
              {otpError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg transform transition-all duration-300">
                  <p className="text-red-400 text-sm text-center">{otpError}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg 
                         hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 
                         transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed
                         relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : 'Verify & Continue'}
                </span>
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              
              <p className="text-center text-white/40 text-xs">
                Enter the 6-digit verification code sent to your email
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show Login Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-all duration-300 ease-out opacity-100"
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-md bg-gradient-to-b from-gray-900 to-black rounded-2xl 
                      border border-white/10 shadow-2xl shadow-purple-500/20
                      transition-all duration-300 ease-out transform
                      ${getModalAnimationClass()}`}>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-8">
          <div className="text-center mb-8 transform transition-all duration-300 delay-100">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-white/60">Sign in to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="transform transition-all duration-300 delay-150">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                         placeholder-white/40 focus:outline-none focus:border-purple-500 
                         focus:ring-1 focus:ring-purple-500 transition-colors duration-300"
                placeholder="you@example.com"
              />
            </div>
            
            <div className="transform transition-all duration-300 delay-200">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                         placeholder-white/40 focus:outline-none focus:border-purple-500 
                         focus:ring-1 focus:ring-purple-500 transition-colors duration-300"
                placeholder="••••••••"
              />
            </div>
            
            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between transform transition-all duration-300 delay-250">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-purple-500/50 bg-black 
                             checked:bg-purple-500 checked:border-purple-500
                             focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-transparent
                             cursor-pointer transition-all duration-200
                             appearance-none checked:bg-gradient-to-r checked:from-purple-500 checked:to-blue-500"
                    style={{ accentColor: '#A855F7' }}
                  />
                  {rememberMe && (
                    <svg 
                      className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-white/60 group-hover:text-white transition-colors duration-200">
                  Remember me
                </span>
              </label>
              
              <button
                type="button"
                className="text-sm text-white/40 hover:text-purple-400 transition-colors duration-300"
                onClick={() => {/* Handle forgot password */}}
              >
                Forgot password?
              </button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg transform transition-all duration-300">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg 
                       hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 
                       transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed
                       relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </span>
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-b from-gray-900 to-black text-white/40">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 
                       rounded-lg text-white font-medium hover:bg-white/10 hover:border-purple-500/50 
                       transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 
                       disabled:cursor-not-allowed group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* GitHub Login Button */}
            <button
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 
                       rounded-lg text-white font-medium hover:bg-white/10 hover:border-purple-500/50 
                       transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 
                       disabled:cursor-not-allowed group"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>
          
          <p className="text-center text-white/60 text-sm mt-6 transform transition-all duration-300 delay-300">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-medium hover:opacity-80 transition-opacity duration-300"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
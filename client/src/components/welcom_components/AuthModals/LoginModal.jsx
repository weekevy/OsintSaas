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
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }, [showOTP]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(0, 1);
    setOtpCode(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
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
    
    if (otpValue === '000000') {
      setShowOTP(false);
      onClose();
      setFormData({ email: '', password: '' });
      setRememberMe(false);
      setOtpCode(['', '', '', '', '', '']);
      setIsLoading(false);
      finalizeLogin();
    } else {
      setOtpError('Invalid verification code. Please use 000000 for testing.');
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
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
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-300 ease-out opacity-100" onClick={handleBackToLogin} />
        
        <div className={`relative w-full max-w-md bg-[#090c0e] border border-white/10 shadow-2xl shadow-[#00ff88]/10 transition-all duration-300 ease-out transform ${getModalAnimationClass()}`}>
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#00ff88]/40" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#00ff88]/40" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#00ff88]/40" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#00ff88]/40" />
          
          <button onClick={handleBackToLogin} className="absolute top-4 right-4 text-white/40 hover:text-[#00ff88] transition-colors duration-300 z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 border border-[#00ff88]/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-white mb-1">Verify Identity</h2>
              <p className="text-white/40 text-[11px] font-mono">Code sent to <span className="text-[#00ff88]">{tempUserEmail}</span></p>
              <p className="text-[#00ff88]/50 text-[9px] font-mono mt-2 uppercase tracking-[0.08em]">Demo Mode: Use 000000</p>
            </div>
            
            <form onSubmit={handleOTPSubmit} className="space-y-5">
              <div className="flex justify-center gap-2">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-mono font-bold bg-[#0d1114] border border-white/10 text-white focus:outline-none focus:border-[#00ff88]/50 transition-all"
                    placeholder="•"
                  />
                ))}
              </div>
              
              <div className="text-center">
                {canResend ? (
                  <button type="button" onClick={handleResendCode} disabled={isLoading} className="text-[10px] font-mono uppercase tracking-[0.08em] text-[#00ff88]/70 hover:text-[#00ff88] transition-colors">Resend Code</button>
                ) : (
                  <p className="text-[9px] font-mono text-white/40 uppercase tracking-[0.08em]">Resend in <span className="text-[#00ff88]">{timeLeft}s</span></p>
                )}
              </div>
              
              {otpError && <div className="p-2 bg-[#f87171]/10 border border-[#f87171]/30"><p className="text-[#f87171] text-[10px] font-mono text-center">{otpError}</p></div>}
              
              <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-mono text-[10px] uppercase tracking-[0.08em] hover:bg-[#00ff88]/20 transition-all duration-300 disabled:opacity-50">
                {isLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-3 w-3 text-[#00ff88]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Verifying</span> : 'Verify & Continue'}
              </button>
              
              <p className="text-center text-white/30 text-[8px] font-mono uppercase tracking-[0.08em]">Enter 6-digit verification code</p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show Login Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-300 ease-out opacity-100" onClick={onClose} />
      
      <div className={`relative w-full max-w-md bg-[#090c0e] border border-white/10 shadow-2xl shadow-[#00ff88]/10 transition-all duration-300 ease-out transform ${getModalAnimationClass()}`}>
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#00ff88]/40" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#00ff88]/40" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#00ff88]/40" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#00ff88]/40" />
        
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-[#00ff88] transition-colors duration-300 z-10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="font-display text-xl font-bold text-white mb-1">Access Terminal</h2>
            <p className="text-white/40 text-[11px] font-mono uppercase tracking-[0.08em]">Sign in to continue</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-[9px] font-mono uppercase tracking-[0.08em] mb-1">Email Address</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#00ff88]/50 transition-colors" placeholder="user@domain.com" />
            </div>
            
            <div>
              <label className="block text-white/50 text-[9px] font-mono uppercase tracking-[0.08em] mb-1">Password</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#00ff88]/50 transition-colors" placeholder="••••••••" />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-3 h-3 border border-white/20 bg-[#0d1114] checked:bg-[#00ff88] checked:border-[#00ff88] focus:outline-none cursor-pointer transition-all" />
                <span className="text-[9px] font-mono uppercase tracking-[0.08em] text-white/40 group-hover:text-white/60 transition-colors">Remember</span>
              </label>
              <button type="button" className="text-[9px] font-mono uppercase tracking-[0.08em] text-white/30 hover:text-[#00ff88] transition-colors">Forgot?</button>
            </div>
            
            {error && <div className="p-2 bg-[#f87171]/10 border border-[#f87171]/30"><p className="text-[#f87171] text-[10px] font-mono text-center">{error}</p></div>}
            
            <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-mono text-[10px] uppercase tracking-[0.08em] hover:bg-[#00ff88]/20 transition-all duration-300 disabled:opacity-50">
              {isLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-3 w-3 text-[#00ff88]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Signing in</span> : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-[9px]"><span className="px-2 bg-[#090c0e] text-white/30 font-mono uppercase tracking-[0.08em]">Or continue with</span></div>
          </div>

          {/* Social Login Buttons - Tactical Style */}
          <div className="space-y-2.5">
            <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/10 text-white/60 hover:border-[#00ff88]/30 hover:text-[#00ff88] font-mono text-[9px] uppercase tracking-[0.08em] transition-all duration-300">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span>Google</span>
            </button>
            
            <button onClick={handleGithubLogin} disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/10 text-white/60 hover:border-[#00ff88]/30 hover:text-[#00ff88] font-mono text-[9px] uppercase tracking-[0.08em] transition-all duration-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              <span>GitHub</span>
            </button>
          </div>
          
          <p className="text-center text-white/30 text-[9px] font-mono uppercase tracking-[0.08em] mt-5">
            No account?{' '}
            <button type="button" onClick={onSwitchToRegister} className="text-[#00ff88] hover:opacity-80 transition-opacity">
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
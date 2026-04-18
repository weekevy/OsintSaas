import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin, modalAnimation }) => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [tempUserEmail, setTempUserEmail] = useState('');
  const [tempUserPassword, setTempUserPassword] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { register, finalizeLogin } = useAuth();

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
        const firstInput = document.getElementById('reg-otp-0');
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
      const nextInput = document.getElementById(`reg-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`reg-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');

    const result = await register(formData.email, formData.password);
    
    if (result.success) {
      setTempUserEmail(formData.email);
      setTempUserPassword(formData.password);
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
      setFormData({ email: '', password: '', confirmPassword: '' });
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

  const handleBackToRegister = () => {
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
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-300 ease-out opacity-100" onClick={handleBackToRegister} />
        
        <div className={`relative w-full max-w-md bg-[#090c0e] border border-white/10 shadow-2xl shadow-[#00ff88]/10 transition-all duration-300 ease-out transform ${getModalAnimationClass()}`}>
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#00ff88]/40" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#00ff88]/40" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#00ff88]/40" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#00ff88]/40" />
          
          <button onClick={handleBackToRegister} className="absolute top-4 right-4 text-white/40 hover:text-[#00ff88] transition-colors duration-300 z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 border border-[#00ff88]/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-white mb-1">Verify Email</h2>
              <p className="text-white/40 text-[11px] font-mono">Code sent to <span className="text-[#00ff88]">{tempUserEmail}</span></p>
              <p className="text-[#00ff88]/50 text-[9px] font-mono mt-2 uppercase tracking-[0.08em]">Demo Mode: Use 000000</p>
            </div>
            
            <form onSubmit={handleOTPSubmit} className="space-y-5">
              <div className="flex justify-center gap-2">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`reg-otp-${index}`}
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
                {isLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-3 w-3 text-[#00ff88]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Verifying</span> : 'Verify & Activate'}
              </button>
              
              <p className="text-center text-white/30 text-[8px] font-mono uppercase tracking-[0.08em]">Enter 6-digit verification code</p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show Register Modal
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
            <h2 className="font-display text-xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-white/40 text-[11px] font-mono uppercase tracking-[0.08em]">Register for access</p>
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
            
            <div>
              <label className="block text-white/50 text-[9px] font-mono uppercase tracking-[0.08em] mb-1">Confirm Password</label>
              <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full px-3 py-2 bg-[#0d1114] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#00ff88]/50 transition-colors" placeholder="••••••••" />
            </div>
            
            {error && <div className="p-2 bg-[#f87171]/10 border border-[#f87171]/30"><p className="text-[#f87171] text-[10px] font-mono text-center">{error}</p></div>}
            
            <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-mono text-[10px] uppercase tracking-[0.08em] hover:bg-[#00ff88]/20 transition-all duration-300 disabled:opacity-50">
              {isLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-3 w-3 text-[#00ff88]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating</span> : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-5 text-center">
            <p className="text-white/30 text-[9px] font-mono uppercase tracking-[0.08em]">
              Already have an account?{' '}
              <button type="button" onClick={onSwitchToLogin} className="text-[#00ff88] hover:opacity-80 transition-opacity">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ModalContainer from './ModalContainer';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [tempUserEmail, setTempUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { register, googleLogin, githubLogin, finalizeLogin } = useAuth();

  useEffect(() => {
    if (showOTP && timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showOTP && timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timeLeft, canResend, showOTP]);

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
      setShowOTP(true);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otpCode.join('');
    if (otpValue.length !== 6) {
      setOtpError('Enter 6-digit code');
      return;
    }
    setIsLoading(true);
    if (otpValue === '000000') {
      onClose();
      finalizeLogin();
    } else {
      setOtpError('Invalid code. Use 000000 for testing.');
    }
    setIsLoading(false);
  };

  const renderRegisterForm = () => (
    <div className="p-8 md:p-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-white/40 text-sm md:text-base font-medium">Join the intelligence network</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Email Identity</label>
          <input 
            type="email" 
            required 
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all duration-300 hover:bg-white/10 focus:scale-[1.01]" 
            placeholder="agent@osintsaas.com" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all duration-300 hover:bg-white/10 focus:scale-[1.01]" 
              placeholder="••••••••" 
            />
          </div>
          <div>
            <label className="block text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Confirm</label>
            <input 
              type="password" 
              required 
              value={formData.confirmPassword} 
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
              className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all duration-300 hover:bg-white/10 focus:scale-[1.01]" 
              placeholder="••••••••" 
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs font-bold text-center animate-shake">{error}</p>}
        
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full py-4 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Create Account'}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
        <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-black text-white/20 font-bold uppercase tracking-widest">Or continue with</span></div>
      </div>

      {/* Stacked OAuth buttons - full width, one below another */}
      <div className="space-y-3 mb-8">
        <button 
          onClick={googleLogin} 
          className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group"
        >
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-bold text-white/80">Continue with Google</span>
        </button>
        
        <button 
          onClick={githubLogin} 
          className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group"
        >
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          <span className="text-sm font-bold text-white/80">Continue with GitHub</span>
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs font-bold text-white/20 uppercase tracking-widest">
          Already Enrolled?{' '}
          <button onClick={onSwitchToLogin} className="text-[#00E5FF] hover:text-[#00D4EB] transition-all duration-200 inline-block">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );

  const renderOTPForm = () => (
    <div className="p-8 md:p-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Verify Your Email</h2>
        <p className="text-white/40 text-sm md:text-base font-medium">
          We sent a code to <span className="text-[#00E5FF]">{tempUserEmail}</span>
        </p>
      </div>
      
      <form onSubmit={handleOTPSubmit} className="space-y-8">
        <div className="flex justify-center gap-3">
          {otpCode.map((digit, index) => (
            <input
              key={index}
              id={`reg-otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className="w-14 h-16 text-center text-2xl font-black bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all duration-300 focus:scale-105 hover:bg-white/10"
              placeholder="•"
            />
          ))}
        </div>
        
        <div className="text-center">
          {canResend ? (
            <button type="button" onClick={() => setTimeLeft(60)} className="text-xs font-bold uppercase tracking-widest text-[#00E5FF] transition-all duration-200">
              Resend Code
            </button>
          ) : (
            <p className="text-xs font-bold uppercase tracking-widest text-white/20">
              Resend in <span className="text-[#00E5FF]">{timeLeft}s</span>
            </p>
          )}
        </div>
        
        {otpError && <p className="text-red-400 text-xs font-bold text-center animate-shake">{otpError}</p>}
        
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full py-4 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
        >
          {isLoading ? 'Verifying...' : 'Complete Registration'}
        </button>

        <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] animate-pulse-slow">
          Demo: Use 000000
        </p>
      </form>
    </div>
  );

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} customWidth="max-w-2xl">
      {showOTP ? renderOTPForm() : renderRegisterForm()}
    </ModalContainer>
  );
};

export default RegisterModal;
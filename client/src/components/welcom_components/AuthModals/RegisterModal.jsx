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
  const { register, finalizeLogin } = useAuth();

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
    <div className="p-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">New Account</h2>
        <p className="text-white/40 text-sm font-medium">Join the intelligence network</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Email Identity</label>
          <input 
            type="email" 
            required 
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all" 
            placeholder="agent@osintsaas.com" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all" 
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
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all" 
              placeholder="••••••••" 
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs font-bold text-center">{error}</p>}
        
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full py-4 bg-[#00E5FF] text-black font-bold rounded-xl hover:bg-[#00D4EB] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs font-bold text-white/20 uppercase tracking-widest">
          Already Enrolled?{' '}
          <button onClick={onSwitchToLogin} className="text-[#00E5FF] hover:text-[#00D4EB] transition-colors">Sign In</button>
        </p>
      </div>
    </div>
  );

  const renderOTPForm = () => (
    <div className="p-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Email Verification</h2>
        <p className="text-white/40 text-sm font-medium">Verify <span className="text-[#00E5FF]">{tempUserEmail}</span></p>
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
              className="w-12 h-16 text-center text-2xl font-black bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all"
              placeholder="•"
            />
          ))}
        </div>
        
        <div className="text-center">
          {canResend ? (
            <button type="button" onClick={() => setTimeLeft(60)} className="text-xs font-bold uppercase tracking-widest text-[#00E5FF]">Resend Code</button>
          ) : (
            <p className="text-xs font-bold uppercase tracking-widest text-white/20">Resend in <span className="text-[#00E5FF]">{timeLeft}s</span></p>
          )}
        </div>
        
        {otpError && <p className="text-red-400 text-xs font-bold text-center">{otpError}</p>}
        
        <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#00E5FF] text-black font-bold rounded-xl hover:bg-[#00D4EB] transition-all">
          {isLoading ? 'Verifying...' : 'Complete Registration'}
        </button>

        <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Demo: Use 000000</p>
      </form>
    </div>
  );

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      {showOTP ? renderOTPForm() : renderRegisterForm()}
    </ModalContainer>
  );
};

export default RegisterModal;
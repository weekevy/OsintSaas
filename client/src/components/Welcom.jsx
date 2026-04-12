import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  BackgroundEffects,
  Navbar,
  MobileMenu,
  HomeSection,
  AboutSection,
  ServicesSection,
  FaqSection,
  Footer,
  LoginModal,
  RegisterModal,
} from './welcom_components';
import GlobalStyles from './welcom_components/GlobalStyles';

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalAnimation, setModalAnimation] = useState('closed');
  const [tempUserEmail, setTempUserEmail] = useState('');
  const [tempUserPassword, setTempUserPassword] = useState('');
  
  // Refs for smooth scrolling
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const faqRef = useRef(null);

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  // Mouse move effect for gradient
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth scroll function
  const scrollToSection = (sectionRef, path) => {
    navigate(path, { replace: true });
    setTimeout(() => {
      if (sectionRef?.current) {
        sectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 50);
  };

  const navItems = [
    { name: "Start", path: "/", ref: homeRef },
    { name: "Vision", path: "/about", ref: aboutRef },
    { name: "Solutions", path: "/services", ref: servicesRef },
    { name: "Answers", path: "/faq", ref: faqRef }
  ];

  // Modal handlers
  const openLoginModal = () => {
    setModalAnimation('opening');
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
    setIsOTPModalOpen(false);
    setLoginError('');
    setTimeout(() => setModalAnimation('open'), 50);
  };

  const openRegisterModal = () => {
    setModalAnimation('opening');
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    setIsOTPModalOpen(false);
    setRegisterError('');
    setTimeout(() => setModalAnimation('open'), 50);
  };

  const openOTPModal = (email, password) => {
    console.log('Opening OTP modal for:', email);
    setTempUserEmail(email);
    setTempUserPassword(password);
    // Close login/register modals first
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    // Then open OTP modal
    setTimeout(() => {
      setModalAnimation('opening');
      setIsOTPModalOpen(true);
      setOtpError('');
      setTimeout(() => setModalAnimation('open'), 50);
    }, 100);
  };

  const switchToLogin = () => {
    setModalAnimation('switching');
    setTimeout(() => {
      setIsRegisterModalOpen(false);
      setIsOTPModalOpen(false);
      setIsLoginModalOpen(true);
      setLoginError('');
      setModalAnimation('open');
    }, 200);
  };

  const switchToRegister = () => {
    setModalAnimation('switching');
    setTimeout(() => {
      setIsLoginModalOpen(false);
      setIsOTPModalOpen(false);
      setIsRegisterModalOpen(true);
      setRegisterError('');
      setModalAnimation('open');
    }, 200);
  };

  const closeModals = () => {
    setModalAnimation('closing');
    setTimeout(() => {
      setIsLoginModalOpen(false);
      setIsRegisterModalOpen(false);
      setIsOTPModalOpen(false);
      setModalAnimation('closed');
      setLoginData({ email: '', password: '' });
      setRegisterData({ email: '', password: '', confirmPassword: '' });
      setLoginError('');
      setRegisterError('');
      setOtpError('');
      setTempUserEmail('');
      setTempUserPassword('');
    }, 300);
  };

  // Handle login with OTP flow (DEMO MODE)
  const handleLogin = async (email, password, rememberMe) => {
    console.log('Login attempt with:', email, password);
    setIsLoading(true);
    setLoginError('');
    
    // DEMO MODE: Accept any non-empty email/password
    setTimeout(() => {
      if (email && email.includes('@') && password.length >= 1) {
        console.log('Login successful, opening OTP modal');
        openOTPModal(email, password);
      } else {
        setLoginError('Invalid email or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  // Handle OTP verification
  const handleOTPVerification = async (otpCode) => {
    console.log('Verifying OTP:', otpCode);
    setIsLoading(true);
    setOtpError('');
    
    // Virtual OTP verification - accept "000000" for testing
    if (otpCode === '000000') {
      setTimeout(() => {
        console.log('OTP verified successfully!');
        // Store demo user in localStorage
        const demoUser = {
          id: 'demo123',
          email: tempUserEmail,
          name: 'Demo User',
          role: 'user'
        };
        localStorage.setItem('token', 'demo-token-12345');
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        // Close OTP modal and navigate
        setIsOTPModalOpen(false);
        setModalAnimation('closing');
        setTimeout(() => {
          setModalAnimation('closed');
          setTempUserEmail('');
          setTempUserPassword('');
          navigate('/home');
        }, 300);
        setIsLoading(false);
      }, 1000);
      return { success: true };
    } else {
      setIsLoading(false);
      setOtpError('Invalid verification code. Please use 000000 for testing.');
      return { success: false, error: 'Invalid verification code. Please use 000000 for testing.' };
    }
  };

  return (
    <div className="relative bg-black overflow-x-hidden">
      <BackgroundEffects mousePosition={mousePosition} />
      
      <Navbar 
        location={location}
        navItems={navItems}
        hasAnimated={hasAnimated}
        onNavClick={(item) => {
          scrollToSection(item.ref, item.path);
          setIsMenuOpen(false);
        }}
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />

      <MobileMenu 
        isOpen={isMenuOpen}
        navItems={navItems}
        location={location}
        onNavClick={(item) => {
          scrollToSection(item.ref, item.path);
          setIsMenuOpen(false);
        }}
        onLoginClick={() => {
          openLoginModal();
          setIsMenuOpen(false);
        }}
        onRegisterClick={() => {
          openRegisterModal();
          setIsMenuOpen(false);
        }}
        onClose={() => setIsMenuOpen(false)}
      />

      <HomeSection 
        ref={homeRef}
        hasAnimated={hasAnimated}
        onRegisterClick={openRegisterModal}
        onServicesClick={() => scrollToSection(servicesRef, '/services')}
      />

      <AboutSection ref={aboutRef} />
      <ServicesSection ref={servicesRef} />
      
      <FaqSection 
        ref={faqRef}
        onRegisterClick={openRegisterModal}
      />

      <Footer />

      <LoginModal
        isOpen={isLoginModalOpen}
        modalAnimation={modalAnimation}
        loginData={loginData}
        loginError={loginError}
        isLoading={isLoading}
        onLoginDataChange={setLoginData}
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin(loginData.email, loginData.password, false);
        }}
        onClose={closeModals}
        onSwitchToRegister={switchToRegister}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        modalAnimation={modalAnimation}
        registerData={registerData}
        registerError={registerError}
        isLoading={isLoading}
        onRegisterDataChange={setRegisterData}
        onSubmit={(e) => {
          e.preventDefault();
          
          if (registerData.password !== registerData.confirmPassword) {
            setRegisterError('Passwords do not match');
            return;
          }
          
          setIsLoading(true);
          setRegisterError('');
          
          setTimeout(() => {
            console.log('Registration successful for:', registerData.email);
            openOTPModal(registerData.email, registerData.password);
            setIsLoading(false);
          }, 1000);
        }}
        onClose={closeModals}
        onSwitchToLogin={switchToLogin}
      />


      <GlobalStyles/>
    </div>
  );
};

export default Welcome;
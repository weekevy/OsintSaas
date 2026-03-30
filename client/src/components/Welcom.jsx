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
  RegisterModal
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
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalAnimation, setModalAnimation] = useState('closed');
  
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
    setLoginError('');
    setTimeout(() => setModalAnimation('open'), 50);
  };

  const openRegisterModal = () => {
    setModalAnimation('opening');
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    setRegisterError('');
    setTimeout(() => setModalAnimation('open'), 50);
  };

  const switchToLogin = () => {
    setModalAnimation('switching');
    setTimeout(() => {
      setIsRegisterModalOpen(false);
      setIsLoginModalOpen(true);
      setLoginError('');
      setModalAnimation('open');
    }, 200);
  };

  const switchToRegister = () => {
    setModalAnimation('switching');
    setTimeout(() => {
      setIsLoginModalOpen(false);
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
      setModalAnimation('closed');
      setLoginData({ email: '', password: '' });
      setRegisterData({ email: '', password: '', confirmPassword: '' });
      setLoginError('');
      setRegisterError('');
    }, 300);
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
        onSubmit={async (e) => {
          e.preventDefault();
          setIsLoading(true);
          setLoginError('');
          
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: loginData.email,
                password: loginData.password
              })
            });

            const data = await response.json();

            if (response.ok) {
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              
              setModalAnimation('closing');
              setTimeout(() => {
                setIsLoginModalOpen(false);
                setModalAnimation('closed');
                setLoginData({ email: '', password: '' });
              }, 300);
            } else {
              setLoginError(data.error || data.message || 'Login failed');
            }
          } catch (error) {
            setLoginError('Network error. Please try again.');
          } finally {
            setIsLoading(false);
          }
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
        onSubmit={async (e) => {
          e.preventDefault();
          
          if (registerData.password !== registerData.confirmPassword) {
            setRegisterError('Passwords do not match');
            return;
          }
          
          setIsLoading(true);
          setRegisterError('');
          
          try {
            const response = await fetch('/api/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: registerData.email,
                password: registerData.password
              })
            });

            const data = await response.json();

            if (response.ok) {
              const loginResponse = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: registerData.email,
                  password: registerData.password
                })
              });

              const loginData = await loginResponse.json();

              if (loginResponse.ok) {
                localStorage.setItem('token', loginData.token);
                localStorage.setItem('user', JSON.stringify(loginData.user));
                
                setModalAnimation('closing');
                setTimeout(() => {
                  setIsRegisterModalOpen(false);
                  setModalAnimation('closed');
                  setRegisterData({ email: '', password: '', confirmPassword: '' });
                }, 300);
              }
            } else {
              setRegisterError(data.error || data.message || 'Registration failed');
            }
          } catch (error) {
            setRegisterError('Network error. Please try again.');
          } finally {
            setIsLoading(false);
          }
        }}
        onClose={closeModals}
        onSwitchToLogin={switchToLogin}
      />

    <GlobalStyles/>
    </div>
  );
};

export default Welcome;
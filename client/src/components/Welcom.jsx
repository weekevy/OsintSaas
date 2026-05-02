import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
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
import ChatAssistant from './common/ChatAssistant';
import SessionExpiredModal from './common/SessionExpiredModal';
import { useSessionCheck } from '../hooks/useSessionCheck';
import { clearSession } from '../utils/authUtils';
import GlobalStyles from './welcom_components/GlobalStyles';

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const faqRef = useRef(null);

  const handleSessionExpired = useCallback(() => {
    clearSession();
    setShowExpiredModal(true);
  }, []);

  const handleCloseExpiredModal = useCallback(() => {
    setShowExpiredModal(false);
    navigate('/');
  }, [navigate]);

  useSessionCheck(handleSessionExpired);

  useEffect(() => {
    document.body.style.backgroundColor = '#000000';
    setHasAnimated(true);
  }, []);

  const scrollToSection = (sectionRef, path) => {
    navigate(path, { replace: true });
    setTimeout(() => {
      if (sectionRef?.current) {
        sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const navItems = [
    { name: "Start", path: "/", ref: homeRef },
    { name: "Vision", path: "/about", ref: aboutRef },
    { name: "Solutions", path: "/services", ref: servicesRef },
    { name: "Answers", path: "/faq", ref: faqRef }
  ];

  // FIXED: Correctly named functions
  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  return (
    <div className="relative bg-black overflow-x-hidden font-sans selection:bg-[#00E5FF]/30">
      <GlobalStyles/>
      
      <SessionExpiredModal 
        isOpen={showExpiredModal} 
        onClose={handleCloseExpiredModal}
      />
      
      <Navbar 
        location={location}
        navItems={navItems}
        hasAnimated={hasAnimated}
        onNavClick={(item) => { scrollToSection(item.ref, item.path); setIsMenuOpen(false); }}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onRegisterClick={() => setIsRegisterModalOpen(true)}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />

      <MobileMenu 
        isOpen={isMenuOpen}
        navItems={navItems}
        location={location}
        onNavClick={(item) => { scrollToSection(item.ref, item.path); setIsMenuOpen(false); }}
        onLoginClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }}
        onRegisterClick={() => { setIsRegisterModalOpen(true); setIsMenuOpen(false); }}
        onClose={() => setIsMenuOpen(false)}
      />

      <HomeSection 
        ref={homeRef} 
        hasAnimated={hasAnimated} 
        onRegisterClick={() => setIsRegisterModalOpen(true)} 
        onServicesClick={() => scrollToSection(servicesRef, '/services')} 
      />
      
      <AboutSection ref={aboutRef} />
      <ServicesSection ref={servicesRef} />
      <FaqSection ref={faqRef} onRegisterClick={() => setIsRegisterModalOpen(true)} />
      
      <Footer />

      {/* FIXED: Correct props passed to modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleSwitchToLogin}
      />

      <ChatAssistant />
    </div>
  );
};

export default Welcome;
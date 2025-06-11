import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${props => props.sidebarCollapsed ? '80px' : '280px'};
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <AppContainer className={darkMode ? 'dark-mode' : ''}>
      <Sidebar 
        collapsed={sidebarCollapsed} 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <MainContent sidebarCollapsed={sidebarCollapsed}>
        <Header 
          toggleSidebar={toggleSidebar}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
        />
        <ContentArea>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard activeSection={activeSection} />
          </motion.div>
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
}

export default App; 
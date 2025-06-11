import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiGrid, 
  FiActivity, 
  FiDollarSign, 
  FiSettings, 
  FiChevronLeft,
  FiZap
} from 'react-icons/fi';

const SidebarContainer = styled(motion.aside)`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${props => props.collapsed ? '80px' : '280px'};
  background: var(--surface);
  border-right: 1px solid var(--border-color);
  transition: width var(--transition-normal);
  z-index: 100;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    transform: translateX(${props => props.collapsed ? '-100%' : '0'});
  }
`;

const LogoSection = styled.div`
  padding: 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const LogoText = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  opacity: ${props => props.collapsed ? '0' : '1'};
  transition: opacity var(--transition-normal);
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 1.5rem 1rem;
`;

const NavItem = styled.div`
  position: relative;
  margin-bottom: 0.5rem;
`;

const NavLink = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.active ? 'var(--background)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;

  &:hover {
    background: var(--background);
    color: var(--text-primary);
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    opacity: ${props => props.collapsed ? '0' : '1'};
    transition: opacity var(--transition-normal);
  }

  ${props => props.active && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background: var(--primary-color);
      border-radius: 0 2px 2px 0;
    }
  `}
`;

const CollapseButton = styled.button`
  position: absolute;
  top: 2rem;
  right: -12px;
  width: 24px;
  height: 24px;
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 10;

  &:hover {
    background: var(--background);
  }

  svg {
    width: 16px;
    height: 16px;
    transform: rotate(${props => props.collapsed ? '180deg' : '0'});
    transition: transform var(--transition-normal);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'usage', label: 'Usage Analytics', icon: FiActivity },
  { id: 'pricing', label: 'Price Analytics', icon: FiDollarSign },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

const Sidebar = ({ collapsed, activeSection, setActiveSection }) => {
  return (
    <SidebarContainer collapsed={collapsed}>
      <LogoSection>
        <LogoIcon>
          <FiZap />
        </LogoIcon>
        <LogoText collapsed={collapsed}>EV Charging</LogoText>
      </LogoSection>

      <Navigation>
        {navItems.map(item => (
          <NavItem key={item.id}>
            <NavLink
              active={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
              collapsed={collapsed}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          </NavItem>
        ))}
      </Navigation>
    </SidebarContainer>
  );
};

export default Sidebar; 
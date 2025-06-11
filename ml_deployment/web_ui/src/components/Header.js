import React from 'react';
import styled from 'styled-components';
import { FiMenu, FiMoon, FiSun, FiBell, FiUser } from 'react-icons/fi';

const HeaderContainer = styled.header`
  height: 70px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 50;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MenuButton = styled.button`
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--background);
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const SearchBar = styled.div`
  position: relative;
  width: 300px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.625rem 1rem;
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-primary);
  transition: all var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  position: relative;

  &:hover {
    background: var(--background);
    color: var(--text-primary);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: var(--danger-color);
  border-radius: 50%;
  border: 2px solid var(--surface);
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--background);
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    
    span {
      display: none;
    }
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const UserName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const Header = ({ toggleSidebar, toggleDarkMode, darkMode }) => {
  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={toggleSidebar}>
          <FiMenu />
        </MenuButton>
        <SearchBar>
          <SearchInput placeholder="Search models, predictions..." />
        </SearchBar>
      </LeftSection>

      <RightSection>
        <IconButton onClick={toggleDarkMode}>
          {darkMode ? <FiSun /> : <FiMoon />}
        </IconButton>
        
        <IconButton>
          <FiBell />
          <NotificationBadge />
        </IconButton>

        <UserButton>
          <UserAvatar>
            <FiUser />
          </UserAvatar>
          <UserName>Admin User</UserName>
        </UserButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header; 
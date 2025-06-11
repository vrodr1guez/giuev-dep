declare module 'react-router-dom' {
  import { ComponentType, ReactNode } from 'react';

  export interface RouteProps {
    path?: string;
    element?: ReactNode;
    children?: ReactNode;
  }

  export interface LinkProps {
    to: string;
    children?: ReactNode;
    className?: string;
  }

  export interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: unknown;
    key: string;
  }

  export function useLocation(): Location;

  export const BrowserRouter: ComponentType<{ children?: ReactNode }>;
  export const Routes: ComponentType<{ children?: ReactNode }>;
  export const Route: ComponentType<RouteProps>;
  export const Link: ComponentType<LinkProps>;
  export const Outlet: ComponentType;
  
  export { BrowserRouter as Router };
} 
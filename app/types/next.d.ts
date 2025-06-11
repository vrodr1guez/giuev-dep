declare module 'next/link' {
  import { ReactNode } from 'react';

  interface LinkProps {
    href: string;
    children?: ReactNode;
    className?: string;
  }

  const Link: React.FC<LinkProps>;
  export default Link;
} 
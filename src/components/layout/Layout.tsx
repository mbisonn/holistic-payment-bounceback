
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;

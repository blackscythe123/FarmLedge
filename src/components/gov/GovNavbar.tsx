import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, FileCheck, Truck, ShoppingCart, BarChart3, BookOpen, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const GovNavbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Farmers', path: '/farmers', icon: Users },
    { name: 'Verifiers', path: '/verifiers', icon: FileCheck },
    { name: 'Distributors', path: '/distributors', icon: Truck },
    { name: 'Retailers', path: '/retailers', icon: ShoppingCart },
    { name: 'Consumers', path: '/consumers', icon: ShoppingCart },
    { name: 'Price Prediction', path: '/price-prediction', icon: BarChart3 },
    { name: 'Guide', path: '/how-it-works', icon: BookOpen },
  ];

  return (
    <nav className="bg-primary text-white shadow-md sticky top-0 z-50 border-t border-primary-foreground/10">
      <div className="container mx-auto">
        <ul className="flex flex-wrap items-center justify-center md:justify-start">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="flex-1 md:flex-none">
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 lg:px-5 py-3 text-sm font-medium transition-all hover:bg-black/20 border-r border-primary-foreground/10 whitespace-nowrap h-full",
                    isActive && "bg-secondary text-secondary-foreground font-bold shadow-inner"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              </li>
            );
          })}
           
           <li className="ml-auto flex-1 md:flex-none">
                {user ? (
                    <div className="flex items-center">
                        <Link
                            to="/admin"
                            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium hover:bg-black/20 border-l border-primary-foreground/10"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="hidden md:inline">Dashboard</span>
                        </Link>
                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-red-700 hover:bg-red-800 transition-colors text-white"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-secondary text-secondary-foreground hover:bg-yellow-400 transition-colors shadow-lg"
                    >
                        <LogIn className="w-4 h-4" />
                        Login
                    </Link>
                )}
           </li>
        </ul>
      </div>
    </nav>
  );
};

export default GovNavbar;

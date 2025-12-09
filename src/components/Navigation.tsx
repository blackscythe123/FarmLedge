import { Button } from "@/components/ui/button";
import {
  Leaf,
  Menu,
  Phone,
  Search,
  Home,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { useFontSize } from "@/context/FontSizeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import odishaLogo from "@/assets/odisha-logo.jpg";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize();

  const navItems = [
    { label: t("nav.home"), href: "/", icon: Home },
    { 
      label: "About Us", 
      href: "#",
      children: [
        { label: "About Department", href: "/about" },
        { label: "Organizational Structure", href: "/structure" },
        { label: "Directory", href: "/directory" },
      ]
    },
    { 
      label: "Schemes & Services", 
      href: "#",
      children: [
        { label: "Govt Schemes", href: "/gov-schemes" },
        { label: "Price Prediction", href: "/price-prediction" },
        { label: "Weather Alerts", href: "/weather-alerts" },
        { label: "Storage Services", href: "/storage-services" },
      ]
    },
    {
      label: "Farmer's Corner",
      href: "#",
      children: [
        { label: "Farmer Registration", href: "/join" },
        { label: "Check Status", href: "/status" },
        { label: "Zero-loss Guides", href: "/farmer/guides" },
      ]
    },
    { label: "Tenders", href: "/tenders" },
    { label: "Contact Us", href: "/support" },
  ];

  return (
    <div className="flex flex-col w-full font-sans">
      {/* Top Bar - Accessibility & Govt Info */}
      <div className="bg-[#1a1a1a] text-white py-1.5 px-4 text-xs md:text-sm border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline hover:underline cursor-pointer">Government of Odisha</span>
            <span className="hidden sm:inline text-gray-500">|</span>
            <a href="#main-content" className="hover:underline hover:text-yellow-400">Skip to Main Content</a>
            <span className="hidden sm:inline text-gray-500">|</span>
            <span className="flex items-center gap-2">
              <span className="sr-only">Font Size</span>
              <button onClick={decreaseFontSize} className="font-bold px-1 hover:text-yellow-400">A-</button>
              <button onClick={resetFontSize} className="font-bold px-1 hover:text-yellow-400">A</button>
              <button onClick={increaseFontSize} className="font-bold px-1 hover:text-yellow-400">A+</button>
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-yellow-400 font-bold">
               <Phone className="w-3 h-3" /> 155333 (Kisan Call Center)
             </div>
             <LanguageSwitcher />
             {user ? (
               <div className="flex items-center gap-2 pl-2 border-l border-gray-600">
                 <span className="text-emerald-400 font-medium">Welcome, {user.role}</span>
                 <Button variant="ghost" size="sm" onClick={logout} className="h-6 text-xs text-white hover:bg-neutral-700 hover:text-white px-2">
                   <LogOut className="w-3 h-3 mr-1" /> Logout
                 </Button>
               </div>
             ) : (
               <Link to="/login" className="hover:text-yellow-400 font-medium pl-2 border-l border-gray-600">Login / Register</Link>
             )}
          </div>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="bg-white py-3 md:py-5 shadow-sm relative overflow-hidden">
         <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-center md:justify-start">
               {/* Mobile Logo Size fixed */}
               <img src={odishaLogo} alt="Odisha Govt Logo" className="h-14 md:h-20 drop-shadow-sm" />
               <div className="text-center md:text-left">
                  <h1 className="text-lg md:text-3xl font-bold text-gray-900 leading-tight">
                    कृषि एवं किसान सशक्तicरण विभाग
                  </h1>
                  <h2 className="text-base md:text-2xl font-bold text-[#d32f2f] uppercase tracking-tight">
                    Department of Agriculture & Farmers' Empowerment
                  </h2>
                  <p className="text-xs md:text-base font-bold text-gray-600 uppercase tracking-widest mt-0.5">Government of Odisha</p>
               </div>
            </div>
            
            {/* Right Side Branding / Logos */}
            <div className="hidden lg:flex items-center gap-4">
               <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100 shadow-inner">
                  <Leaf className="h-8 w-8 text-orange-600" />
               </div>
               <div className="h-16 w-auto border-l-2 border-gray-200 pl-4 flex flex-col justify-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">Powered By</span>
                  <span className="text-lg font-black text-emerald-800 tracking-tighter">FarmLedge</span>
               </div>
            </div>
         </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-[#047857] text-white shadow-lg sticky top-0 z-50 border-t-4 border-[#fbbf24]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-12">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost" 
              className="md:hidden text-white hover:bg-[#065f46]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center h-full space-x-1">
               {navItems.map((item, idx) => (
                 item.children ? (
                   <DropdownMenu key={idx}>
                     <DropdownMenuTrigger className="flex items-center px-4 h-full text-sm font-semibold hover:bg-[#065f46] transition-colors gap-1 uppercase outline-none focus:bg-[#065f46]">
                       {item.label} <ChevronDown className="w-3 h-3 opacity-70" />
                     </DropdownMenuTrigger>
                     <DropdownMenuContent className="w-64 bg-white rounded-none border-t-4 border-[#fbbf24] shadow-xl mt-0 p-0">
                       {item.children.map((child, cIdx) => (
                         <DropdownMenuItem key={cIdx} asChild className="focus:bg-green-50 focus:text-green-900 cursor-pointer rounded-none border-b border-gray-100 last:border-0 py-3 px-4">
                           <Link to={child.href} className="flex flex-col items-start">
                             <span className="font-semibold">{child.label}</span>
                           </Link>
                         </DropdownMenuItem>
                       ))}
                     </DropdownMenuContent>
                   </DropdownMenu>
                 ) : (
                   <Link 
                     key={idx} 
                     to={item.href}
                     className="flex items-center px-5 h-full text-sm font-semibold hover:bg-[#065f46] transition-colors uppercase border-r border-[#065f46] last:border-0 hover:border-[#047857]"
                   >
                     {/* {item.icon && <item.icon className="w-4 h-4 mr-2 opacity-80" />} */}
                     {item.label}
                   </Link>
                 )
               ))}
            </div>

            {/* Search Icon */}
            <div className="hidden md:flex items-center px-5 border-l border-[#065f46] h-full hover:bg-[#065f46] cursor-pointer bg-[#059669]">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#064e3b] border-t border-[#047857]">
             {navItems.map((item, idx) => (
               <div key={idx}>
                 {item.children ? (
                   <>
                    <div className="px-4 py-2 font-bold bg-[#047857] text-white text-xs uppercase tracking-wider mt-1">{item.label}</div>
                    {item.children.map((child, cIdx) => (
                      <Link 
                        key={cIdx} 
                        to={child.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-8 py-3 text-sm text-gray-100 hover:bg-[#065f46] border-b border-[#065f46]/50 pl-6"
                      >
                        {child.label}
                      </Link>
                    ))}
                   </>
                 ) : (
                   <Link 
                     to={item.href}
                     onClick={() => setIsMenuOpen(false)}
                     className="block px-4 py-3 text-sm font-medium text-white hover:bg-[#047857] border-b border-[#047857]"
                   >
                     {item.label}
                   </Link>
                 )}
               </div>
             ))}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navigation;
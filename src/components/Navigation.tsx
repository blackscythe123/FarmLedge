import { Button } from "@/components/ui/button";
import {
  Leaf,
  Menu,
  X,
  User,
  LogOut,
  Type,
  Users
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize();

  const navItems = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.pricePrediction"), href: "/price-prediction" },
    {
      label: t("nav.services"),
      href: "#",
      children: [
        { label: t("nav.weatherAlerts"), href: "/weather-alerts" },
        { label: t("nav.storageServices"), href: "/storage-services" },
        { label: t("nav.locationServices"), href: "/location-services" },
        { label: t("nav.govSchemes"), href: "/gov-schemes" },
        { label: t("nav.zeroLossGuides"), href: "/farmer/guides" }
      ]
    },
    {
      label: t("nav.aboutUs"),
      href: "#",
      children: [
        { label: t("nav.howItWorks"), href: "/how-it-works" },
        { label: t("nav.blockchainGuide"), href: "/blockchain-guide" },
        { label: t("nav.fairTrade"), href: "/fair-trade" },
        { label: t("nav.apiDocs"), href: "/api-docs" },
        { label: t("nav.support"), href: "/support" },
      ]
    },
  ];

  const truncateAddress = (addr?: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm font-sans transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-emerald-900 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="font-serif font-bold text-xl text-emerald-900 tracking-tight">FarmLedge</h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{t('hero.badge')}</p>
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
              item.children ? (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className="text-sm font-medium text-slate-600 hover:text-emerald-800 transition-colors relative group flex items-center gap-1 outline-none">
                    {item.label}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.label} asChild>
                        <Link to={child.href} className="cursor-pointer">
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-sm font-medium text-slate-600 hover:text-emerald-800 transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full" />
                </Link>
              )
            ))}
          </div>

          {/* Actions - Right */}
          <div className="hidden md:flex items-center gap-4">
            {/* Font Size Controls */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 mr-2">
              <button
                onClick={decreaseFontSize}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all"
                title="Decrease Font Size"
              >
                <div className="text-xs font-bold">A-</div>
              </button>
              <div className="w-px h-4 bg-slate-300 mx-1"></div>
              <button
                onClick={resetFontSize}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all"
                title="Reset Font Size"
              >
                <div className="text-sm font-bold">A</div>
              </button>
              <div className="w-px h-4 bg-slate-300 mx-1"></div>
              <button
                onClick={increaseFontSize}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all"
                title="Increase Font Size"
              >
                <div className="text-base font-bold">A+</div>
              </button>
            </div>

            <LanguageSwitcher />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="pl-2 pr-4 gap-3 rounded-full border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 hover:border-emerald-300 transition-all">
                    <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-800" />
                    </div>
                    <div className="flex flex-col items-start text-xs">
                      <span className="font-semibold text-emerald-900 capitalize">{user.role}</span>
                      <span className="text-emerald-600/80 font-mono">{truncateAddress(user.address)}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/farmers">{t("nav.farmers")}</Link></DropdownMenuItem>
                  {user?.role === 'farmer' ? (
                    <DropdownMenuItem asChild><Link to="/farmer/guides">Zero-loss Guides</Link></DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem asChild><Link to="/distributors">{t("nav.distributors")}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/retailers">{t("nav.retailers")}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/consumers">{t("nav.consumers")}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/verifiers">{t("nav.verifiers")}</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button className="bg-emerald-900 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-900/20 rounded-full px-6">
                  <Users className="w-4 h-4 mr-2" />
                  {t("nav.login")}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-slate-100 animate-in slide-in-from-top-5">
            {navItems.map((item) => (
              item.children ? (
                <div key={item.label} className="space-y-2">
                  <div className="px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      className="block px-8 py-2 text-base font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block px-4 py-2 text-base font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            ))}

            {/* Mobile Font Controls */}
            <div className="px-4 flex items-center gap-4">
              <span className="text-sm text-slate-500">Font Size:</span>
              <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button onClick={decreaseFontSize} className="p-2 hover:bg-white rounded text-xs font-bold">A-</button>
                <button onClick={resetFontSize} className="p-2 hover:bg-white rounded text-sm font-bold">A</button>
                <button onClick={increaseFontSize} className="p-2 hover:bg-white rounded text-base font-bold">A+</button>
              </div>
            </div>

            <div className="px-4 pt-4 border-t border-slate-100">
              {user ? (
                <Button variant="destructive" className="w-full justify-start" onClick={() => { logout(); setIsMenuOpen(false); }}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </Button>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-emerald-900 text-white">
                    <Users className="w-4 h-4 mr-2" />
                    {t("nav.login")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
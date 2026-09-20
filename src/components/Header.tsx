import React, { useState } from 'react';
import {
  Sparkles,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ChevronDown,
  CreditCard,
} from 'lucide-react';
import { TabType } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSettings?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onAdminLoginClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onNavigateSection,
  onAdminLoginClick,
}) => {
  const { user, userProfile, isOwner, logout, openAuthModal, platformSettings } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (activeTab !== 'landing') {
      setActiveTab('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'المستخدم';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Platform Announcement Banner if configured */}
      {platformSettings.announcement.enabled && platformSettings.announcement.text && (
        <div
          className={`py-1.5 px-4 text-xs font-medium flex items-center justify-center gap-2 border-b text-center ${
            platformSettings.announcement.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : platformSettings.announcement.type === 'warning'
              ? 'bg-amber-500 text-slate-950 border-amber-600'
              : 'bg-slate-900 text-white border-slate-950'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{platformSettings.announcement.text}</span>
          {platformSettings.announcement.linkText && (
            <span className="underline mr-1 text-[11px] opacity-90 cursor-pointer">
              {platformSettings.announcement.linkText}
            </span>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div
            id="brand-logo"
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => {
              setActiveTab('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-xs shadow-emerald-500/20">
              {platformSettings.logoText || 'سـ'}
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                {platformSettings.platformName || 'سَوّيها'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                موقعك بالذكاء الاصطناعي
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {!user ? (
              // Guest Navigation
              <>
                <button
                  id="nav-home"
                  onClick={() => {
                    setActiveTab('landing');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'landing'
                      ? 'text-slate-900 bg-slate-100/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  الرئيسية
                </button>
                <button
                  id="nav-how-it-works"
                  onClick={() => handleSectionClick('how-it-works')}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  كيف تعمل
                </button>
                <button
                  id="nav-features"
                  onClick={() => handleSectionClick('features')}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  المزايا
                </button>
                <button
                  id="nav-examples"
                  onClick={() => handleSectionClick('examples')}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  نماذج المواقع
                </button>
                <button
                  id="nav-showcase"
                  onClick={() => {
                    setActiveTab('showcase');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'showcase'
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  معرض المواقع
                </button>
                <button
                  id="nav-pricing"
                  onClick={() => setActiveTab('pricing')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'pricing'
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  الأسعار
                </button>
              </>
            ) : (
              // Authenticated Navigation
              <>
                <button
                  id="nav-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>مشاريعي</span>
                </button>

                <button
                  id="nav-showcase-auth"
                  onClick={() => {
                    setActiveTab('showcase');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'showcase'
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>معرض المواقع</span>
                </button>

                <button
                  id="nav-pricing-auth"
                  onClick={() => setActiveTab('pricing')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'pricing'
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>الأسعار والترقية</span>
                </button>

                <button
                  id="nav-builder"
                  onClick={() => setActiveTab('builder')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'builder'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>إنشاء موقع (AI)</span>
                </button>
              </>
            )}
          </nav>

          {/* User & Action Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {!user ? (
              // Guest Actions
              <div className="flex items-center gap-2">
                <button
                  id="btn-admin-login-header"
                  type="button"
                  onClick={onAdminLoginClick}
                  className="h-10 px-3.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/90 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="دخول لوحة إدارة المنصة (للمالك)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>دخول الإدارة</span>
                </button>

                <button
                  id="btn-login-header"
                  onClick={() => openAuthModal('login')}
                  className="h-10 px-3.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  تسجيل الدخول
                </button>

                <button
                  id="btn-register-header"
                  onClick={() => openAuthModal('register')}
                  className="h-10 inline-flex items-center gap-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ابدأ مجاناً</span>
                </button>
              </div>
            ) : (
              // Authenticated User Menu
              <div className="flex items-center gap-2">
                {isOwner && (
                  <button
                    id="btn-admin-badge-header"
                    type="button"
                    onClick={() => {
                      setActiveTab('admin');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`h-10 px-3 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80'
                    }`}
                    title="لوحة تحكم مالك المنصة"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>لوحة الإدارة</span>
                  </button>
                )}
                <div className="relative">
                <button
                  id="user-menu-trigger"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="h-10 flex items-center gap-2 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {displayName[0].toUpperCase()}
                  </div>
                  <div className="text-right text-xs leading-tight">
                    <span className="font-semibold text-slate-800 block max-w-[110px] truncate">
                      {displayName}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-right animate-in fade-in duration-100 text-xs">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="font-bold text-slate-900 text-xs truncate">{displayName}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                        {isOwner && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                            مالك المنصة (Admin)
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('dashboard');
                        }}
                        className="w-full px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>مشاريعي</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('builder');
                        }}
                        className="w-full px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>إنشاء موقع جديد (AI)</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveTab('pricing');
                        }}
                        className="w-full px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>الخطط والترقية</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenSettings) onOpenSettings();
                        }}
                        className="w-full px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>إعدادات الحساب</span>
                      </button>

                      {isOwner && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setActiveTab('admin');
                          }}
                          className="w-full px-4 py-2.5 text-amber-800 bg-amber-50/60 hover:bg-amber-100 flex items-center gap-2.5 transition-colors font-bold cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>مركز تحكم الإدارة (Admin)</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {!user ? (
              <button
                onClick={() => openAuthModal('login')}
                className="h-9 px-3 bg-emerald-600 text-white font-semibold text-xs rounded-xl"
              >
                دخول
              </button>
            ) : null}

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1.5 text-right shadow-lg animate-in fade-in duration-100">
          {!user ? (
            // Guest Mobile Links
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab('landing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                الرئيسية
              </button>
              <button
                onClick={() => handleSectionClick('how-it-works')}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                كيف تعمل
              </button>
              <button
                onClick={() => handleSectionClick('features')}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                المزايا
              </button>
              <button
                onClick={() => handleSectionClick('examples')}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                نماذج المواقع
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab('showcase');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                معرض المواقع
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab('pricing');
                }}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                الأسعار والخطط
              </button>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  id="btn-admin-login-mobile"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onAdminLoginClick) onAdminLoginClick();
                  }}
                  className="w-full h-11 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>دخول الإدارة</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full h-11 text-center text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="w-full h-11 text-center text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  ابدأ الآن مجاناً
                </button>
              </div>
            </>
          ) : (
            // Authenticated Mobile Links
            <>
              <div className="p-3 bg-slate-50 rounded-xl mb-3 flex items-center gap-3 border border-slate-200/60">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {displayName[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 text-xs truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab('dashboard');
                }}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>مشاريعي</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab('showcase');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>معرض ومجتمع المواقع</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab('pricing');
                }}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>الخطط والترقية</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab('builder');
                }}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>إنشاء موقع جديد (AI)</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenSettings) onOpenSettings();
                }}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>إعدادات الحساب</span>
              </button>

              {isOwner && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveTab('admin');
                  }}
                  className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold text-amber-800 bg-amber-50 flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>مركز تحكم الإدارة (Admin)</span>
                </button>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

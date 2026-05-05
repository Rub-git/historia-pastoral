'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useLanguage } from './providers';
import { cn } from '@/lib/utils';
import {
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  CreditCard,
  GraduationCap,
  Crown,
  Church,
  FolderOpen,
  Calendar,
  Home,
} from 'lucide-react';
import Image from 'next/image';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const { t, language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('owner');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user role
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role || 'owner');
        }
      } catch (err) {
        console.error('Error fetching role:', err);
      }
    };
    if (session) {
      fetchRole();
    }
  }, [session]);

  if (!mounted || !session) return null;

  // Define nav items with role restrictions
  // Desktop nav items (logo serves as home link)
  const desktopNavItems = [
    { href: '/members', label: t('members'), icon: Users, roles: ['owner', 'admin'] },
    { href: '/discipleship', label: t('discipleship'), icon: GraduationCap, roles: ['owner', 'admin', 'leader'] },
    { href: '/calendar', label: language === 'es' ? 'Calendario' : 'Calendar', icon: Calendar, roles: ['owner', 'admin', 'leader'] },
    { href: '/leadership', label: language === 'es' ? 'Liderazgo' : 'Leadership', icon: Crown, roles: ['owner', 'admin', 'leader'] },
    { href: '/ministries', label: language === 'es' ? 'Ministerios' : 'Ministries', icon: Church, roles: ['owner', 'admin', 'leader'] },
    { href: '/resources', label: language === 'es' ? 'Recursos' : 'Resources', icon: FolderOpen, roles: ['owner', 'admin', 'leader'] },
    { href: '/pricing', label: language === 'es' ? 'Planes' : 'Plans', icon: CreditCard, roles: ['owner'] },
    { href: '/settings', label: t('settings'), icon: Settings, roles: ['owner', 'admin', 'leader'] },
  ];

  // Mobile nav items (includes Home since logo is smaller on mobile)
  const mobileNavItems = [
    { href: '/dashboard', label: language === 'es' ? 'Inicio' : 'Home', icon: Home, roles: ['owner', 'admin', 'leader'] },
    ...desktopNavItems,
  ];

  // Filter nav items based on user role
  const navItems = desktopNavItems.filter(item => item.roles.includes(userRole));
  const mobileItems = mobileNavItems.filter(item => item.roles.includes(userRole));

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-sage-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo - links to dashboard */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="Pastoral History"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="font-semibold text-lg text-sage-800 hidden sm:block font-serif">
                {t('appName')}
              </span>
            </Link>
          </div>

          {/* Desktop Nav - starts after logo with proper spacing */}
          <div className="hidden md:flex items-center gap-1 ml-6">
            {navItems?.map?.((item) => {
              const Icon = item?.icon;
              const isActive = pathname?.startsWith?.(item?.href);
              return (
                <Link
                  key={item?.href}
                  href={item?.href ?? '#'}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sage-100 text-sage-800'
                      : 'text-sage-600 hover:bg-sage-50 hover:text-sage-800'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item?.label}
                </Link>
              );
            })}
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-sage-600 hover:bg-sage-50 hover:text-sage-800 transition-colors ml-2"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-sage-600 hover:bg-sage-50 hover:text-sage-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-sage-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-sage-600" />
              ) : (
                <Menu className="w-6 h-6 text-sage-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sage-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {mobileItems?.map?.((item) => {
              const Icon = item?.icon;
              const isActive = item?.href === '/dashboard' 
                ? pathname === '/dashboard' 
                : pathname?.startsWith?.(item?.href);
              return (
                <Link
                  key={item?.href}
                  href={item?.href ?? '#'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sage-100 text-sage-800'
                      : 'text-sage-600 hover:bg-sage-50'
                  )}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {item?.label}
                </Link>
              );
            })}
            {/* Language Toggle Mobile */}
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sage-600 hover:bg-sage-50 w-full"
            >
              <Globe className="w-5 h-5" />
              {language === 'es' ? 'English' : 'Español'}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sage-600 hover:bg-sage-50 w-full"
            >
              <LogOut className="w-5 h-5" />
              {t('logout')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
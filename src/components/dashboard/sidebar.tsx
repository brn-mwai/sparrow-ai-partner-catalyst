'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useSidebar } from './sidebar-context';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'ph-squares-four' },
  { label: 'Coach Sparrow', href: '/dashboard/coach', icon: 'ph-bird' },
  { label: 'Practice', href: '/dashboard/practice', icon: 'ph-phone-call' },
  { label: 'Call History', href: '/dashboard/history', icon: 'ph-clock-counter-clockwise' },
  { label: 'Progress', href: '/dashboard/progress', icon: 'ph-chart-line-up' },
  { label: 'AI Prospects', href: '/dashboard/prospects', icon: 'ph-users-three' },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Settings', href: '/dashboard/settings', icon: 'ph-gear' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const sidebarClasses = [
    'sidebar',
    isCollapsed ? 'collapsed' : '',
    isMobileOpen ? 'mobile-open' : ''
  ].filter(Boolean).join(' ');

  return (
    <aside className={sidebarClasses}>
      {/* Header */}
      <div className="sidebar-header">
        <Link href="/dashboard" className="sidebar-logo" onClick={closeMobile}>
          {isCollapsed ? (
            <Image
              src="/Assets/sparrow-ai.png"
              alt="Sparrow AI"
              width={32}
              height={32}
              priority
            />
          ) : (
            <Image
              src="/Logo/sparrow-logo.svg"
              alt="Sparrow AI"
              width={120}
              height={32}
              priority
            />
          )}
        </Link>
        <button
          className="sidebar-collapse-btn desktop-only"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`ph ${isCollapsed ? 'ph-sidebar-simple' : 'ph-sidebar-simple'}`}></i>
        </button>
        <button
          className="sidebar-close-btn mobile-only"
          onClick={closeMobile}
          aria-label="Close menu"
        >
          <i className="ph ph-x"></i>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">
          {!isCollapsed && <span className="sidebar-nav-label">Main</span>}
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
              onClick={closeMobile}
            >
              <i className={`ph ${item.icon}`}></i>
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="sidebar-nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-nav-section">
          {!isCollapsed && <span className="sidebar-nav-label">Settings</span>}
          {secondaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
              onClick={closeMobile}
            >
              <i className={`ph ${item.icon}`}></i>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'sidebar-avatar'
              }
            }}
          />
          {!isCollapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Account</span>
              <span className="sidebar-user-role">Manage profile</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

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
  { label: 'Integrations', href: '/dashboard/integrations', icon: 'ph-plugs-connected' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'ph-gear' },
];

interface ServiceStatus {
  name: string;
  status: 'active' | 'monitoring' | 'inactive';
  icon: string;
}

const services: ServiceStatus[] = [
  { name: 'ElevenLabs', status: 'active', icon: 'ph-microphone' },
  { name: 'Gemini', status: 'active', icon: 'ph-brain' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <Link href="/dashboard" className="sidebar-logo">
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
          className="sidebar-collapse-btn"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`ph ${isCollapsed ? 'ph-sidebar-simple' : 'ph-sidebar-simple'}`}></i>
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
            >
              <i className={`ph ${item.icon}`}></i>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Services Status */}
      {!isCollapsed && (
        <div className="sidebar-services">
          <span className="sidebar-services-label">Services</span>
          <div className="sidebar-services-list">
            {services.map((service) => (
              <div key={service.name} className="sidebar-service-item">
                <div className="sidebar-service-info">
                  <i className={`ph ${service.icon}`}></i>
                  <span>{service.name}</span>
                </div>
                <div className={`sidebar-service-status ${service.status}`}>
                  <span className="sidebar-service-dot"></span>
                  <span className="sidebar-service-text">
                    {service.status === 'active' ? 'Active' :
                     service.status === 'monitoring' ? 'Monitoring' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

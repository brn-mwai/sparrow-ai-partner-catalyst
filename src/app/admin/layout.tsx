'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { isAdminEmail } from '@/lib/admin/config';
import './admin.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Overview', href: '/admin', icon: 'ph-chart-pie' },
  { label: 'Users', href: '/admin/users', icon: 'ph-users' },
  { label: 'Calls', href: '/admin/calls', icon: 'ph-phone' },
  { label: 'Revenue', href: '/admin/revenue', icon: 'ph-currency-dollar' },
  { label: 'System', href: '/admin/system', icon: 'ph-cpu' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const email = user?.primaryEmailAddress?.emailAddress;

    if (!user || !isAdminEmail(email)) {
      router.push('/dashboard');
      return;
    }

    setIsAuthorized(true);
  }, [user, isLoaded, router]);

  if (!isLoaded || !isAuthorized) {
    return (
      <div className="admin-loading">
        <i className="ph ph-spinner animate-spin"></i>
        <span>Verifying access...</span>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link href="/admin" className="admin-logo">
            <Image
              src="/Assets/sparrow-ai.png"
              alt="Sparrow AI"
              width={32}
              height={32}
            />
            <span>Admin</span>
          </Link>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="admin-nav-item"
            >
              <i className={`ph ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/dashboard" className="admin-back-link">
            <i className="ph ph-arrow-left"></i>
            <span>Back to App</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-title">
            <h1>Admin Dashboard</h1>
            <span className="admin-badge">Internal Only</span>
          </div>
          <div className="admin-header-user">
            <span>{user?.primaryEmailAddress?.emailAddress}</span>
            <div className="admin-avatar">
              {user?.firstName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}

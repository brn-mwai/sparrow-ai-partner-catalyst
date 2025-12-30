'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sidebar, SidebarProvider, useSidebar, CoachSparrow } from '@/components/dashboard';
import { BetaBanner } from '@/components/shared/beta-banner';

function MobileHeader() {
  const { toggleMobile } = useSidebar();

  return (
    <header className="mobile-header">
      <button
        className="mobile-menu-btn"
        onClick={toggleMobile}
        aria-label="Open menu"
      >
        <i className="ph ph-list"></i>
      </button>
      <Link href="/dashboard" className="mobile-logo">
        <Image
          src="/Logo/sparrow-logo.svg"
          alt="Sparrow AI"
          width={100}
          height={28}
          priority
        />
      </Link>
      <div className="mobile-header-spacer" />
    </header>
  );
}

function MobileOverlay() {
  const { isMobileOpen, closeMobile } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="mobile-overlay"
      onClick={closeMobile}
      aria-hidden="true"
    />
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main className={`dashboard-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {children}
    </main>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <BetaBanner variant="dashboard" />
      <div className="dashboard-layout">
        <MobileHeader />
        <MobileOverlay />
        <Sidebar />
        <DashboardContent>{children}</DashboardContent>
        <CoachSparrow />
      </div>
    </SidebarProvider>
  );
}

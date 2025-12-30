// ============================================
// SPARROW AI - Admin Configuration
// ============================================

// Admin emails that have access to /admin routes
// Add your email here to gain admin access
export const ADMIN_EMAILS = [
  'brianmwai2@gmail.com',
  'brian@hausorlabs.tech',
  // Add more admin emails as needed
];

// Check if an email is an admin
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

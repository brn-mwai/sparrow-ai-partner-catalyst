import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link href="/" className="auth-logo">
            <Image
              src="/Logo/sparrow-logo.svg"
              alt="Sparrow AI"
              width={150}
              height={40}
              priority
            />
          </Link>
          <p className="auth-subtitle">Welcome back! Sign in to continue practicing.</p>
        </div>

        <SignIn
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: '#AA90FE',
              colorText: '#1B113A',
              colorTextSecondary: '#7c7591',
              colorBackground: '#ffffff',
              colorInputBackground: '#ffffff',
              colorInputText: '#1B113A',
              borderRadius: '0.5rem',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            },
            elements: {
              rootBox: {
                width: '100%',
              },
              card: {
                backgroundColor: '#ffffff',
                border: '1px solid #e8e5ef',
                borderRadius: '1rem',
                boxShadow: 'none',
                padding: '1.5rem',
              },
              headerTitle: {
                display: 'none',
              },
              headerSubtitle: {
                display: 'none',
              },
              socialButtonsBlockButton: {
                backgroundColor: '#ffffff',
                border: '1px solid #e8e5ef',
                borderRadius: '0.5rem',
                color: '#443e54',
                fontWeight: '500',
              },
              dividerLine: {
                backgroundColor: '#e8e5ef',
              },
              dividerText: {
                color: '#a8a2b8',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
              },
              formFieldLabel: {
                color: '#443e54',
                fontSize: '0.875rem',
                fontWeight: '500',
              },
              formFieldInput: {
                backgroundColor: '#ffffff',
                border: '1px solid #d4d0df',
                borderRadius: '0.5rem',
                color: '#1B113A',
                fontSize: '0.9375rem',
              },
              formButtonPrimary: {
                background: '#AA90FE',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.9375rem',
                boxShadow: 'none',
                border: 'none',
              },
              footerActionLink: {
                color: '#9373f5',
                fontWeight: '500',
              },
              footerActionText: {
                color: '#7c7591',
              },
              identityPreviewEditButton: {
                color: '#9373f5',
              },
              formFieldAction: {
                color: '#9373f5',
              },
            },
            layout: {
              socialButtonsPlacement: 'top',
              showOptionalFields: false,
            },
          }}
        />

        <div className="auth-footer">
          <Link href="/" className="auth-back-link">
            <i className="ph ph-arrow-left"></i>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../legal.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.legalPage}>
      <header className={styles.legalHeader}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/Logo/sparrow-logo.svg"
            alt="Sparrow AI"
            width={120}
            height={40}
            priority
          />
        </Link>
      </header>

      <main className={styles.legalContent}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: December 24, 2024</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Sparrow AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy
            and ensuring the security of your personal information. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our AI-powered sales training platform
            (the &quot;Service&quot;).
          </p>
          <p>
            By using our Service, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>

          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and authentication credentials through our authentication provider (Clerk).</li>
            <li><strong>Profile Information:</strong> Your role (SDR, AE, Manager, Founder), industry, and sales experience level.</li>
            <li><strong>Voice Data:</strong> Audio recordings of your practice calls with AI prospects, processed through ElevenLabs for real-time conversation.</li>
            <li><strong>Call Transcripts:</strong> Text transcriptions of your practice sessions for scoring and feedback.</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> Practice call history, scores, duration, and improvement metrics.</li>
            <li><strong>Performance Data:</strong> Opening, discovery, objection handling, call control, and closing scores.</li>
            <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers.</li>
            <li><strong>Log Data:</strong> IP address, access times, and pages viewed.</li>
          </ul>

          <h3>2.3 Information from Third Parties</h3>
          <ul>
            <li><strong>Authentication Provider:</strong> We receive basic profile information from Clerk when you sign in.</li>
            <li><strong>Voice AI Provider:</strong> ElevenLabs processes your voice for real-time AI conversations.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for:</p>
          <ul>
            <li>Providing real-time voice conversations with AI sales prospects</li>
            <li>Generating AI-powered personas tailored to your practice needs</li>
            <li>Scoring your calls and providing detailed feedback</li>
            <li>Tracking your progress and identifying areas for improvement</li>
            <li>Personalizing difficulty levels and prospect personalities</li>
            <li>Processing transactions and managing subscriptions</li>
            <li>Communicating with you about updates and support</li>
            <li>Improving our AI models and Service quality</li>
          </ul>
        </section>

        <section>
          <h2>4. Voice Data and Recordings</h2>
          <p>
            Your voice data is central to our Service. Here&apos;s how we handle it:
          </p>
          <ul>
            <li><strong>Real-time Processing:</strong> Voice is streamed to ElevenLabs for AI conversation and immediately processed.</li>
            <li><strong>Transcripts:</strong> Call transcripts are stored to provide scoring and coaching feedback.</li>
            <li><strong>No Permanent Audio Storage:</strong> We do not permanently store raw audio recordings after processing.</li>
            <li><strong>Deletion:</strong> You can request deletion of your transcripts at any time.</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li><strong>ElevenLabs:</strong> For voice AI processing and real-time conversations.</li>
            <li><strong>Google (Gemini):</strong> For AI persona generation and call analysis.</li>
            <li><strong>Groq:</strong> For fast call scoring and feedback generation.</li>
            <li><strong>Clerk:</strong> For authentication and account management.</li>
            <li><strong>Supabase:</strong> For secure database storage.</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information:
          </p>
          <ul>
            <li>Encryption of data in transit (HTTPS/TLS) and at rest</li>
            <li>Secure authentication through Clerk</li>
            <li>Access controls and authentication for our systems</li>
            <li>Regular security assessments</li>
            <li>Secure WebSocket connections for voice streaming</li>
          </ul>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed to provide the Service.
            Call transcripts and scores are stored until you delete them or close your account. You can request deletion
            of your data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your personal information and call history</li>
            <li>Export your data in a portable format</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p>To exercise these rights, please contact us at the email below.</p>
        </section>

        <section>
          <h2>9. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to maintain your session, remember your preferences,
            and analyze usage. For more information, please see our <Link href="/cookies">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2>10. Children&apos;s Privacy</h2>
          <p>
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect
            personal information from children. If you believe we have collected information from a minor,
            please contact us immediately.
          </p>
        </section>

        <section>
          <h2>11. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own,
            including the United States where our service providers are located. We ensure appropriate
            safeguards are in place to protect your information.
          </p>
        </section>

        <section>
          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by
            posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@sparrow-ai.com</li>
            <li>Website: <Link href="/">sparrow-ai.com</Link></li>
          </ul>
        </section>
      </main>

      <footer className={styles.legalFooter}>
        <div className={styles.footerLinks}>
          <Link href="/">Home</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
          <Link href="/support">Support</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Sparrow AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../legal.module.css';

export default function CookiePolicyPage() {
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
        <h1>Cookie Policy</h1>
        <p className={styles.lastUpdated}>Last updated: December 24, 2024</p>

        <section>
          <h2>1. What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you
            visit a website. They are widely used to make websites work more efficiently and provide
            information to website owners.
          </p>
          <p>
            This Cookie Policy explains how Sparrow AI (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and similar
            technologies on our AI-powered sales training platform.
          </p>
        </section>

        <section>
          <h2>2. How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>

          <h3>2.1 Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function and cannot be switched off.
            They are usually set in response to your actions, such as logging in or managing your practice sessions.
          </p>
          <table className={styles.cookieTable}>
            <thead>
              <tr>
                <th>Cookie Name</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>__clerk_db_jwt</td>
                <td>Authentication session management</td>
                <td>Session</td>
              </tr>
              <tr>
                <td>__client_uat</td>
                <td>User authentication token</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>__session</td>
                <td>Session identifier</td>
                <td>Session</td>
              </tr>
            </tbody>
          </table>

          <h3>2.2 Functional Cookies</h3>
          <p>
            These cookies enable enhanced functionality and personalization, such as remembering
            your call preferences and settings.
          </p>
          <table className={styles.cookieTable}>
            <thead>
              <tr>
                <th>Cookie Name</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>sparrow_preferences</td>
                <td>User preferences (difficulty, call type)</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>sparrow_theme</td>
                <td>Theme preference (light/dark)</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>sparrow_audio_settings</td>
                <td>Microphone and audio preferences</td>
                <td>1 year</td>
              </tr>
            </tbody>
          </table>

          <h3>2.3 Analytics Cookies</h3>
          <p>
            These cookies help us understand how visitors interact with our platform by collecting
            and reporting information anonymously.
          </p>
          <table className={styles.cookieTable}>
            <thead>
              <tr>
                <th>Cookie Name</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>_vercel_insights</td>
                <td>Anonymous usage analytics</td>
                <td>Session</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>3. Local Storage</h2>
          <p>
            In addition to cookies, we use browser local storage to enhance your experience:
          </p>
          <ul>
            <li><strong>Call Settings:</strong> Your preferred call duration and difficulty settings</li>
            <li><strong>Audio Device Preferences:</strong> Selected microphone and speaker devices</li>
            <li><strong>UI Preferences:</strong> Dashboard layout and display preferences</li>
          </ul>
          <p>
            This data is stored locally in your browser and is not transmitted to third parties.
            You can clear this data through your browser settings.
          </p>
        </section>

        <section>
          <h2>4. Third-Party Cookies</h2>
          <p>
            We use services from third parties that may set their own cookies:
          </p>
          <ul>
            <li>
              <strong>Clerk (Authentication):</strong> Manages user authentication and sessions.
              <br />
              <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer">Clerk Privacy Policy</a>
            </li>
            <li>
              <strong>Vercel (Hosting):</strong> Hosts our website and may collect analytics.
              <br />
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a>
            </li>
            <li>
              <strong>Supabase (Database):</strong> Stores user data and call history.
              <br />
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a>
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their settings. You can:
          </p>
          <ul>
            <li>View cookies stored on your computer</li>
            <li>Delete some or all cookies</li>
            <li>Block cookies from being set</li>
            <li>Set preferences for certain websites</li>
          </ul>
          <p>
            Please note that blocking essential cookies may prevent you from using certain features
            of our Service, such as logging in or participating in practice calls.
          </p>

          <h3>Browser-Specific Instructions</h3>
          <ul>
            <li>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                Google Chrome
              </a>
            </li>
            <li>
              <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">
                Safari
              </a>
            </li>
            <li>
              <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
                Microsoft Edge
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Do Not Track</h2>
          <p>
            Some browsers have a &quot;Do Not Track&quot; feature that signals to websites that you do not
            want your online activity tracked. Our website currently does not respond to Do Not Track
            signals, but you can manage cookies as described above.
          </p>
        </section>

        <section>
          <h2>7. Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices
            or for other operational, legal, or regulatory reasons. We will post any changes on
            this page and update the &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@sprrw.app</li>
            <li>Website: <Link href="/">sprrw.app</Link></li>
          </ul>
        </section>
      </main>

      <footer className={styles.legalFooter}>
        <div className={styles.footerLinks}>
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/support">Support</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Sparrow AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

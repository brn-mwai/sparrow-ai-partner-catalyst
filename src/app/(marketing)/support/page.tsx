'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../legal.module.css';

export default function SupportPage() {
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
        <h1>Support Center</h1>
        <p className={styles.subtitle}>
          We&apos;re here to help you get the most out of Sparrow AI.
        </p>

        <section className={styles.supportSection}>
          <h2>Frequently Asked Questions</h2>

          <div className={styles.faqItem}>
            <h3>How do I start a practice call?</h3>
            <p>
              Starting a practice call is simple:
            </p>
            <ol>
              <li>Go to your dashboard and click &quot;Start Practicing&quot;</li>
              <li>Choose your practice mode: Cold Call, Discovery, or Objection Gauntlet</li>
              <li>Configure your AI prospect (industry, role, personality, difficulty)</li>
              <li>Review the prospect briefing with tips and goals</li>
              <li>Click &quot;Start Call&quot; and begin speaking</li>
            </ol>
          </div>

          <div className={styles.faqItem}>
            <h3>What practice modes are available?</h3>
            <p>
              Sparrow AI offers three practice modes:
            </p>
            <ul>
              <li><strong>Cold Call Simulator:</strong> Practice opening calls, earning attention, and booking meetings</li>
              <li><strong>Discovery Call Simulator:</strong> Practice asking questions, uncovering pain, and qualification</li>
              <li><strong>Objection Gauntlet:</strong> Handle common objections like &quot;not interested&quot; or &quot;too expensive&quot;</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h3>How does the scoring work?</h3>
            <p>
              After each call, our AI analyzes your performance across five categories:
            </p>
            <ul>
              <li><strong>Opening:</strong> How well you captured attention and established credibility</li>
              <li><strong>Discovery:</strong> Quality of questions asked and pain points uncovered</li>
              <li><strong>Objection Handling:</strong> How you addressed pushback and concerns</li>
              <li><strong>Call Control:</strong> Your ability to guide the conversation</li>
              <li><strong>Closing:</strong> How effectively you moved toward next steps</li>
            </ul>
            <p>
              You&apos;ll also receive specific feedback on key moments with suggestions for improvement.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>How many practice calls can I make?</h3>
            <p>
              Call limits depend on your plan:
            </p>
            <ul>
              <li><strong>Free:</strong> 5 calls per month</li>
              <li><strong>Starter:</strong> 30 calls per month</li>
              <li><strong>Pro:</strong> Unlimited calls</li>
            </ul>
            <p>
              Limits reset on the first day of each month.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>What microphone should I use?</h3>
            <p>
              For the best experience, we recommend:
            </p>
            <ul>
              <li>A quality headset with built-in microphone</li>
              <li>A quiet environment to minimize background noise</li>
              <li>Testing your audio before starting a call</li>
            </ul>
            <p>
              You can test and configure your microphone in Dashboard &gt; Settings &gt; Audio.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>Can I customize the AI prospects?</h3>
            <p>
              Yes! You can customize several aspects of your AI prospect:
            </p>
            <ul>
              <li><strong>Industry:</strong> SaaS, Healthcare, Finance, Manufacturing, and more</li>
              <li><strong>Role:</strong> VP, Director, Manager, C-Suite</li>
              <li><strong>Personality:</strong> Skeptical, Busy, Friendly, Technical</li>
              <li><strong>Difficulty:</strong> Easy, Medium, Hard, Brutal</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h3>How do I cancel my subscription?</h3>
            <p>
              Go to Dashboard &gt; Settings &gt; Billing and click &quot;Manage Subscription.&quot; You can cancel
              anytime, and your access will continue until the end of your billing period.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>Is my voice data secure?</h3>
            <p>
              Yes. Your voice is processed in real-time for conversation but not permanently stored.
              Transcripts are encrypted and stored securely. You can delete your call history at any time.
              Read our <Link href="/privacy">Privacy Policy</Link> for full details.
            </p>
          </div>
        </section>

        <section className={styles.supportSection}>
          <h2>Troubleshooting</h2>

          <div className={styles.faqItem}>
            <h3>The AI isn&apos;t responding to my voice</h3>
            <ol>
              <li>Check that your microphone is properly connected and selected</li>
              <li>Ensure your browser has permission to access the microphone</li>
              <li>Speak clearly and at a moderate pace</li>
              <li>Check your internet connection speed</li>
              <li>Try refreshing the page and starting a new call</li>
            </ol>
          </div>

          <div className={styles.faqItem}>
            <h3>I&apos;m experiencing audio delay or lag</h3>
            <ul>
              <li>Check your internet connection (we recommend at least 5 Mbps)</li>
              <li>Close other tabs or applications using bandwidth</li>
              <li>Try using a wired connection instead of WiFi</li>
              <li>Clear your browser cache and restart</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h3>My call ended unexpectedly</h3>
            <ul>
              <li>Check your internet connection stability</li>
              <li>Verify you haven&apos;t exceeded your monthly call limit</li>
              <li>Try starting a new call</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h3>I can&apos;t sign in</h3>
            <ul>
              <li>Clear your browser cookies and try again</li>
              <li>Try a different browser</li>
              <li>Check if your email address is correct</li>
              <li>Use the &quot;Forgot Password&quot; option if needed</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h3>My scores aren&apos;t showing</h3>
            <ul>
              <li>Wait a few moments after ending the call for analysis to complete</li>
              <li>Refresh the debrief page</li>
              <li>Check your call history for the completed call</li>
              <li>Ensure the call wasn&apos;t ended too early (minimum 30 seconds)</li>
            </ul>
          </div>
        </section>

        <section className={styles.contactSection}>
          <h2>Contact Support</h2>
          <p>
            Can&apos;t find what you&apos;re looking for? We&apos;re happy to help.
          </p>

          <div className={styles.contactMethods}>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"/>
                </svg>
              </div>
              <h3>Email Support</h3>
              <p>Get help via email</p>
              <a href="mailto:support@sprrw.app" className={styles.contactLink}>
                support@sprrw.app
              </a>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z"/>
                </svg>
              </div>
              <h3>Response Time</h3>
              <p>We typically respond within</p>
              <span className={styles.responseTime}>24 hours</span>
            </div>
          </div>
        </section>

        <section className={styles.supportSection}>
          <h2>Useful Links</h2>
          <div className={styles.usefulLinks}>
            <Link href="/privacy" className={styles.usefulLink}>
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,160H48V56H208V200ZM136,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm-4-36a12,12,0,1,1-12-12A12,12,0,0,1,132,76Z"/>
              </svg>
              Privacy Policy
            </Link>
            <Link href="/terms" className={styles.usefulLink}>
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/>
              </svg>
              Terms of Service
            </Link>
            <Link href="/cookies" className={styles.usefulLink}>
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                <path d="M164.49,163.51a12,12,0,1,1-17,0A12,12,0,0,1,164.49,163.51Zm-81-8a12,12,0,1,0,17,0A12,12,0,0,0,83.51,155.51Zm9-39a12,12,0,1,0-17,0A12,12,0,0,0,92.49,116.49Zm48-1a12,12,0,1,0,0,17A12,12,0,0,0,140.49,115.51ZM128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/>
              </svg>
              Cookie Policy
            </Link>
            <Link href="/dashboard" className={styles.usefulLink}>
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM48,48H208V208H48ZM152,112a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,112Zm0,32a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,144Zm0,32a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,176ZM88,108a12,12,0,1,1-12-12A12,12,0,0,1,88,108Zm0,36a12,12,0,1,1-12-12A12,12,0,0,1,88,144Zm0,36a12,12,0,1,1-12-12A12,12,0,0,1,88,180Z"/>
              </svg>
              Go to Dashboard
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.legalFooter}>
        <div className={styles.footerLinks}>
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Sparrow AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

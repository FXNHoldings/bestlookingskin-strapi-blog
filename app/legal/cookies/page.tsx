import type { Metadata } from 'next';
import Link from 'next/link';
import LegalArticle from '@/components/LegalArticle';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: `Cookie Policy for ${SITE.name}, including GDPR/ePrivacy and CCPA disclosures.`,
  alternates: { canonical: '/legal/cookies' },
};

const MODIFIED = '2026-05-02';

export default function Page() {
  return (
    <LegalArticle pageKey="cookies" title="Cookie Policy" modified={MODIFIED}>
      <p>
        This Website (referred to in these &quot;terms of use&quot; as the website) is owned and
        operated by FXN Holdings, who is referred to in this Cookie Policy as &quot;we&quot;,
        &quot;us&quot;, &quot;our&quot; and similar grammatical forms.
      </p>
      <p>
        Our Cookie Policy explains what cookies are, how we use cookies, how third-party partners may
        use cookies on our Websites and your choices regarding cookies. It is intended to satisfy
        notice requirements under the Australian Privacy Act, the EU/UK ePrivacy Directive (Cookie
        Law) and GDPR, and the California Consumer Privacy Act (CCPA) as amended by the CPRA.
      </p>

      {/* 1. Why */}
      <h3>1. Why do we use &quot;cookies&quot; and other web-use tracking technologies?</h3>
      <ol className="list-[lower-alpha] pl-6 space-y-3">
        <li>
          When you access our Website, small files containing a unique identification (ID) number
          may be downloaded by your web browser and stored in the cache of your computer. The purpose
          of sending these files with a unique ID number is so that our Website can recognise your
          computer when you next visit. The &quot;cookies&quot; that are shared with your computer
          can&apos;t be used to discover any personal information such as your name, address or email
          address — they merely identify your computer to our Websites when you visit us.
        </li>
        <li>
          We can also log the internet protocol (IP) address of visitors so that we can work out the
          countries in which the computers are located.
        </li>
        <li>
          We collect information using &quot;cookies&quot; and other tracking technologies for the
          following reasons:
          <ol className="mt-2 list-[lower-roman] pl-6 space-y-1">
            <li>to help us monitor the performance of our Website so that we can improve the operation of the Website and the services we offer;</li>
            <li>to provide personalised services to each user of our Website to make their navigation easier and more rewarding;</li>
            <li>to sell advertising on the Website in order to meet some of the costs of operating the Website and improve the content; and</li>
            <li>when we have permission from the user, to market the services we provide by sending emails personalised to the interests of the user.</li>
          </ol>
        </li>
        <li>
          Even if you have given us permission to send you emails, you can, at any time, decide not
          to receive further emails and will be able to &quot;unsubscribe&quot; from that service.
        </li>
        <li>
          In addition to our own cookies, we may also use various third-party cookies to report usage
          statistics of the Website, deliver advertisements and so on. See section 4 for the
          providers we currently work with.
        </li>
      </ol>

      {/* 2. What is a cookie */}
      <h3>2. What is a cookie (and what other technologies do we use)?</h3>
      <p>
        A cookie is a small text file a website asks your browser to save when you visit. We also use
        related technologies including pixel tags / web beacons, local storage, session storage and
        software development kits (SDKs) embedded in the Website. Throughout this policy
        &quot;cookies&quot; refers to all of these technologies.
      </p>

      {/* 3. Types of cookies */}
      <h3>3. Types of cookies we use</h3>
      <p>
        For visitors in the EEA, UK and other jurisdictions that require prior consent for
        non-essential cookies, only Strictly Necessary cookies are set before you make a choice.
        Other categories load only after you grant consent through our cookie banner.
      </p>
      <ol className="list-[lower-alpha] pl-6 space-y-3">
        <li>
          <strong>Strictly necessary.</strong> Required for the Website to function — session
          handling, security, load balancing and remembering your cookie-consent choice itself.
          These cannot be turned off.
        </li>
        <li>
          <strong>Functional / preferences.</strong> Remember choices such as theme, region, language
          or recently viewed posts. These improve experience but are not essential.
        </li>
        <li>
          <strong>Performance / analytics.</strong> Help us understand which articles get read, where
          visitors come from, and what we can improve. The data is aggregated and pseudonymised.
        </li>
        <li>
          <strong>Advertising / targeting.</strong> Used to show relevant advertising on and outside
          the Website and to measure ad performance. These set unique identifiers that may be
          considered &quot;sharing&quot; under California law.
        </li>
        <li>
          <strong>Affiliate tracking.</strong> Some merchants (e.g. Amazon) set their own cookies to
          attribute a purchase you make after clicking an affiliate link from {SITE.name}. These are
          set by the merchant, not by us, and are governed by the merchant&apos;s privacy policy.
        </li>
      </ol>

      {/* 4. Third-party providers */}
      <h3>4. Third-party providers and partners</h3>
      <p>
        We may use cookies set by the following categories of third parties (full list available on
        request):
      </p>
      <ol className="list-[lower-alpha] pl-6 space-y-1">
        <li>Hosting and content delivery (CDN) providers.</li>
        <li>Analytics providers (e.g. Google Analytics, Plausible, Cloudflare Web Analytics).</li>
        <li>Affiliate-program platforms (e.g. Amazon Associates).</li>
        <li>Embedded content providers (e.g. YouTube, Twitter / X, Facebook social plugins).</li>
        <li>Customer-support and email-delivery tools.</li>
      </ol>
      <p>
        Each provider has its own privacy and cookie policy. Where required, we have data-processing
        agreements in place with these providers and rely on Standard Contractual Clauses for
        international transfers.
      </p>

      {/* 5. Managing your consent */}
      <h3>5. How to manage your consent</h3>
      <ol className="list-[lower-alpha] pl-6 space-y-2">
        <li>
          <strong>Cookie banner.</strong> If you are visiting from the EEA, UK, Switzerland, or a
          jurisdiction with similar requirements, our cookie banner asks for your consent before any
          non-essential cookie is set. You can accept all, reject non-essential, or open Settings to
          choose category by category. You can change your choice at any time from the &quot;Cookie
          settings&quot; link in our footer.
        </li>
        <li>
          <strong>Browser controls.</strong> Most browsers let you block, accept, or delete cookies
          via settings or preferences. Disabling some cookies may make parts of the site behave less
          well, but core reading functionality will continue to work.
        </li>
        <li>
          <strong>Global Privacy Control (GPC).</strong> If your browser sends a GPC signal, we treat
          it as a valid opt-out of &quot;sale or sharing&quot; for CCPA / state-law purposes.
        </li>
        <li>
          <strong>Do Not Track (DNT).</strong> We honor DNT browser signals where applicable.
        </li>
        <li>
          <strong>Email marketing.</strong> Every marketing email we send contains a one-click
          unsubscribe link.
        </li>
      </ol>

      {/* 6. Per-browser instructions */}
      <h3>6. Browser-specific opt-out</h3>
      <ol className="list-[lower-alpha] pl-6 space-y-1">
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
            Google Chrome
          </a>
        </li>
        <li>
          <a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer">
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">
            Apple Safari
          </a>
        </li>
        <li>
          <a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge" target="_blank" rel="noopener noreferrer">
            Microsoft Edge
          </a>
        </li>
        <li>
          Industry opt-outs: <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer">DAA WebChoices</a>,{' '}
          <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer">EDAA YourOnlineChoices (EU)</a>.
        </li>
      </ol>

      {/* 7. Choices regarding cookies */}
      <h3>7. What are your choices regarding cookies?</h3>
      <p>
        If you are unhappy about having a cookie sent to you, you can set your browser to refuse
        cookies or choose to have your computer warn you each time a cookie is being sent. However,
        if you turn your cookies off, some of our services may not function properly.
      </p>

      {/* 8. Changes */}
      <h3>8. Changes to this Cookie Policy</h3>
      <p>
        We may update this policy as our practices change. The &quot;Last updated&quot; date at the
        top reflects the most recent revision. Material changes will be flagged via our cookie
        banner.
      </p>

      {/* 9. Contact */}
      <h3>9. Contact</h3>
      <p>
        Questions about cookies or your privacy choices? Reach us via{' '}
        <Link href="/contact">our contact page</Link> or email{' '}
        <a href="mailto:privacy@bestlooking.skin">privacy@bestlooking.skin</a>.
      </p>

      <p className="mt-10 text-sm text-ink/55">
        This Cookie Policy is provided as a general template covering ePrivacy/GDPR (EU/UK) and CCPA
        (US) requirements. It does not constitute legal advice and assumes a working cookie-consent
        banner is deployed on the Website. For a fully audited document tailored to your specific
        operations, consult a qualified privacy lawyer.
      </p>
    </LegalArticle>
  );
}

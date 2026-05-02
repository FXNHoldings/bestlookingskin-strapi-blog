import type { Metadata } from 'next';
import Link from 'next/link';
import LegalArticle from '@/components/LegalArticle';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Website Privacy Policy for ${SITE.name}, including GDPR and CCPA disclosures.`,
  alternates: { canonical: '/legal/privacy' },
};

const MODIFIED = '2026-05-02';

export default function Page() {
  return (
    <LegalArticle pageKey="privacy" title="Website Privacy Policy" modified={MODIFIED}>
      <p>
        This Privacy Policy applies to all personal information collected by FXN Holdings
        (<strong>we</strong>, <strong>us</strong> or <strong>our</strong>) via the website located at{' '}
        <a href="https://www.bestlooking.skin">www.bestlooking.skin</a> (<strong>Website</strong>).
      </p>
      <p>
        We process personal data in accordance with the Australian Privacy Act 1988 (Cth) and the
        Australian Privacy Principles. Where you are located in the European Economic Area (EEA),
        the United Kingdom, Switzerland, or the United States (including California and other states
        with comprehensive privacy laws), additional rights apply — see sections 8–11 below.
      </p>

      {/* 1. What information do we collect? */}
      <h3>1. What information do we collect?</h3>
      <p>
        The kind of Personal Information that we collect from you will depend on how you use the
        Website. The Personal Information which we collect and hold about you may include:
      </p>
      <ol className="list-[lower-alpha] pl-6 space-y-2">
        <li>
          <strong>Identifiers and contact data</strong> — full name, email address, phone number,
          billing and shipping addresses.
        </li>
        <li>
          <strong>Commercial information</strong> — purchase history, order details, customer
          preferences and interests, and (for our e-commerce operations including NXT Smart Home and
          NXT Outlet) payment information processed securely through third-party payment processors.
        </li>
        <li>
          <strong>Internet/network activity</strong> — IP address, browser type, device information,
          referring URLs, pages visited and time spent.
        </li>
        <li>
          <strong>Customer-service interactions</strong> — communication history with our team and
          information submitted through contact forms or account registration.
        </li>
        <li>
          <strong>Inferences</strong> — preferences and interests we infer from the above to
          personalise the experience.
        </li>
      </ol>

      {/* 2. Types of information */}
      <h3>2. Types of information</h3>
      <p>
        The Privacy Act 1988 (Cth) (<strong>Privacy Act</strong>) defines types of information,
        including Personal Information and Sensitive Information.
      </p>
      <p>
        <strong>Personal Information</strong> means information or an opinion about an identified
        individual or an individual who is reasonably identifiable:
      </p>
      <ol className="list-[lower-alpha] pl-6 space-y-1">
        <li>whether the information or opinion is true or not; and</li>
        <li>whether the information or opinion is recorded in a material form or not.</li>
      </ol>
      <p>
        If the information does not disclose your identity or enable your identity to be ascertained,
        it will in most cases not be classified as &quot;Personal Information&quot; and will not be
        subject to this privacy policy.
      </p>
      <p>
        <strong>Sensitive Information</strong> is defined in the Privacy Act as including information
        or opinion about such things as an individual&apos;s racial or ethnic origin, political
        opinions, membership of a political association, religious or philosophical beliefs,
        membership of a trade union or other professional body, criminal record or health
        information. Under the GDPR this is referred to as <em>special category data</em>.
      </p>
      <p>Sensitive / special category information will be used by us only:</p>
      <ol className="list-[lower-alpha] pl-6 space-y-1">
        <li>for the primary purpose for which it was obtained;</li>
        <li>for a secondary purpose that is directly related to the primary purpose; and</li>
        <li>with your explicit consent or where required or authorised by law.</li>
      </ol>

      {/* 3. How we collect your Personal Information */}
      <h3>3. How we collect your Personal Information</h3>
      <ol className="list-[lower-alpha] pl-6 space-y-2">
        <li>
          We may collect Personal Information from you whenever you input such information into the
          Website, related app or provide it to us in any other way.
        </li>
        <li>
          We may also use cookies and similar technologies which enable us to tell when you use the
          Website and to help customise your experience. See our{' '}
          <Link href="/legal/cookies">Cookie Policy</Link> for details and how to manage your
          choices.
        </li>
        <li>
          We generally don&apos;t collect Sensitive Information, but when we do, we will comply with
          the preceding paragraph.
        </li>
        <li>
          Where reasonable and practicable we collect your Personal Information from you only.
          However, sometimes we may be given information from a third party (such as our advertising
          or analytics partners); in those cases we will take steps to make you aware of the
          information that was provided.
        </li>
      </ol>

      {/* 4. Purpose of collection (lawful bases) */}
      <h3>4. Purpose and lawful basis of collection</h3>
      <ol className="list-[lower-alpha] pl-6 space-y-2">
        <li>
          We collect Personal Information to provide you with the best service experience possible
          on the Website, fulfill orders for our e-commerce operations, respond to enquiries and
          keep in touch with you about developments in our business.
        </li>
        <li>
          For visitors in the EEA / UK, the lawful bases on which we rely are (Article 6 GDPR / UK
          GDPR):
          <ol className="mt-2 list-[lower-roman] pl-6 space-y-1">
            <li><strong>Consent</strong> — for non-essential cookies, marketing emails, and any optional analytics.</li>
            <li><strong>Contract</strong> — to fulfill orders and provide services you have requested.</li>
            <li><strong>Legitimate interests</strong> — for site security, fraud prevention, basic analytics, and direct marketing of our own similar products to existing customers (subject to your right to object at any time).</li>
            <li><strong>Legal obligation</strong> — to comply with tax, accounting and other applicable laws.</li>
          </ol>
        </li>
        <li>
          We customarily disclose Personal Information only to our service providers who assist us in
          operating the Website (hosting, email delivery, analytics, payment processors, customer
          support tools). Each service provider is bound by contract to handle your data only for
          documented purposes and to maintain appropriate security.
        </li>
        <li>
          We will only use your Personal Information for direct marketing if we have collected it
          directly from you, and only if it is material of a type which you would reasonably expect
          to receive. We do not use sensitive Personal Information in direct marketing. Every
          marketing email contains a one-click unsubscribe link.
        </li>
      </ol>

      {/* 5. Security, Access and correction */}
      <h3>5. Security, retention and your rights</h3>
      <ol className="list-[lower-alpha] pl-6 space-y-2">
        <li>
          We store your Personal Information using industry-standard technical and organisational
          measures (encryption in transit, access controls, regular reviews) to reasonably protect it
          from unauthorised access, misuse, modification or disclosure.
        </li>
        <li>
          <strong>Retention.</strong> When we no longer require your Personal Information for the
          purpose for which we obtained it, we will take reasonable steps to destroy and anonymise or
          de-identify it. Most Personal Information stored in our client files and records will be
          kept for a maximum of 7 years to fulfill our record-keeping obligations. Email
          correspondence is retained as long as it remains useful for support or legal record-keeping.
        </li>
        <li>
          The Australian Privacy Principles permit you to:
          <ol className="mt-2 list-[lower-roman] pl-6 space-y-1">
            <li>obtain access to the Personal Information we hold about you in certain circumstances (Australian Privacy Principle 12); and</li>
            <li>correct inaccurate Personal Information subject to certain exceptions (Australian Privacy Principle 13).</li>
          </ol>
        </li>
        <li>
          Where you would like to obtain such access, please contact us in writing on the contact
          details set out at the bottom of this privacy policy. We respond within 30 days for AU
          requests, 30 days for GDPR/UK GDPR requests (extendable by 60 days where complex), and 45
          days for CCPA/CPRA requests.
        </li>
      </ol>

      {/* 6. Complaint procedure */}
      <h3>6. Complaint procedure</h3>
      <p>
        If you have a complaint concerning the manner in which we maintain the privacy of your
        Personal Information, please contact us at{' '}
        <a href="mailto:privacy@bestlooking.skin">privacy@bestlooking.skin</a>. All complaints will be
        considered by Kritin Curtis and we may seek further information from you to clarify your
        concerns. If we agree that your complaint is well founded, we will, in consultation with you,
        take appropriate steps to rectify the problem.
      </p>
      <p>
        If you remain dissatisfied with the outcome you may refer the matter to the Office of the
        Australian Information Commissioner (<a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">oaic.gov.au</a>),
        or, if you are based in the EEA / UK, to your local data-protection supervisory authority.
      </p>

      {/* 7. Overseas transfer */}
      <h3>7. International data transfers</h3>
      <p>
        Your Personal Information may be transferred overseas or stored overseas for a variety of
        reasons (cloud hosting, email delivery, customer-support platforms). We use providers
        primarily located in Australia, the European Union, the United Kingdom and the United States.
      </p>
      <p>
        Where Personal Information is transferred from the EEA or UK to a country that has not been
        the subject of a European Commission adequacy decision, we rely on Standard Contractual
        Clauses (the EU SCCs as updated 4 June 2021, and the UK International Data Transfer
        Addendum) and additional supplementary measures where appropriate, in accordance with
        Articles 45–49 GDPR.
      </p>
      <p>
        For Australian residents, where Personal Information is sent to a country with data
        protection laws substantially similar to the Australian Privacy Principles, we will not be
        liable for a breach of those Principles if your Personal Information is mishandled in that
        jurisdiction. Where it is transferred to a jurisdiction with less comprehensive laws, we will
        take reasonable steps to secure a contractual commitment from the recipient to handle your
        information in accordance with the Australian Privacy Principles.
      </p>

      {/* 8. EEA / UK / Swiss visitors — GDPR */}
      <h3>8. Your rights under the GDPR (EEA / UK / Switzerland)</h3>
      <p>
        If you are located in the EEA, United Kingdom or Switzerland, the GDPR / UK GDPR / Swiss FADP
        give you specific rights in relation to your Personal Information:
      </p>
      <ol className="list-[lower-alpha] pl-6 space-y-2">
        <li><strong>Right of access</strong> — to obtain confirmation of and a copy of the Personal Information we hold about you (Art. 15).</li>
        <li><strong>Right to rectification</strong> — to have inaccurate or incomplete data corrected (Art. 16).</li>
        <li><strong>Right to erasure</strong> (&quot;right to be forgotten&quot;) — in defined circumstances (Art. 17).</li>
        <li><strong>Right to restriction of processing</strong> — to limit how we use your data in defined circumstances (Art. 18).</li>
        <li><strong>Right to data portability</strong> — to receive your data in a structured, machine-readable format and have it transmitted to another controller (Art. 20).</li>
        <li><strong>Right to object</strong> — to processing based on legitimate interests and to direct marketing at any time (Art. 21).</li>
        <li><strong>Rights related to automated decision-making</strong> — we do not engage in solely automated decision-making with legal or similarly significant effects (Art. 22).</li>
        <li><strong>Right to withdraw consent</strong> — at any time, where processing is based on consent.</li>
        <li><strong>Right to lodge a complaint</strong> — with your local supervisory authority (e.g. the UK ICO at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>, the Irish DPC at <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer">dataprotection.ie</a>, or the authority for your country listed at <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer">edpb.europa.eu</a>).</li>
      </ol>
      <p>
        To exercise any of these rights, email{' '}
        <a href="mailto:privacy@bestlooking.skin">privacy@bestlooking.skin</a>. We may need to verify your
        identity before responding. Exercising these rights is free of charge. We will respond within
        one month, extendable by two further months for complex requests.
      </p>

      {/* 9. California — CCPA/CPRA */}
      <h3>9. Notice for California residents (CCPA / CPRA)</h3>
      <p>
        If you are a California resident, the California Consumer Privacy Act of 2018 (as amended by
        the California Privacy Rights Act of 2020) (<strong>CCPA</strong>) gives you specific rights.
      </p>
      <p>
        <strong>Categories of Personal Information collected in the past 12 months:</strong>{' '}
        identifiers (name, email, IP); commercial information (purchase history); internet/network
        activity (browsing, referral, device info); geolocation (approximate, from IP);
        customer-service correspondence; and inferences drawn from the above.
      </p>
      <p>
        <strong>Sources:</strong> directly from you; automatically through your interactions with the
        Website; from our service providers (analytics, hosting, advertising); and from public
        sources where applicable.
      </p>
      <p>
        <strong>Business / commercial purposes for which it is used:</strong> operating, securing
        and improving the Website; fulfilling orders; responding to support requests; aggregate
        analytics; legal compliance; and marketing of our own services.
      </p>
      <p>
        <strong>Disclosure / sharing.</strong> We disclose the categories above to service providers
        bound by contract. We <strong>do not sell</strong> Personal Information for monetary
        consideration. We may &quot;share&quot; certain identifiers and internet-activity data with
        advertising partners for cross-context behavioural advertising, which California law treats
        as a &quot;sale or share&quot;. You can opt out via the link below or by enabling the Global
        Privacy Control (GPC) signal in your browser, which we honor as a valid opt-out request.
      </p>
      <p>
        <strong>Your CCPA rights:</strong>
      </p>
      <ol className="list-[lower-alpha] pl-6 space-y-1">
        <li>Right to know what Personal Information we have collected about you and how it is used.</li>
        <li>Right to delete Personal Information we have collected (subject to exceptions).</li>
        <li>Right to correct inaccurate Personal Information.</li>
        <li>Right to opt out of the &quot;sale&quot; or &quot;sharing&quot; of Personal Information.</li>
        <li>Right to limit the use and disclosure of Sensitive Personal Information.</li>
        <li>Right to non-discrimination for exercising your CCPA rights — we will not deny services, charge different prices or provide a lower quality of service.</li>
      </ol>
      <p>
        To exercise any of these rights, email{' '}
        <a href="mailto:privacy@bestlooking.skin">privacy@bestlooking.skin</a> or use our{' '}
        <Link href="/contact">contact form</Link>. Authorised agents may submit requests on your
        behalf with verifiable written permission. We respond within 45 days (extendable by 45 days
        with notice). We may need information sufficient to verify you are the consumer about whom
        the data was collected.
      </p>
      <p>
        <strong>
          <a href="mailto:privacy@bestlooking.skin?subject=Do%20Not%20Sell%20or%20Share%20My%20Personal%20Information">
            Do Not Sell or Share My Personal Information
          </a>
        </strong>{' '}
        — clicking opens an email pre-addressed to our privacy team. You may also enable the Global
        Privacy Control (<a href="https://globalprivacycontrol.org" target="_blank" rel="noopener noreferrer">globalprivacycontrol.org</a>)
        in your browser as a universal opt-out.
      </p>

      {/* 10. Other US state laws */}
      <h3>10. Notice for residents of other US states</h3>
      <p>
        Residents of Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), Utah (UCPA), Texas
        (TDPSA), Oregon, Montana, and other US states with comprehensive privacy laws have rights
        broadly equivalent to those described in section 9: access, correction, deletion, portability
        and opt-out of targeted advertising / sale / profiling that produces legal or similarly
        significant effects. To exercise these rights, email{' '}
        <a href="mailto:privacy@bestlooking.skin">privacy@bestlooking.skin</a>. We honor recognised opt-out
        signals (including the Global Privacy Control) where required by your state&apos;s law. You
        have the right to appeal any denial of a rights request — contact{' '}
        <a href="mailto:privacy@bestlooking.skin">privacy@bestlooking.skin</a> with the subject line
        &quot;Appeal&quot;.
      </p>

      {/* 11. Children */}
      <h3>11. Children&apos;s privacy</h3>
      <p>
        The Website is intended for a general audience and is not directed to children under the age
        of 13 (or under 16 in the EEA / UK where applicable). We do not knowingly collect Personal
        Information from children. If you believe a child has provided us with Personal Information,
        please contact us at <a href="mailto:privacy@bestlooking.skin">privacy@bestlooking.skin</a> and we
        will delete it promptly. We comply with the US Children&apos;s Online Privacy Protection Act
        (COPPA) and equivalent provisions of the GDPR.
      </p>

      {/* 12. Cookies and tracking */}
      <h3>12. Cookies and tracking technologies</h3>
      <p>
        We use cookies and similar technologies to operate the site, remember preferences, measure
        aggregate usage and (with your consent in jurisdictions that require it) deliver advertising.
        Full details — including how to manage your consent, browser-specific opt-out instructions,
        and a list of cookie categories — are provided in our{' '}
        <Link href="/legal/cookies">Cookie Policy</Link>.
      </p>

      {/* 13. Affiliate disclosure (FTC) */}
      <h3>13. Affiliate-link disclosure</h3>
      <p>
        Some links on the Website are affiliate links. When you click through and make a qualifying
        purchase, we may earn a commission at no additional cost to you. {SITE.name} is a participant
        in the Amazon Services LLC Associates Program and other affiliate programs. Our editorial
        recommendations are not influenced by these relationships, in line with the U.S. Federal
        Trade Commission Endorsement Guides.
      </p>

      {/* 14. Changes */}
      <h3>14. Changes to this Privacy Policy</h3>
      <p>
        We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the
        top reflects the most recent revision. Material changes will be notified via the Website and,
        where required, by email or in-product notice prior to the change taking effect.
      </p>

      {/* 15. Contact */}
      <h3>15. How to contact us about privacy</h3>
      <p>
        Data Controller: FXN Holdings, Western Australia.<br />
        Privacy queries, access requests, complaints and CCPA / GDPR rights requests:{' '}
        <a href="mailto:privacy@bestlooking.skin">privacy@bestlooking.skin</a>.
      </p>

      <p className="mt-10 text-sm text-ink/55">
        This Privacy Policy is provided as a general template covering the Australian Privacy Act,
        the GDPR / UK GDPR, the CCPA / CPRA and other US state privacy laws. It does not constitute
        legal advice. For a fully audited document tailored to your specific operations, please
        consult a qualified privacy lawyer in your jurisdictions of operation.
      </p>
    </LegalArticle>
  );
}

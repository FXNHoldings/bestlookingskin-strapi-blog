import type { Metadata } from 'next';
import LegalArticle from '@/components/LegalArticle';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: `Website Terms and Conditions of Use for ${SITE.name}.`,
  alternates: { canonical: '/legal/terms' },
};

const MODIFIED = '2026-05-02';

export default function Page() {
  return (
    <LegalArticle pageKey="terms" title="Website Terms and Conditions of Use" modified={MODIFIED}>
      {/* 1. About the Website */}
      <h3>1. About the Website</h3>
      <ol className="list-[lower-alpha] pl-6 space-y-3">
        <li>
          Welcome to <a href="https://www.bestlooking.skin">www.bestlooking.skin</a> (<strong>Website</strong>).
          The Website provides product comparisons, reviews, how-to guides, top-rated products and
          price comparisions (<strong>Services</strong>).
        </li>
        <li>
          The Website is operated by FXN Holdings (ABN ). Access to and use of the Website, or any of
          its associated Products or Services, is provided by FXN Holdings. Please read these terms
          and conditions (<strong>Terms</strong>) carefully. By using, browsing and/or reading the
          Website, this signifies that you have read, understood and agree to be bound by the Terms.
          If you do not agree with the Terms, you must cease usage of the Website, or any of the
          Services, immediately.
        </li>
        <li>
          FXN Holdings reserves the right to review and change any of the Terms by updating this page
          at its sole discretion. When FXN Holdings updates the Terms, it will use reasonable
          endeavours to provide you with notice of updates to the Terms. Any changes to the Terms
          take immediate effect from the date of their publication. Before you continue, we recommend
          you keep a copy of the Terms for your records.
        </li>
      </ol>

      {/* 2. Acceptance of the Terms */}
      <h3>2. Acceptance of the Terms</h3>
      <p>
        You accept the Terms by remaining on the Website. You may also accept the Terms by clicking
        to accept or agree to the Terms where this option is made available to you by FXN Holdings
        in the user interface.
      </p>

      {/* 3. Copyright and Intellectual Property */}
      <h3>3. Copyright and Intellectual Property</h3>
      <ol className="list-[lower-alpha] pl-6 space-y-3">
        <li>
          The Website, the content and all of the related products of FXN Holdings are subject to
          copyright. The material on the Website is protected by copyright under the laws of
          Australia and through international treaties. Unless otherwise indicated, all rights
          (including copyright) in the content and compilation of the Website (including but not
          limited to text, graphics, logos, button icons, video images, audio clips, Website code,
          scripts, design elements and interactive features) or the content are owned or controlled
          for these purposes, and are reserved by FXN Holdings or its contributors.
        </li>
        <li>
          All trademarks, service marks and trade names are owned, registered and/or licensed by FXN
          Holdings, who grants to you a worldwide, non-exclusive, royalty-free, revocable license
          whilst you are a Member to:
          <ol className="mt-2 list-[lower-roman] pl-6 space-y-1">
            <li>use the Website pursuant to the Terms;</li>
            <li>copy and store the Website and the material contained in the Website in your device&apos;s cache memory; and</li>
            <li>print pages from the Website for your own personal and non-commercial use.</li>
          </ol>
          <p className="mt-3">
            FXN Holdings does not grant you any other rights whatsoever in relation to the Website or
            the content. All other rights are expressly reserved by FXN Holdings.
          </p>
        </li>
        <li>
          FXN Holdings retains all rights, title and interest in and to the Website and all related
          content. Nothing you do on or in relation to the Website will transfer any:
          <ol className="mt-2 list-[lower-roman] pl-6 space-y-1">
            <li>business name, trading name, domain name, trade mark, industrial design, patent, registered design or copyright, or</li>
            <li>a right to use or exploit a business name, trading name, domain name, trade mark or industrial design, or</li>
            <li>a thing, system or process that is the subject of a patent, registered design or copyright (or an adaptation or modification of such a thing, system or process),</li>
          </ol>
          <p className="mt-3">to you.</p>
        </li>
        <li>
          You may not, without the prior written permission of FXN Holdings and the permission of any
          other relevant rights owners: broadcast, republish, up-load to a third party, transmit,
          post, distribute, show or play in public, adapt or change in any way the content or third
          party content for any purpose, unless otherwise provided by these Terms. This prohibition
          does not extend to materials on the Website, which are freely available for re-use or are
          in the public domain.
        </li>
      </ol>

      {/* 4. Privacy */}
      <h3>4. Privacy</h3>
      <p>
        FXN Holdings takes your privacy seriously and any information provided through your use of
        the Website and/or content are subject to FXN Holdings&apos;s Privacy Policy, which is
        available on the Website.
      </p>

      {/* 5. General Disclaimer */}
      <h3>5. General Disclaimer</h3>
      <ol className="list-[lower-alpha] pl-6 space-y-3">
        <li>
          Nothing in the Terms limits or excludes any guarantees, warranties, representations or
          conditions implied or imposed by law, including the Australian Consumer Law (or any
          liability under them) which by law may not be limited or excluded.
        </li>
        <li>
          Subject to this clause 5, and to the extent permitted by law:
          <ol className="mt-2 list-[lower-roman] pl-6 space-y-1">
            <li>all terms, guarantees, warranties, representations or conditions which are not expressly stated in the Terms are excluded; and</li>
            <li>FXN Holdings will not be liable for any special, indirect or consequential loss or damage (unless such loss or damage is reasonably foreseeable resulting from our failure to meet an applicable Consumer Guarantee), loss of profit or opportunity, or damage to goodwill arising out of or in connection with the content or these Terms (including as a result of not being able to use the content or the late supply of the content), whether at common law, under contract, tort (including negligence), in equity, pursuant to statute or otherwise.</li>
          </ol>
        </li>
        <li>
          Use of the Website and the content is at your own risk. Everything on the Website and the
          content is provided to you &quot;as is&quot; and &quot;as available&quot; without warranty or
          condition of any kind. None of the affiliates, directors, officers, employees, agents,
          contributors and licensors of FXN Holdings make any express or implied representation or
          warranty about the content or any products or content (including the products or content of
          FXN Holdings) referred to on the Website. This includes (but is not restricted to) loss or
          damage you might suffer as a result of any of the following:
          <ol className="mt-2 list-[lower-roman] pl-6 space-y-1">
            <li>failure of performance, error, omission, interruption, deletion, defect, failure to correct defects, delay in operation or transmission, computer virus or other harmful component, loss of data, communication line failure, unlawful third party conduct, or theft, destruction, alteration or unauthorised access to records;</li>
            <li>the accuracy, suitability or currency of any information on the Website, the content, or any of its content related products (including third party material and advertisements on the Website);</li>
            <li>costs incurred as a result of you using the Website, the content or any of the products of FXN Holdings; and</li>
            <li>the content or operation in respect to links which are provided for your convenience.</li>
          </ol>
        </li>
      </ol>

      {/* 6. Limitation of liability */}
      <h3>6. Limitation of liability</h3>
      <ol className="list-[lower-alpha] pl-6 space-y-3">
        <li>
          FXN Holdings&apos;s total liability arising out of or in connection with the content or
          these Terms, however arising, including under contract, tort (including negligence), in
          equity, under statute or otherwise, will not exceed the resupply of the content to you.
        </li>
        <li>
          You expressly understand and agree that FXN Holdings, its affiliates, employees, agents,
          contributors and licensors shall not be liable to you for any direct, indirect, incidental,
          special consequential or exemplary damages which may be incurred by you, however caused
          and under any theory of liability. This shall include, but is not limited to, any loss of
          profit (whether incurred directly or indirectly), any loss of goodwill or business
          reputation and any other intangible loss.
        </li>
        <li>
          You acknowledge and agree that FXN Holdings holds no liability for any direct, indirect,
          incidental, special consequential or exemplary damages which may be incurred by you as a
          result of providing your content to the Website.
        </li>
      </ol>

      {/* 7. Termination of Contract */}
      <h3>7. Termination of Contract</h3>
      <ol className="list-[lower-alpha] pl-6 space-y-3">
        <li>
          If you want to terminate the Terms, you may do so by providing FXN Holdings with days&apos;
          notice of your intention to terminate by sending notice of your intention to terminate to
          FXN Holdings via the &apos;Contact Us&apos; link on our homepage.
        </li>
        <li>
          FXN Holdings may at any time, terminate the Terms with you if:
          <ol className="mt-2 list-[lower-roman] pl-6 space-y-1">
            <li>you have breached any provision of the Terms or intend to breach any provision;</li>
            <li>FXN Holdings is required to do so by law;</li>
            <li>FXN Holdings is transitioning to no longer providing the Services to Members in the country in which you are resident or from which you use the service; or</li>
            <li>the provision of the Services to you by FXN Holdings, is in the opinion of FXN Holdings, no longer commercially viable.</li>
          </ol>
        </li>
        <li>
          Subject to local applicable laws, FXN Holdings reserves the right to discontinue or cancel
          your access at any time and may suspend or deny, in its sole discretion, your access to all
          or any portion of the Website or the Services without notice if you breach any provision of
          the Terms or any applicable law or if your conduct impacts FXN Holdings&apos;s name or
          reputation or violates the rights of those of another party.
        </li>
        <li>
          When the Terms come to an end, all of the legal rights, obligations and liabilities that
          you and FXN Holdings have benefited from, been subject to (or which have accrued over time
          whilst the Terms have been in force) or which are expressed to continue indefinitely, shall
          be unaffected by this cessation, and the provisions of this clause shall continue to apply
          to such rights, obligations and liabilities indefinitely.
        </li>
      </ol>

      {/* 8. Indemnity */}
      <h3>8. Indemnity</h3>
      <p>
        You agree to indemnify FXN Holdings, its affiliates, employees, agents, contributors, third
        party content providers and licensors from and against:
      </p>
      <ol className="list-[lower-alpha] pl-6 space-y-2">
        <li>all actions, suits, claims, demands, liabilities, costs, expenses, loss and damage (including legal fees on a full indemnity basis) incurred, suffered or arising out of or in connection with your content;</li>
        <li>any direct or indirect consequences of you accessing, using or transacting on the Website or attempts to do so; and/or</li>
        <li>any breach of the Terms.</li>
      </ol>

      {/* 9. Dispute Resolution */}
      <h3>9. Dispute Resolution</h3>
      <p><strong>9.1 Compulsory:</strong></p>
      <p>
        If a dispute arises out of or relates to the Terms, either party may not commence any
        Tribunal or Court proceedings in relation to the dispute, unless the following clauses have
        been complied with (except where urgent interlocutory relief is sought).
      </p>

      <p><strong>9.2 Notice:</strong></p>
      <p>
        A party to the Terms claiming a dispute (<strong>Dispute</strong>) has arisen under the
        Terms, must give written notice to the other party detailing the nature of the dispute, the
        desired outcome and the action required to settle the Dispute.
      </p>

      <p><strong>9.3 Resolution:</strong></p>
      <p>
        On receipt of that notice (<strong>Notice</strong>) by that other party, the parties to the
        Terms (<strong>Parties</strong>) must:
      </p>
      <ol className="list-[lower-alpha] pl-6 space-y-2">
        <li>Within 28 days of the Notice endeavour in good faith to resolve the Dispute expeditiously by negotiation or such other means upon which they may mutually agree;</li>
        <li>If for any reason whatsoever, 28 days after the date of the Notice, the Dispute has not been resolved, the Parties must either agree upon selection of a mediator or request that an appropriate mediator be appointed by the Resolution Institute;</li>
        <li>The Parties are equally liable for the fees and reasonable expenses of a mediator and the cost of the venue of the mediation and without limiting the foregoing undertake to pay any amounts requested by the mediator as a precondition to the mediation commencing. The Parties must each pay their own costs associated with the mediation;</li>
        <li>The mediation will be held in Perth, Australia.</li>
      </ol>

      <p><strong>9.4 Confidential</strong></p>
      <p>
        All communications concerning negotiations made by the Parties arising out of and in
        connection with this dispute resolution clause are confidential and to the extent possible,
        must be treated as &quot;without prejudice&quot; negotiations for the purpose of applicable
        laws of evidence.
      </p>

      <p><strong>9.5 Termination of Mediation:</strong></p>
      <p>
        If 2 months have elapsed after the start of a mediation of the Dispute and the Dispute has
        not been resolved, either Party may ask the mediator to terminate the mediation and the
        mediator must do so.
      </p>

      {/* 10. Venue and Jurisdiction */}
      <h3>10. Venue and Jurisdiction</h3>
      <p>
        The Services offered by FXN Holdings is intended to be viewed by residents of Australia. In
        the event of any dispute arising out of or in relation to the Website, you agree that the
        exclusive venue for resolving any dispute shall be in the courts of Western Australia,
        Australia.
      </p>

      {/* 11. Governing Law */}
      <h3>11. Governing Law</h3>
      <p>
        The Terms are governed by the laws of Western Australia, Australia. Any dispute, controversy,
        proceeding or claim of whatever nature arising out of or in any way relating to the Terms and
        the rights created hereby shall be governed, interpreted and construed by, under and pursuant
        to the laws of Western Australia, Australia, without reference to conflict of law principles,
        notwithstanding mandatory rules. The validity of this governing law clause is not contested.
        The Terms shall be binding to the benefit of the parties hereto and their successors and
        assigns.
      </p>

      {/* 12. Severance */}
      <h3>12. Severance</h3>
      <p>
        If any part of these Terms is found to be void or unenforceable by a Court of competent
        jurisdiction, that part shall be severed and the rest of the Terms shall remain in force.
      </p>
    </LegalArticle>
  );
}

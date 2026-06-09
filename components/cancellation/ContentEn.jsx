import React from "react";
import PageTitle from "../shared/PageTitle";

export default function ContentEn({ translate, lang }) {
  const t1 = (text) => translate(`cancellation.${text}`);
  return (
    <>
      <PageTitle lang={lang} title={t1("title")} description={t1("subtitle")} />
      <div className="max-w-screen-2xl mx-auto px-3 text-gray-800 font-sans text-lg">
        <h2 className="text-3xl font-bold mb-6 border-t-2 border-[#00000033]/20 pt-8">
          1. Introduction
        </h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            1.1. These terms govern your access to and use of the{" "}
            <span className="font-bold">Estajer Platform</span> (referred to as
            the “Site”), which is a trade name and registered trademark.
          </p>
          <p className="leading-relaxed">
            1.2. Please read these terms along with the Privacy Policy and all
            supplementary policies related to your use of the Site (collectively
            referred to as the “Terms and Conditions”) to ensure you understand
            each provision before using the{" "}
            <span className="font-bold">Estajer Platform</span> site, as they
            affect your legal rights.
          </p>
          <p className="leading-relaxed">
            1.3. By visiting the{" "}
            <span className="font-bold">Estajer Platform</span> site,
            registering an account, browsing the Site, or placing a rental or
            leasing order, you confirm that you have read these terms,
            understood their content, and agree to be bound by them, including
            the additional terms and policies referenced herein. If you do not
            agree to the terms and policies of the{" "}
            <span className="font-bold">Estajer Platform</span> site, you may
            not access the Site or place an order through it.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">2. Definitions</h2>
        <p className="mb-4 leading-relaxed">
          The following terms shall have the meanings indicated, unless the
          context otherwise requires:
        </p>
        <ul className="list-disc list-inside pr-5 mb-8 space-y-2">
          <li>
            “<span className="font-bold">The Site</span>”: means the website on
            the World Wide Web.
          </li>
          <li>
            “<span className="font-bold">We</span>”, “
            <span className="font-bold">Us</span>”, or “
            <span className="font-bold">Our</span>”: means{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>
            .
          </li>
          <li>
            “<span className="font-bold">User</span>”, “
            <span className="font-bold">You</span>”: means anyone who registers
            an account or uses the Site, whether a lessor or lessee.
          </li>
          <li>
            “<span className="font-bold">Lessor</span>”: means anyone who
            registers an account to offer goods they own for rent on the{" "}
            <span className="font-bold">Estajer Platform</span>.
          </li>
          <li>
            “<span className="font-bold">Lessee</span>”: means anyone who
            registers an account and requests to rent goods offered or
            advertised on the{" "}
            <span className="font-bold">Estajer Platform</span>.
          </li>
          <li>
            “<span className="font-bold">The Parties/Parties</span>”: means both
            the Lessor and the Lessee.
          </li>
          <li>
            “<span className="font-bold">Goods</span>”: means the items or
            objects offered for rent by the Lessor on the{" "}
            <span className="font-bold">Estajer Platform</span>.
          </li>
          <li>
            “<span className="font-bold">Laws</span>”: means the laws and
            regulations applicable in the country where the Lessor and Lessee
            contract.
          </li>
          <li>
            “<span className="font-bold">Content</span>”: means all audio,
            videos, texts, graphics, images, and any other materials entered,
            processed, included, or accessed through the Site.
          </li>
          <li>
            “<span className="font-bold">Terms and Conditions</span>”, “
            <span className="font-bold">Agreement</span>”: means these terms,
            the Privacy Policy, and any other operating rules.
          </li>
        </ul>

        <h2 className="text-3xl font-bold mb-6">3. Legal Scope of Services</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            3.1. <span className="font-bold">Estajer Platform</span> is an
            electronic website that acts as an intermediary platform between
            Lessors and Lessees, connecting the Lessor who offers goods for rent
            with the Lessee who requests to rent one of these goods. Our role is
            limited to providing mediation services through the Site and
            connecting the parties for a final agreement. We do not have any
            supervisory or regulatory authority over the Lessor, nor are we
            representatives or agents for the Lessees.
          </p>
          <p className="font-bold mb-2">
            The Estajer Platform provides the following features:
          </p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>
              Free account creation for Lessees, and subscription for Lessors in
              one of the packages offered by the Site.
            </li>
            <li>Display of goods advertised by Lessors on the Site.</li>
            <li>Various payment methods suitable for all users.</li>
            <li>Technical support for all users.</li>
          </ul>
          <p className="leading-relaxed">
            3.2. Advertisements for goods offered for rent are provided by the
            Lessor to the Lessee, without any intervention from the{" "}
            <span className="font-bold">Estajer Platform</span> site in
            providing the service to the Lessee. The Site follows up on all
            inquiries and attempts to resolve issues that may arise between the
            parties, in addition to managing orders placed on the Site.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">4. Electronic Contract</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            4.1. These terms constitute a legally binding electronic contract
            between{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            as the owner and operator of the{" "}
            <span className="font-bold">Estajer Platform</span> site and you as
            a user (Lessor and Lessee). By using the Site, you agree to these
            terms and are bound by them as you would be by written contracts,
            and they produce the same legal effects as such contracts.
          </p>
          <p className="leading-relaxed">
            4.2. All legally binding effects of this contract are valid from the
            date of using the Site. The user may not disclaim these obligations
            as long as they have produced their legal effects, and is committed
            to fulfilling his obligations according to the provisions of this
            contract.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">5. Terms of Use</h2>
        <p className="mb-4 leading-relaxed">
          By using the <span className="font-bold">Estajer Platform</span> site,
          you represent and warrant to us the following:
        </p>
        <ul className="list-disc list-inside pr-5 mb-8 space-y-2">
          <li>
            That you agree to the terms, conditions, rules, and instructions for
            operating the Site.
          </li>
          <li>
            That you are of legal age to enter into contracts, or have the
            consent of a parent or legal guardian, and assume responsibility for
            your actions and the consequences of using the Site, including
            payment transactions.
          </li>
          <li>
            You have full legal capacity and unrestricted authority to enter
            into contracts.
          </li>
          <li>
            You have not been previously suspended or banned from using the
            Site.
          </li>
          <li>
            That you have full power and authority to contract without violating
            Any law or contract.
          </li>
          <li>
            That your registration and use of the Site comply with applicable
            laws and regulations.
          </li>
        </ul>

        <h2 className="text-3xl font-bold mb-6">
          6. Account Registration and Membership
        </h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            6.1. To access certain sections and features of the{" "}
            <span className="font-bold">Estajer Platform</span> site, you must
            register an account, either for free for the Lessee, or by
            subscription for the Lessor. You agree to:
          </p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>
              Comply with all applicable local laws and all guidelines and
              instructions related to the use of the Site.
            </li>
            <li>
              Acknowledge that you are solely responsible for the consequences
              of registering any other person's data on the site.
            </li>
            <li>
              Provide true, accurate, and complete data such as (full name,
              mobile number, email address), and commit to updating this data
              immediately if any changes occur. And bear full responsibility for
              the unreliability of this data or any error in it.
            </li>
            <li>Add your real name and a personal photo to your profile.</li>
            <li>
              Bear full responsibility for all activities and actions that occur
              from your account.
            </li>
            <li>
              Inform us immediately of any illegal use of the account or any
              security breach of the Site.
            </li>
            <li>
              Comply with any notices from the Site regarding the service it
              provides to ensure no operational processes on the Site are
              hindered.
            </li>
            <li>
              Cooperate with our requests and provide all required documents
              that prove your identity.
            </li>
          </ul>
          <p className="leading-relaxed">
            6.2. The <span className="font-bold">Estajer Platform</span> site
            has the right to block accounts that violate the Site's terms or
            those that cause harm to the Site or its users permanently and
            without referring to the user or notifying them if the following is
            proven to us:
          </p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>
              Non-compliance with the terms, policies, and operating rules
              related to the Site.
            </li>
            <li>
              Providing data or information that is deemed incorrect,
              inaccurate, or fraudulent.
            </li>
            <li>Using stolen or counterfeit payment cards.</li>
            <li>
              Using the account in a manner not permitted under these terms.
            </li>
            <li>
              That your exploitation of the Site's content has caused us any
              damages, losses, liability, or responsibility towards us.
            </li>
            <li>
              If we see other violations – in our sole discretion – in any other
              circumstances.
            </li>
          </ul>
          <p className="leading-relaxed">
            6.3. A user whose membership has been excluded or suspended may not
            at any time access, register, or use the Site in any way.
          </p>
          <p className="leading-relaxed">
            6.4. If we suspect taking any action against any violation by you or
            any other person, this does not mean a waiver by{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            of its right to take any legal action regarding those violations.
            Nor does it mean taking such actions against all potential
            violations of these terms.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">
          7. Licenses and Usage Restrictions
        </h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            7.1.{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            grants you a limited, non-exclusive, non-transferable,
            non-sublicensable license to access and use the content,
            information, and related materials available to you through the{" "}
            <span className="font-bold">Estajer Platform</span> site for
            personal use only, and in accordance with these terms.
          </p>
          <p className="leading-relaxed">
            7.2. The license granted to the user does not include any ownership
            rights to the Site or any part of it or any service provided through
            it. Nor does this license, whether directly or indirectly, indicate
            the existence of any kind of partnership between the{" "}
            <span className="font-bold">Estajer Platform</span> site and the
            user.
          </p>
          <p className="leading-relaxed font-bold">
            7.3. The rights granted to you in these terms are subject to
            specific restrictions. You may not:
          </p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>
              License, sell, rent, transfer, assign, distribute, host, or
              exploit the service.
            </li>
            <li>
              Modify, translate, adapt, merge, create derivative works from, or
              disassemble any part of the Site.
            </li>
            <li>
              Access the service or the Site to create similar or competitive
              services.
            </li>
            <li>
              Remove, modify, alter, or damage trademarks, copyrights, or
              proprietary notices contained in the Site.
            </li>
          </ul>
          <p className="leading-relaxed">
            7.4. The licenses granted to you by us will terminate if you do not
            comply with the terms and conditions of the{" "}
            <span className="font-bold">Estajer Platform</span> site.
          </p>
          <p className="leading-relaxed">
            7.5.{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            may, without notice or obligation, impose limits on certain features
            and services or restrict your access to all or parts of the Site at
            any time.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">8. Unacceptable Use</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            8.1. You agree to refrain from the following (whether done by you
            personally or through a third party):
          </p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>
              Using the Site to violate any applicable law, regulation, system,
              or rule, or to harm the reputation of{" "}
              <span className="font-bold">
                Advanced Business Investment Holding Company
              </span>{" "}
              or the trademark of the{" "}
              <span className="font-bold">Estajer Platform</span> site.
            </li>
            <li>
              Imitating or preventing any user from using the Site, or
              impersonating any user or entity including any employee or
              representative of{" "}
              <span className="font-bold">
                Advanced Business Investment Holding Company
              </span>
              .
            </li>
            <li>
              Posting electronic messages through the Site containing (spam) or
              messages that constitute illegal activities.
            </li>
            <li>
              Posting any content that is consistent with Islamic teachings, or
              represents incitement to sedition, gambling, or illegal content,
              pornographic, obscene, racist, offensive, insulting, demeaning,
              threatening, scandalous, or unacceptable messages.
            </li>
            <li>
              Using an automated process to match, monitor, copy, or extract any
              pages on the Site, or any information, content, or data it
              contains or is accessed through the Site without our prior written
              consent.
            </li>
            <li>
              Transferring your account and username to another party without
              our consent.
            </li>
            <li>
              Sending or introducing any materials containing viruses or any
              other malicious software or codes, files, or other computer
              programs designed to harm or interfere with the normal operation
              of all or part of the service.
            </li>
            <li>
              Collecting or tracking contact information and email addresses of
              other users for commercial purposes.
            </li>
            <li>
              Tampering with data and information and attempting to modify or
              damage any security measures or guidelines, or any automated
              process to interfere with or attempt to interfere with the proper
              functioning of the{" "}
              <span className="font-bold">Estajer Platform</span> site.
            </li>
            <li>
              Attempting unauthorized access to the Site or any networks,
              servers, or computer systems related to the Site.
            </li>
            <li>
              Violating any trademark, copyright, or other proprietary rights of
              any party, or content you do not have the right to provide under
              any law or contractual relationships.
            </li>
          </ul>
          <p className="leading-relaxed font-bold">
            8.2. If it becomes apparent to us that you have engaged in any of
            the foregoing uses, we are entitled to:
          </p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>
              Delete any materials or content you have posted without notifying
              you.
            </li>
            <li>
              Suspend, restrict your access to, or prevent you from using the
              services, or terminate your account immediately.
            </li>
            <li>
              Report your activities to the competent authorities and take legal
              action against you.
            </li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mb-6">9. Lessors' Policy</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            9.1. The Lessor must register an account with correct, accurate, and
            approved data.
          </p>
          <p className="leading-relaxed">
            9.2. The Lessor must adhere to the Site's terms of use and service
            conditions.
          </p>
          <p className="leading-relaxed">
            9.3. The Lessor is responsible for the content they publish on the
            Site, and the content must be accurate, correct, and not misleading.
            The content must not violate the intellectual property rights of any
            third party or applicable laws.
          </p>
          <p className="leading-relaxed">
            9.4. The Lessor may not offer any prohibited or illegal goods or
            services, or those that violate Islamic Sharia.
          </p>
          <p className="leading-relaxed">
            9.5. The Lessor must deal with Lessees in good faith and provide
            good customer service, and undertakes not to use the Site to harm,
            harass, or annoy any person.
          </p>
          <p className="leading-relaxed">
            9.6. The Lessor must respond to Lessees' inquiries within 24 hours,
            and maintain the confidentiality and privacy of any information
            obtained from the Lessee.
          </p>
          <p className="leading-relaxed">
            9.7. The Lessor must adhere to the prices of goods and services
            advertised on the Site, and is obliged to rent out the item
            according to the contract concluded between them and the Lessee
            without any legal liability on the Estajer Platform, and is obliged
            to deliver the item without delay.
          </p>
          <p className="leading-relaxed">
            9.8. The Lessor acknowledges that the Estajer Platform has no
            relationship with the Lessee and is not considered an agent for
            them, and therefore we have no supervisory or regulatory authority
            over the Lessor or Lessee, and each party is personally liable
            according to this agreement and according to the law.
          </p>
          <p className="leading-relaxed">
            9.9. The Lessor acknowledges and agrees that the management of the
            Estajer Platform has the right to delete and/or disable any item
            from rental if it does not meet any of the rules mentioned in these
            terms, and must adhere to the shipping and delivery policy specified
            on the Site.
          </p>
          <p className="leading-relaxed">
            9.10. In the event of a dispute between the Lessor and the Lessee
            regarding any order, they will resort to enforcing the contract
            concluded between them through amicable or judicial settlement means
            without recourse to the Estajer Platform site in any way. Any
            dispute between the Lessor and the Lessee shall be resolved by
            mutual understanding between the parties, and the Estajer Platform
            may intervene in very limited cases at the request of one of the
            parties.
          </p>
          <p className="leading-relaxed">
            9.11. The Lessor is responsible for any taxes or fees due on their
            revenue from the Site, and the Estajer Platform site reserves the
            right to take all legal measures against those who violate these
            terms or other policies listed.
          </p>
          <p className="font-bold">The Lessor must:</p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>Own the item they offer on the Site.</li>
            <li>Describe the item in the correct section.</li>
            <li>
              Provide a suitable title for the item and clarify all its
              specifications.
            </li>
            <li>The image must be clear, accurate, and represent the item.</li>
            <li>
              The item must be fit for use and free from all apparent and hidden
              defects.
            </li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mb-6">10. Lessees' Policy</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            10.1. Account registration for the Lessee is free. The Lessee must
            verify their account through the National Single Sign-On (Nafath) to
            be able to complete the rental process.
          </p>
          <p className="leading-relaxed">
            10.2. The Lessee must comply with the terms and conditions of{" "}
            <span className="font-bold">Estajer Platform</span> and all
            applicable laws when using the Site.
          </p>
          <p className="leading-relaxed">
            10.3. The Lessee acknowledges that the account is personal and bears
            full responsibility for all actions taken through it.
          </p>
          <p className="leading-relaxed">
            10.4. The Lessee is obliged to clarify the electronic number through
            the <span className="font-bold">Estajer Platform</span> site.
          </p>
          <p className="leading-relaxed">
            10.5. The Lessee pays a security deposit for the rented item before
            the start of the rental period, and the amount is refunded after
            confirmation of receiving the product in good condition by the
            Lessor.
          </p>
          <p className="leading-relaxed">
            10.6. The Lessee is obliged to pay the rental value of the items
            they rent through the approved means on the{" "}
            <span className="font-bold">Estajer Platform</span> site.
          </p>
          <p className="leading-relaxed">
            10.7. The Lessee is obliged to maintain the item completely to
            ensure its return in the same condition as received.
          </p>
          <p className="leading-relaxed">
            10.8. The Lessee is obliged to return the rented item to the Lessor
            at the end of the rental period. In case of any damage to the rented
            item or its non-return, the Lessor has the right to the benefits of
            the security deposit paid in advance by the Lessee.
          </p>
          <p className="leading-relaxed">
            10.9. The Lessee is responsible for communication between them and
            the Lessor, and acknowledges that the{" "}
            <span className="font-bold">Estajer Platform</span> site is merely a
            link between the two parties.
          </p>
          <p className="leading-relaxed">
            10.10. The Lessee acknowledges that they are contracting with the
            Lessor independently and will be personally liable to the Lessor for
            any breach of the terms of the contract concluded between the
            parties. Consequently, the{" "}
            <span className="font-bold">Estajer Platform</span> site does not
            assume any responsibility and may provide undertakings regarding the
            rented items.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">11. Rental Policy</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            11.1. When the Lessee submits a request to rent an item from the
            items offered by Lessors on the{" "}
            <span className="font-bold">Estajer Platform</span> site, and it has
            been received and accepted by the Lessor and the item reserved after
            agreeing on the rental period and paying its price, you will receive
            a confirmation message with the order details.
          </p>
          <p className="leading-relaxed">
            11.2. The Lessor is obliged to specify the rental price of the item
            per day.
          </p>
          <p className="leading-relaxed">
            11.3. The Lessor acknowledges not to demand any additional amounts
            from the Lessee beyond those agreed upon within the Site.
          </p>
          <p className="leading-relaxed">
            11.4. The rental period begins and ends according to the dates and
            times specified in the contract concluded between the Lessor and the
            Lessee.
          </p>
          <p className="leading-relaxed">
            11.5. The Lessee can make any changes or modifications to the order
            before the start of the rental period by at least 2 days.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">12. Insurance Policy</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            12.1. The Lessee is obliged to pay the security deposit amount
            determined by the Lessor before the rental period of the item.
          </p>
          <p className="leading-relaxed">
            12.2. The security deposit amount is fully refunded within a maximum
            period of (5) five working days from the date of returning the
            rented item in the same condition as received.
          </p>
          <p className="leading-relaxed">
            12.3. The Lessor has the right to confiscate the security deposit
            amount if the rented item is not returned by the Lessee.
          </p>
          <p className="leading-relaxed">
            12.4. The Lessor has the right to deduct from the security deposit
            amount for damages incurred to the rented item after assessing the
            value of the damage.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">13. Payment Policy</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            13.1. The <span className="font-bold">Estajer Platform</span> site
            provides electronic payment via electronic cards.
          </p>
          <p className="leading-relaxed">
            13.2. You authorize us and third-party payment processors to collect
            all amounts for orders you place on the{" "}
            <span className="font-bold">Estajer Platform</span> site, and all
            transactions made through electronic dealings are due immediately.
          </p>
          <p className="leading-relaxed">
            13.3. The user must ensure that the information entered in the
            payment process is correct and accurate before completing the
            payment.
          </p>
          <p className="leading-relaxed">
            13.4. The user must use their own bank or credit cards. If they use
            another party's card, they must have authorization or permission to
            use it. Consequently, the{" "}
            <span className="font-bold">Estajer Platform</span> site disclaims
            responsibility towards any party as a result of using their credit
            cards.
          </p>
          <p className="leading-relaxed">
            13.5. All information and data entered through electronic payment
            gateways are encrypted for security purposes, and correspondence to
            and from the service provider's site is also encrypted.
          </p>
          <p className="leading-relaxed">
            13.6. The <span className="font-bold">Estajer Platform</span> site
            is not responsible for errors in the payment process, or for
            liability resulting from hacking or fraud operations carried out via
            the internet.
          </p>
          <p className="leading-relaxed">
            13.7.{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            reserves the right to modify the payment policy at any time it deems
            appropriate, by adding new payment methods or changing one of the
            available methods, and this will be published in this policy.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">14. Commission Policy</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            14.1. The <span className="font-bold">Estajer Platform</span> site
            offers the Lessor the ability to display items for rent with two
            options: free or paid by subscription.
          </p>
          <p className="leading-relaxed">
            14.2. The <span className="font-bold">Estajer Platform</span> site
            receives a commission ranging from (5%) to (20%) from each rental
            operation depending on the item's classification.
          </p>
          <p className="leading-relaxed">
            14.3. The Lessee pays the rental value using one of the electronic
            payment methods, and the{" "}
            <span className="font-bold">Estajer Platform</span> site deducts the
            commission and transfers the remaining amount to the Lessor's
            account.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">
          15. Cancellation and Refund Policy
        </h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            15.1. If the Lessee requests to cancel the reservation more than
            [48] hours before the start of the rental period, [5%] will be
            deducted from the paid amount before refunding the amount, and
            electronic payment service fees will be deducted.
          </p>
          <p className="leading-relaxed">
            15.2. If the Lessee requests to cancel the reservation [24] hours
            before the start of the rental period, [10%] will be deducted from
            the paid amount before refunding the amount, and electronic payment
            service fees will be deducted.
          </p>
          <p className="leading-relaxed">
            15.3. The commission of the{" "}
            <span className="font-bold">Estajer Platform</span> site is
            non-refundable.
          </p>
          <p className="leading-relaxed">
            15.4. The Lessee is not entitled to request a refund of the rental
            amount if the rental period has begun or has entered the
            non-cancellable period previously specified by the Lessor.
          </p>
          <p className="leading-relaxed">
            15.5. In case any amounts are refunded to the Lessee, they will be
            returned through the original payment method within [3] working
            days, with the Lessee bearing any electronic payment service fees.
          </p>
          <p className="leading-relaxed">
            15.6. In case the Lessee confirms non-receipt of the item, the full
            amount will be refunded to them.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">16. Review Policy</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            16.1. The Lessee has the right to review the Lessor after benefiting
            from the rented item, and the review must be honest, objective, and
            lawful.
          </p>
          <p className="leading-relaxed">
            16.2. It is prohibited to add any misleading, offensive, defamatory
            review, or one containing abuse in any form. It is also prohibited
            to use religious slogans or derogatory phrases towards cultures or
            peoples, or that violate the applicable system.
          </p>
          <p className="leading-relaxed">
            16.3. The <span className="font-bold">Estajer Platform</span> site
            has the right to review and delete any review that violates the
            terms and conditions, and in all cases, the Site does not bear any
            responsibility regarding the truthfulness of these reviews or their
            legality.
          </p>
          <p className="leading-relaxed">
            16.4.{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            has the right to resort to the judiciary and claim appropriate
            compensation if these reviews result in damages to the Site.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">17. Legal Liability</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            17.1. As a user of the{" "}
            <span className="font-bold">Estajer Platform</span> site, you agree
            to:
          </p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>
              Use the Site at your own personal risk and bear full
              responsibility for the consequences of this use, and adhere to the
              restrictions imposed on use as set out in these terms.
            </li>
            <li>
              Pay any amounts due to the{" "}
              <span className="font-bold">Estajer Platform</span> site.
            </li>
            <li>
              That any information you send to us does not violate any property
              rights, encourage terrorism or hatred, or contain political or
              offensive materials or information, or pornographic images.
            </li>
            <li>
              The right of{" "}
              <span className="font-bold">
                Advanced Business Investment Holding Company
              </span>{" "}
              to suspend the service for indefinite periods or cancel the
              service at any time without notifying you.
            </li>
            <li>
              Indemnify us for any losses or damages resulting from a breach of
              the terms and conditions, and you must bear the costs and expenses
              of direct and indirect lawsuits.
            </li>
          </ul>
          <p className="leading-relaxed">
            17.2. You confirm that all information you provide to us is correct,
            accurate, and current, including payment information.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">18. Disclaimer</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            18.1. The content, information, and any materials on the{" "}
            <span className="font-bold">Estajer Platform</span> site are
            provided on an "as is" and "as available" basis, without any
            warranties or representations of any kind, whether express or
            implied, including warranties of merchantability, fitness for a
            particular purpose, compatibility, security, accuracy, reliability,
            or completeness of any content, information, software, texts,
            images, or links on the Site, or that its use will be error-free or
            uninterrupted.
          </p>
          <p className="leading-relaxed">
            18.2.{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            will not be liable for any losses or damages, whether direct,
            indirect, consequential, or incidental, arising from, including but
            not limited to:
          </p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>
              The suitability of any item offered by the Lessor for the Lessee's
              purposes or that it will meet their requirements.
            </li>
            <li>
              Information or recommendations related to rented items or their
              prices.
            </li>
            <li>
              The Lessee's failure to return the item, or its exposure to any
              damage, defect, or malfunction by the Lessee.
            </li>
            <li>
              Any deception or fraud by any Lessor regarding the rented item.
            </li>
            <li>
              Any loss resulting from matters beyond our control and in which we
              have no involvement.
            </li>
            <li>
              Any potential or sudden interruption in service due to periodic
              maintenance, repair of technical problems, or other similar
              reasons.
            </li>
            <li>
              Any failure, error, omission, defect, or interruption in the
              operation of the Site.
            </li>
            <li>
              Any failure by the user to maintain the security, confidentiality,
              and privacy of account data.
            </li>
            <li>
              Any personal actions or violation of privacy or intellectual
              property rights.
            </li>
            <li>
              Any external links accessible through our site, or any
              instructions or content provided on such links.
            </li>
          </ul>
          <p className="leading-relaxed">
            18.3.{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            will not bear any responsibility for failure or delay in performance
            when caused by circumstances beyond its control, force majeure, or
            emergency circumstances that lead to the suspension or disruption of
            the Site's normal operation.
          </p>
          <p className="leading-relaxed">
            18.4.{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            does not guarantee that the Site will be provided in a timely,
            completely secure manner, or that the results obtained through it
            will be correct and reliable, or will meet your expectations.
          </p>
          <p className="leading-relaxed">
            18.5.{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            makes no representations or warranties about the accuracy,
            reliability, or completeness of any content, information, software,
            texts, graphics, links, or communications provided on the Site or
            through the use of the service.
          </p>
          <p className="leading-relaxed">
            18.6. You acknowledge that the{" "}
            <span className="font-bold">Estajer Platform</span> site is an
            internet-based service, and although we make every effort to
            maintain information and keep it secure, we cannot guarantee that
            the information received by the user or entered by any other user
            while using the Site will be secure at all times.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">19. User Submissions</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            19.1. We welcome all responses and comments about the service
            provided by the <span className="font-bold">Estajer Platform</span>{" "}
            site.
          </p>
          <p className="leading-relaxed">
            19.2. By submitting any submissions or content on the{" "}
            <span className="font-bold">Estajer Platform</span> site, including
            Question, criticism, comment, response, idea, and suggestion
            (collectively "Submissions"), you grant us a non-exclusive,
            royalty-free, perpetual, transferable, worldwide, irrevocable, and
            sub-licensable license to:
          </p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>
              Use, reproduce, modify, edit, adapt, translate, distribute,
              publish, copy, and broadcast it in any form, and through any media
              now known or hereafter developed.
            </li>
            <li>Use the name you submitted in connection with the content.</li>
          </ul>
          <p className="leading-relaxed">
            19.3. You may not add any submissions or comments containing obscene
            language, claim to be someone else, or use fake email addresses or
            names.
          </p>
          <p className="leading-relaxed">
            19.4. The Lessee may not use reviews to violate any of the Lessors'
            rights, or use shameful or sexually explicit words, or write hate
            speech, discrimination, violence, threats, or any other illegal
            acts.
          </p>
          <p className="leading-relaxed">
            19.5. We have the right to review any content submitted by the user
            to the <span className="font-bold">Estajer Platform</span> site, and
            to block or remove content that, in our sole discretion, violates
            these terms and conditions.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">
          20. Intellectual Property Rights
        </h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            20.1.{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            retains all intellectual property rights and trademarks in the Site
            and services related to the{" "}
            <span className="font-bold">Estajer Platform</span> site, and all
            copyrights, trade dress, designs, logos, icons, slogans, words, page
            headers, button icons, service names, and other intellectual
            properties, materials, and other rights including software rights
            and HTML code and other codes it contains, including content, texts,
            fonts, images, software, audio files, music, video, digital
            materials, documents, data, and forms, which are protected by
            intellectual property and trademark laws.
          </p>
          <p className="leading-relaxed">
            20.2. You are not permitted to publish, distribute, reproduce, or
            copy any of the content provided to you or made available on the{" "}
            <span className="font-bold">Estajer Platform</span> site, or use any
            part of the Site's content for commercial purposes without obtaining
            a license from us.
          </p>
          <p className="leading-relaxed">
            20.3. You may not, or assist or facilitate others to, copy,
            reproduce, broadcast, distribute, adapt, use commercially, or create
            derivative works based on the content.
          </p>
          <p className="leading-relaxed">
            20.4. If you become aware of any distribution or commercial
            exploitation of any kind, you agree to inform us immediately.
          </p>
          <p className="leading-relaxed">
            20.5. Trademarks and designs may not be used in any service, media,
            or advertising in any way or for promotional purposes, intentionally
            or unintentionally, without prior permission from the{" "}
            <span className="font-bold">Estajer Platform</span> site.
          </p>
          <p className="leading-relaxed">
            20.6. All other trademarks not affiliated with us that appear on the{" "}
            <span className="font-bold">Estajer Platform</span> site are the
            property of their original owners who may or may not be affiliated
            with, connected to, or sponsored by the Site.
          </p>
          <p className="leading-relaxed">
            20.7. Nothing contained on the{" "}
            <span className="font-bold">Estajer Platform</span> site shall be
            construed as granting any license or right to use any trademark
            without the prior written permission of the party that owns the
            trademark.
          </p>
          <p className="leading-relaxed">
            20.8. Any unauthorized use, copying, imitation, or distortion of the{" "}
            <span className="font-bold">Estajer Platform</span> trademark is a
            violation of our rights under trademark protection laws; therefore,
            we reserve all our rights to seek appropriate compensation and
            resort to criminal courts to impose penalties for trademark rights
            violations.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">21. Third-Party Links</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            21.1. The <span className="font-bold">Estajer Platform</span> site
            may contain links to third-party websites or resources. You
            acknowledge and agree that{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            will not be liable or responsible for the availability or content of
            any third-party website or application that you accessed through the{" "}
            <span className="font-bold">Estajer Platform</span> site.
          </p>
          <p className="leading-relaxed">
            21.2. Links to external websites do not imply any endorsement by the{" "}
            <span className="font-bold">Estajer Platform</span> site of these
            websites or the content or services available through them.
          </p>
          <p className="leading-relaxed">
            21.3. You acknowledge sole responsibility for all risks that may
            arise from your use of any of these websites, resources, content, or
            services found or available from these websites or resources.
          </p>
          <p className="leading-relaxed">
            21.4. If you decide to access any third-party links, you do so
            entirely at your own risk and subject to the terms and policies of
            that third party.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">22. Indemnification</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            22.1. You agree to indemnify{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            and any of its directors, officers, employees, and agents from all
            claims, liabilities, losses, damages, fines, costs, or other
            expenses of whatever kind or nature including legal fees and
            attorney's fees arising out of or relating to:
          </p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>Claims resulting from your use of the Site.</li>
            <li>
              Misuse of the Site, or damages arising from your use of the{" "}
              <span className="font-bold">Estajer Platform</span> site, whatever
              its type.
            </li>
            <li>
              Any misrepresentation by you in the data or information you
              provide.
            </li>
            <li>
              Your non-compliance with the terms and policies of the{" "}
              <span className="font-bold">Estajer Platform</span> site.
            </li>
            <li>
              Your violation of the rights of any third party including
              intellectual property rights.
            </li>
          </ul>
          <p className="leading-relaxed">
            22.2. You acknowledge your agreement to cooperate fully with us in
            the manner we specify to defend or settle any claim.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">
          23. Electronic Communication
        </h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            23.1. You agree to be contacted by email, mobile number, or through
            the <span className="font-bold">Estajer Platform</span> site.
          </p>
          <p className="leading-relaxed">
            23.2. You agree that all agreements, notices, statements, or other
            communications that we may provide to you electronically satisfy all
            legal requirements as if such communications were in writing.
          </p>
          <p className="leading-relaxed">
            23.3. Registration on the{" "}
            <span className="font-bold">Estajer Platform</span> site requires
            providing an email address, so we may send you information related
            to the Site, including updates to these terms and the privacy
            policy, technical notices, security alerts, support messages, and
            administrative messages; and promotional offers and other news
            provided by the <span className="font-bold">Estajer Platform</span>{" "}
            site.
          </p>
          <p className="leading-relaxed">
            23.4. If you decide at any time not to receive any promotional
            messages from the Site, you can disable receipt of these messages by
            contacting us or clicking the unsubscribe link at the bottom of the
            email, but in this case, we do not guarantee your full enjoyment of
            our services.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">24. Term and Termination</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            24.1. These terms come into effect from the date of registering an
            account or your use of the Site and acknowledging your acceptance of
            them and will remain in effect until terminated by you or by the{" "}
            <span className="font-bold">Estajer Platform</span> site.
          </p>
          <p className="leading-relaxed">
            24.2. We reserve the right to immediately terminate your use of the{" "}
            <span className="font-bold">Estajer Platform</span> site if you
            breach the provisions of these terms and conditions, or if we
            believe, based on reasonable grounds, that you may breach the
            provisions of these terms and conditions, or if it becomes clear to
            us that you are misusing the{" "}
            <span className="font-bold">Estajer Platform</span> site or engaging
            in unacceptable behavior.
          </p>
          <p className="leading-relaxed">
            24.3. The provisions of these terms are automatically rescinded if
            your uses of the Site cause any legal problems for{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            or for third parties, or if the Site ceases operation, and in all
            cases, we have the right to take legal action against you under
            these terms if the reason for rescission is due to your breach of
            the provisions of these terms.
          </p>
          <p className="leading-relaxed">
            24.4. The <span className="font-bold">Estajer Platform</span> site
            has the right to stop offering Lessors' services to Lessees at any
            time without needing to justify the reason for this termination, and
            the Lessor accepts and acknowledges that they understand this right,
            and is not entitled to claim any compensation as a result.
          </p>
          <p className="leading-relaxed font-bold">
            24.5. Upon termination of these terms:
          </p>
          <ul className="list-disc list-inside pr-5 space-y-2">
            <li>
              All rights granted to you under these terms will be terminated.
            </li>
            <li>
              You will not be allowed to access your account or the Site, and
              you must immediately stop using the Site.
            </li>
            <li>
              You must pay the{" "}
              <span className="font-bold">Estajer Platform</span> site any
              amount due before termination, and all payment obligations due
              before termination will remain valid.
            </li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mb-6">25. Amendments</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            25.1.{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            has the right to review, amend, or update these terms from time to
            time at its sole discretion.
          </p>
          <p className="leading-relaxed">
            25.2. All amendments are effective immediately upon posting and
            apply to all uses of the Site thereafter.
          </p>
          <p className="leading-relaxed">
            25.3. Your continued use of the{" "}
            <span className="font-bold">Estajer Platform</span> site after
            updating these terms constitutes your agreement to these amendments
            and your legal acceptance of the latest version, and you agree that
            this version has replaced all previous versions.
          </p>
          <p className="leading-relaxed">
            25.4. We will not bear any responsibility for any change in the
            service or any suspension or termination of your access to or use of
            the service.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">
          26. Legal and Judicial Jurisdiction
        </h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            26.1. These terms and the privacy policy are subject to the laws of
            your country where you use the Site and complete the contract with
            the other party, and the judiciary of this country shall have
            jurisdiction to adjudicate any dispute that may arise from the
            interpretation or implementation of the provisions of these terms.
          </p>
          <p className="leading-relaxed">
            26.2. If any court decides that any of these terms are illegal,
            void, or unenforceable under applicable laws, this provision will be
            canceled and deleted from these terms and conditions, while the
            remaining provisions in the terms and conditions will remain in full
            force and effect.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">27. Assignment</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            27.1. Any services we provide under these terms and conditions are
            personal services to the user and cannot be transferred or assigned
            to any other person. We have the right to assign the terms and
            conditions to any other party without prior notice to you.
          </p>
          <p className="leading-relaxed">
            27.2. We may assign any of our rights or obligations, transfer them,
            and subcontract them to any third party at our discretion without
            any objection from the user provided that this third party agrees to
            be bound by these terms.
          </p>
          <p className="leading-relaxed">
            27.3. You are prohibited from assigning your obligations and rights
            under these terms, or entrusting the management of your account to
            another party except after obtaining written consent from us. Our
            failure or delay in enforcing any of these terms shall not
            constitute a waiver of our rights against you and shall not affect
            our right to demand their performance in the future.
          </p>
        </div>

        <h2 className="text-3xl font-bold mb-6">28. Other Provisions</h2>
        <div className="space-y-4 mb-8">
          <p className="leading-relaxed">
            28.1. <span className="underline font-bold">Relationship:</span> You
            agree that all provisions mentioned in these terms do not constitute
            or interpret the existence of any partnership, employment, or agency
            relationship between{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            and any user (Lessor or Lessee), and you do not have the right to
            bind us in any way.
          </p>
          <p className="leading-relaxed">
            28.2.{" "}
            <span className="underline font-bold">
              Transfer of Rights and Obligations:
            </span>{" "}
            Advanced Business Investment Holding Company has the right to
            transfer all its rights contained in these terms to third parties
            without any objection from the user provided that this third party
            agrees to be bound by these terms.
          </p>
          <p className="leading-relaxed">
            28.3. <span className="underline font-bold">Language:</span> These
            terms and conditions have been prepared originally in Arabic. In the
            event of translation into another foreign language, the Arabic
            version is correct and approved if it conflicts with any version in
            another language.
          </p>
          <p className="leading-relaxed">
            28.4. <span className="underline font-bold">Entire Agreement:</span>{" "}
            These terms and conditions and any other policies or operating rules
            referred to in these terms constitute the entire agreement between{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            on the one hand, and any person who visits or uses the Site on the
            other hand, and supersede any prior agreements or versions of these
            terms and conditions.
          </p>
          <p className="leading-relaxed">
            28.5. <span className="underline font-bold">Consent:</span> You
            acknowledge that you have read these terms and agree to be bound by
            their provisions. If you wish to ask any questions related to these
            terms, do not hesitate to contact us through the means available on
            the Site.
          </p>
        </div>
      </div>
    </>
  );
}

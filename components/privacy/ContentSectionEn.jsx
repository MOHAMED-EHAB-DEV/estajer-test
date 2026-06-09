import React from "react";
import PageTitle from "../shared/PageTitle";

const ContentSectionEn = ({ translate, lang }) => {
  const t1 = (text) => translate(`privacy.${text}`);
  return (
    <>
      <PageTitle lang={lang} title={t1("title")} description={t1("subtitle")} />
      <div className="max-w-screen-2xl mx-auto px-10 text-gray-800 font-sans text-lg">
        <h2 className="text-3xl font-bold mb-6 border-t-2 border-[#00000033]/20 pt-8">1. Introduction</h2>
        <p className="mb-4 leading-relaxed">
          1.1. We respect your right and that of all users and visitors to
          privacy and acknowledge the importance of protecting the data
          collected on the <br /> <span className="font-bold">Estajer.com</span>. We take
          this responsibility seriously, so please read this policy carefully to
          understand how we handle your personal data.
        </p>
        <p className="mb-4 leading-relaxed">
          1.2. This Privacy Policy ("<span className="font-bold">Policy</span>")
          has been prepared and drafted in a clear and easy-to-understand manner
          to help you understand the procedures <br /> and practices we follow when
          collecting any personal data, including but not limited to payment
          details and other data we collect from you or other <br /> sources or that
          you provide to us ("<span className="font-bold">Information</span>"),
          how we use and share it, the steps we take to secure this data, and
          your legal rights and obligations and <br /> all other practices.
        </p>
        <p className="mb-4 leading-relaxed">
          1.3. By agreeing to our use of cookies in accordance with the terms of
          this policy when you first visit our website, you permit us to use
          cookies every time you <br /> visit our website.
        </p>

        <h2 className="text-3xl font-bold  mb-6">
          2. Scope of the Policy
        </h2>
        <p className="mb-4 leading-relaxed">
          2.1.{" "}
          <span className="font-bold">
            Advanced Business Investment Holding Company
          </span>{" "}
          is the operator, controller, and responsible entity for the privacy
          policy of <span className="font-bold">Estajer.com</span>.
        </p>
        <p className="mb-4 leading-relaxed">
          2.2. This policy applies to all your uses of{" "}
          <span className="font-bold">Estajer.com</span>, including the
          information, data, services, tools, all pages, and other activities we <br/>
          offer on or through the site or when you interact with us in any other
          way. This policy does not apply to any third-party sites,
          applications, or <br /> services linked to our site.
        </p>
        <p className="mb-4 leading-relaxed">
          2.3. The following terms shall have the meanings ascribed to them:
        </p>
        <ul className="list-disc list-inside pl-5 mb-4 space-y-3">
          <li className="leading-relaxed">
            "<span className="font-bold">We</span>," "
            <span className="font-bold">Our</span>," "
            <span className="font-bold">Us</span>," or similar: refers to{" "}
            <span className="font-bold">Estajer.com</span>, owned by{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>
            .
          </li>
          <li className="leading-relaxed">
            "<span className="font-bold">User</span>," "
            <span className="font-bold">You</span>," or similar: refers to you
            as an individual or legal entity, as the case may be.
          </li>
          <li className="leading-relaxed">
            "<span className="font-bold">Personal Information</span>": refers to
            all information and data that identifies a specific individual or
            can be identified, whether directly or indirectly, <br /> which is
            collected from the user, provided by them, or collected from the
            devices they use to connect to the website <br /> or related to visiting and
            using the website.
          </li>
          <li className="leading-relaxed">
            "<span className="font-bold">Other Information</span>": refers to
            information that does not specifically reveal the user's identity or
            does not directly relate to an individual, such as usage data   <br /> or
            geographic location.
          </li>
          <li className="leading-relaxed">
            "<span className="font-bold">Processing</span>": refers to an
            operation performed on personal information, whether by automated
            means or otherwise.
          </li>
        </ul>

        <h2 className="text-3xl font-bold mb-6">
          3. Collection of Personal Information
        </h2>
        <p className="mb-4 leading-relaxed">
          3.1. We collect different types of personal information on{" "}
          <span className="font-bold">Estajer.com</span>; this includes:
        </p>
        <ul className="list-disc list-inside pl-5 mb-4 space-y-3">
          <li className="leading-relaxed">
            Information you provide by filling out forms on the site, including
            data for registering an account to use the site (such as name and
            email) <br/>  and other shared registrations (e.g., logging in via social
            media sites) or subscribing to our services, or posting an ad for
            goods or requesting to rent goods.
          </li>
          <li className="leading-relaxed">
            Information you enter when creating a profile on our site – for
            example, your name, profile pictures, gender, date of birth, marital
            status, and other information.
          </li>
          <li className="leading-relaxed">
            Information you enter while using the services on our site, such as
            information related to rental transactions, which includes your
            name, <br /> address, phone number, email address, type of item, rental
            duration, and credit card details, among other information.
          </li>
          <li className="leading-relaxed">
            Browser, device, and server information, such as information related
            to your internet-connected device including IP address to link your
            device to <br /> the internet, browser type and version, geographic
            location, internet service provider, device identifiers, ad
            identifier, operating system, <br /> device type, screen resolution,
            operating system name and version, device manufacturer and model,
            language, etc.
          </li>
          <li className="leading-relaxed">
            Information about your visits to and use of this site including the
            referral/exit source, length of visit, what you view on the page,
            and site navigation paths.
          </li>
          <li className="leading-relaxed">
            Information you enter to set up subscriptions to our emails and/or
            newsletters.
          </li>
          <li className="leading-relaxed">
            Information generated while using our website, including the timing,
            frequency, and circumstances under which you use the site.
          </li>
          <li className="leading-relaxed">
            Information contained in any communications you send to us by email
            or through our website, such as data you provide us,<br /> or that we may
            collect from you, when you inform us of any difficulty or problem
            you encounter when using the site.
          </li>
          <li className="leading-relaxed">
            Approximate geographic data: including information such as country,
            city, and geographic coordinates, calculated based on your IP
            address.
          </li>
          <li className="leading-relaxed">
            Information related to your general use of the internet by using
            technology that stores data on your device or accesses it, such as
            cookies, <br /> conversion tracking code, and web beacons (collectively
            referred to as "Cookies").
          </li>
          <li className="leading-relaxed">
            Information we collect from other sources for our partners such as
            public databases, marketing and advertising partners, and other
            third-party sources.
          </li>
          <li className="leading-relaxed">
            Any other personal information you send to us voluntarily.
          </li>
        </ul>
        <p className="mb-4 leading-relaxed">
          3.2. The personal data we collect about you depends on the specific
          activities carried out through your use of the platform and services. <br />
          If you provide any data related to other individuals to us or to our
          service providers and/or partners and/or affiliates in connection with
          the services,<br /> you represent that you have the authority to do so and
          permit us to use the data in accordance with this policy.
        </p>

        <h2 className="text-3xl font-bold mb-6">
          4. Use of Personal Information
        </h2>
        <p className="mb-4 leading-relaxed">
          4.1. We use your personal information that you provide to us via{" "}
          <span className="font-bold">Estajer.com</span> for the following
          purposes:
        </p>
        <ul className="list-disc list-inside pl-5 mb-4 space-y-3">
          <li className="leading-relaxed">
            Assisting you in creating and managing your account, and identifying
            you when using the site.
          </li>
          <li className="leading-relaxed">
            Administering our site and business on the internet.
          </li>
          <li className="leading-relaxed">
            Customizing our website to be more relevant to you.
          </li>
          <li className="leading-relaxed">
            Enabling you to use the services available on our site.
          </li>
          <li className="leading-relaxed">
            Providing and managing services through our website and facilitating
            access to them.
          </li>
          <li className="leading-relaxed">
            Sending statements, invoices, and payment notifications to you, and
            collecting payments from you.
          </li>
          <li className="leading-relaxed">
            Ensuring that content on the site is presented in the most effective
            manner for you and for the device you use.
          </li>
          <li className="leading-relaxed">
            Sending you email newsletters, marketing communications relating to
            our business or the businesses of third parties which we <br /> think may
            be of interest to you, or if you have specifically agreed to this,
            by email or similar technology (you can inform us at any time if you
            no longer require these marketing communications).
          </li>
          <li className="leading-relaxed">
            For statistical, research, analytical, marketing, promotional, and
            survey purposes.
          </li>
          <li className="leading-relaxed">
            Dealing with inquiries and complaints made by or about you relating
            to our site.
          </li>
          <li className="leading-relaxed">
            Protecting our site from fraud and keeping it secure.
          </li>
          <li className="leading-relaxed">
            Fulfilling our obligations arising from any contracts entered into
            between you and any other entity using the platform, or between you
            and us.
          </li>
          <li className="leading-relaxed">
            Verifying compliance with the terms and conditions governing the use
            of our website (including monitoring private messages sent <br /> through
            our website's private messaging service).
          </li>
          <li className="leading-relaxed">
            Other uses after obtaining your consent for other purposes.
          </li>
        </ul>
        <p className="mb-4 leading-relaxed">
          4.2. If you submit personal information for publication on{" "}
          <span className="font-bold">Estajer.com</span>, we will publish and
          otherwise use that information in accordance with the license you
          grant to us.
        </p>
        <p className="mb-4 leading-relaxed">
          4.3. Your privacy settings can be used to limit the publication of
          your information on <span className="font-bold">Estajer.com</span> and
          can be adjusted using privacy controls on the site.
        </p>
        <p className="mb-4 leading-relaxed">
          4.4. We will not, without your express consent, supply your personal
          information to any third party for their or any other third party's
          direct marketing.
        </p>

        <h2 className="text-3xl font-bold mb-6">
          5. Sharing Personal Information
        </h2>
        <p className="mb-4 leading-relaxed">
          5.1. We do not sell or share your personal information except, in
          limited cases. If necessary to achieve the purposes described in this
          policy, <br /> we may share your personal information in the following
          situations:
        </p>
        <ul className="list-disc list-inside pl-5 mb-4 space-y-3">
          <li className="leading-relaxed">
            Sharing information with employees of{" "}
            <span className="font-bold">
              Advanced Business Investment Holding Company
            </span>{" "}
            and all its branches to the extent reasonably necessary <br /> for the
            purposes set out in this policy.
          </li>
          <li className="leading-relaxed">
            Sharing information with other parties to process certain data,
            perform tasks and functions, and provide us with services such as
            telecommunications  <br />and information technology providers,
            advertising, and electronic communication.
          </li>
          <li className="leading-relaxed">
            Sharing renters' data with registered lessors on{" "}
            <span className="font-bold">Estajer.com</span>, and we may share
            your data with electronic payment gateways to authenticate the
            electronic payment <br /> process you make through us, secure it, and
            process refunds to you.
          </li>
          <li className="leading-relaxed">
            Sharing information with public and governmental authorities to the
            extent we are required to do so to comply with laws and respond to
            requests <br /> and legal procedures regarding any ongoing or prospective
            legal proceedings or in order to establish, exercise or defend our
            legal rights <br /> (including providing information to others for the
            purposes of fraud prevention and reducing credit risk).
          </li>
          <li className="leading-relaxed">
            Sharing information to protect you or our employees, agents, or
            clients from suspected fraud, illegal activities, or any situations
            involving potential threats <br /> to the safety of any person.
          </li>
          <li className="leading-relaxed">
            Sharing information with any person who we reasonably believe may
            apply to a court or other competent authority for disclosure of that
            personal information where, <br /> in our reasonable opinion, such court or
            authority would be reasonably likely to order disclosure of that
            personal information. Except as provided in <br /> this policy, we will not
            provide your personal information to third parties.
          </li>
        </ul>
        <p className="mb-4 leading-relaxed">
          5.2. We may share personal data when we undertake a business
          transaction or negotiate a business transaction, such as a merger,
          acquisition, <br /> reorganization, sale of assets, joint venture,
          assignment, transfer, or any similar disposition of all or part of our
          business or assets.
        </p>
        <p className="mb-4 leading-relaxed">
          5.3. You grant us the right to allow our employees and service
          providers to handle your personal data within the scope of providing
          services. <br /> Please note that the use of your personal data by any third
          parties will be subject to their own privacy policies; we recommend<br />
          that you carefully review the privacy policies of third parties.
        </p>

        <h2 className="text-3xl font-bold mb-6">
          6. International Transfer of Personal Information
        </h2>
        <p className="mb-4 leading-relaxed">
          6.1. Your data, including personal information, may be transferred to
          and maintained in any of the countries in which we operate to enable
          us to use  <br /> the information in accordance with this policy, and kept
          outside your state, province, country, or other governmental
          jurisdiction where the data protection laws <br /> may differ from those from
          your jurisdiction.
        </p>
        <p className="mb-4 leading-relaxed">
          6.2. We cannot prevent the use or misuse by others of personal
          information that you publish on our website  or submit for publication
          on our website <br /> and which is available via the internet throughout the
          world.
        </p>
        <p className="mb-4 leading-relaxed">
          6.3. You expressly agree to the transfers of personal information
          described in this section upon agreeing to the privacy policy of{" "}
          <span className="font-bold">Estajer.com</span>.
        </p>

        <h2 className="text-3xl font-bold mb-6">
          7. Retention of Personal Information
        </h2>
        <p className="mb-4 leading-relaxed">
          7.1. This section sets out our data retention policies and procedures,
          which are designed to help ensure that we comply with our legal
          obligations <br /> regarding the retention and deletion of personal
          information.
        </p>
        <p className="mb-4 leading-relaxed">
          7.2.{" "}
          <span className="font-bold">
            Advanced Business Investment Holding Company
          </span>{" "}
          does not retain personal information that we process on{" "}
          <span className="font-bold">Estajer.com</span> for any purpose <br /> or
          purposes for longer than is necessary for that purpose or those
          purposes.
        </p>
        <p className="mb-4 leading-relaxed">
          7.3.{" "}
          <span className="font-bold">
            Advanced Business Investment Holding Company
          </span>{" "}
          retains data on <span className="font-bold">Estajer.com</span> for the
          period necessary to achieve the purposes of collection. <br /> Please be
          aware that in some cases, laws may require or permit us to retain such
          data for a longer period. We also retain your account-related data in
          electronic records <br /> as long as you remain a user of{" "}
          <span className="font-bold">Estajer.com</span>, or for internal
          analysis purposes, to enhance security, or to improve the
          functionality of our services, and enforce our legal policies.
        </p>
        <p className="mb-4 leading-relaxed">
          7.4.{" "}
          <span className="font-bold">
            Advanced Business Investment Holding Company
          </span>{" "}
          retains comments added by users to services on{" "}
          <span className="font-bold">Estajer.com</span> indefinitely.
        </p>
        <p className="mb-4 leading-relaxed">
          7.5. Notwithstanding the other provisions of this section, we will
          retain information that is linked to an account in electronic records
          (including electronic documents) <br /> when you remain a user of{" "}
          <span className="font-bold">Estajer.com</span> for the following:
        </p>
        <ul className="list-disc list-inside pl-5 mb-4 space-y-3">
          <li className="leading-relaxed">
            For internal analysis purposes, or to enhance security or improve
            the functionality of our services.
          </li>
          <li className="leading-relaxed">
            To the extent that we are required to do so by law.
          </li>
          <li className="leading-relaxed">
            If we believe that the documents may be relevant to any ongoing or
            prospective legal proceedings, or to enforce our legal policies.
          </li>
          <li className="leading-relaxed">
            In order to establish, exercise or defend our legal rights
            (including providing information to others for the purposes of fraud
            prevention and reducing credit risk).
          </li>
        </ul>

        <h2 className="text-3xl font-bold mb-6">
          8. Security of Personal Information
        </h2>
        <p className="mb-4 leading-relaxed">
          8.1. The security of your data is important to us, so we strive to
          maintain all user data and prevent access to it in violation of this
          policy. <br /> We also work to protect this data by taking reasonable
          technical and organizational precautions to prevent the loss, misuse,
          or alteration of your personal information. <br /> Unfortunately, the
          transmission of data over the internet is not completely secure, and
          although we will do our best to protect your data, <br /> we cannot guarantee
          the security of data transmitted to{" "}
          <span className="font-bold">Estajer.com</span>; you bear the
          consequences of any data transmission risks.
        </p>
        <p className="mb-4 leading-relaxed">
          8.2. We undertake to store all personal information you provide on our
          secure servers (password- and firewall-protected).
        </p>
        <p className="mb-4 leading-relaxed">
          8.3. All electronic financial transactions entered into through{" "}
          <span className="font-bold">Estajer.com</span> are protected by
          encryption technology.
        </p>
        <p className="mb-4 leading-relaxed">
          8.4. You acknowledge and understand that the transmission of
          information over the internet is inherently insecure, and we cannot
          guarantee <br /> the security of data sent over the internet.
        </p>
        <p className="mb-4 leading-relaxed">
          8.5. You are responsible for keeping the password you use for
          accessing <span className="font-bold">Estajer.com</span> confidential;
          we will not ask you for your password (except when you log in to our
          site).
        </p>

        <h2 className="text-3xl font-bold mb-6">
          9. Action Taken in Case of Data Breach?
        </h2>
        <p className="mb-4 leading-relaxed">
          In the event we become aware that the security of{" "}
          <span className="font-bold">Estajer.com</span> has been breached or
          users' personal information has been disclosed to third parties <br /> as a
          result of external activity, including, but not limited to, electronic
          security attacks or fraud, we reserve the right to take appropriate <br />
          measures, including investigation, reporting, and notifying <br /> and
          cooperating with responsible legal authorities.
        </p>

        <h2 className="text-3xl font-bold mb-6">
          10. Updating Personal Information
        </h2>
        <p className="mb-4 leading-relaxed">
          Please let us know if the personal information that we hold about you
          needs to be corrected or updated.
        </p>

        <h2 className="text-3xl font-bold mb-6">
          11. Authorization to Make Certain Data Available
        </h2>
        <p className="mb-4 leading-relaxed">
          The user knows and agrees that there is some data that appears to all
          users and visitors of <span className="font-bold">Estajer.com</span>. <br />
          Consequently, the user authorizes us to make their name, profile
          picture, and any data they voluntarily provide available to all users
          and visitors of the site, <br /> and it will not be customized for specific
          individuals.
        </p>

        <h2 className="text-3xl font-bold mb-6">12. Your Rights</h2>
        <p className="mb-4 leading-relaxed">
          12.1. You may request us to provide you with any personal information
          we hold about you; provision <br /> of such information is subject to
          providing appropriate proof of your identity.
        </p>
        <p className="mb-4 leading-relaxed">
          12.2. We may withhold personal information that you request to the
          extent permitted by law.
        </p>
        <p className="mb-4 leading-relaxed">
          12.3. You may instruct us at any time not to process your personal
          information for marketing purposes. <br /> In practice, you will usually
          either expressly agree in advance to our use of your personal
          information for marketing purposes, <br /> or we will provide you with an
          opportunity to opt-out of the use of your personal information for
          marketing purposes.
        </p>

        <h2 className="text-3xl font-bold mb-6">
          13. Managing Your Privacy
        </h2>
        <p className="mb-4 leading-relaxed">
          13.1. You play a significant role in protecting your personal
          information on <span className="font-bold">Estajer.com</span>, where
          you can do the following:
        </p>
        <ul className="list-disc list-inside pl-5 mb-4 space-y-3">
          <li className="leading-relaxed">
            Control or modify your data through your account – if available.
          </li>
          <li className="leading-relaxed">
            Manage cookies and other tracking technologies or control them.
          </li>
          <li className="leading-relaxed">
            Not disclosing your account details to any other person.
          </li>
          <li className="leading-relaxed">
            Always logging out at the end of your session, especially if you are
            using someone else's device or are in public internet places.
          </li>
        </ul>
        <p className="mb-4 leading-relaxed">
          13.2. <span className="font-bold">Estajer.com</span> is not
          responsible for your failure or negligence in maintaining the
          confidentiality of your personal information <br /> or for actions resulting
          from third-party access to your information  and personal data.
        </p>

        <h2 className="text-3xl font-bold mb-6">14. Third-Party Sites</h2>
        <p className="mb-4 leading-relaxed">
          14.1. <span className="font-bold">Estajer.com</span> may contain
          hyperlinks that direct the user or visitor to external websites
          belonging to third parties. <br /> Please be aware that we have no control
          over the privacy policies and practices of third parties, and we are
          not responsible for them.
        </p>
        <p className="mb-4 leading-relaxed">
          14.2. In addition, we are not responsible for the collection, use, or
          disclosure of data, or the security policies or practices of other
          platforms, <br /> such as Twitter, Instagram, or any social media platform
          provider, operating system provider, wireless service provider, or
          device manufacturer. <br /> We recommend that you review the privacy policies
          of these institutions and sites carefully to understand your rights
          and obligations better.
        </p>

        <h2 className="text-3xl font-bold mb-6">15. Cookies</h2>
        <p className="mb-4 leading-relaxed">
          15.1. A cookie is a file containing an identifier (a string of letters
          and numbers) that is sent by a web server to a web browser <br /> and is
          stored by the browser. The identifier is then sent back to the server
          each time the browser requests a page from the server.
        </p>
        <p className="mb-4 leading-relaxed">
          15.2. We use cookies and similar technologies to improve your
          experience, provide you with a personalized experience, enhance
          security, <br /> facilitate navigation, display material more efficiently,
          recognize your device when you access services, understand how you use
          them, <br /> measure the effectiveness of advertisements, and track and
          target your interests.
        </p>
        <p className="mb-4 leading-relaxed">
          15.3. The following are the names of the cookies we use on{" "}
          <span className="font-bold">Estajer.com</span> and the purposes for
          which they are used:
        </p>
        <ul className="list-disc list-inside pl-5 mb-4 space-y-3">
          <li className="leading-relaxed">
            <span className="font-semibold">Essential Cookies:</span> Allow you
            to navigate the site freely and use basic features such as secure
            and private areas.
          </li>
          <li className="leading-relaxed">
            <span className="font-semibold">Analytical Cookies:</span> We use
            these files to recognize the computer when a user visits the
            website, recognize visitors, track users as they navigate the site, <br />
            improve the site's usability, analyze site usage by tracking visitor
            movements, pages visited, provide statistics about site usage, <br />
            identify and improve site performance errors and issues.
          </li>
          <li className="leading-relaxed">
            <span className="font-semibold">Necessary Cookies:</span> Used to
            operate the site, identify security risks and prevent them, and
            store your session information.
          </li>
          <li className="leading-relaxed">
            <span className="font-semibold">Security Cookies:</span> These files
            are used to collect information about how you use the site, monitor
            and improve the performance of the site and our services.
          </li>
          <li className="leading-relaxed">
            <span className="font-semibold">Advertising Cookies:</span> Used to
            deliver advertisements and make them more relevant and valuable to
            you, and to track the efficiency of our advertising campaigns.
          </li>
        </ul>
        <p className="mb-4 leading-relaxed">
          15.4. Most browsers allow you to refuse or accept cookies by changing
          the settings in your browser.  <br />Blocking all cookies will have a
          negative impact upon the usability of many websites. If you block
          cookies, you will not be able to use all the features on our website.
        </p>

        <h2 className="text-3xl font-bold mb-6">16. Amendments</h2>
        <p className="mb-4 leading-relaxed">
          16.1.{" "}
          <span className="font-bold">
            Advanced Business Investment Holding Company
          </span>{" "}
          reserves the right to make amendments, changes, <br /> or updates to this
          policy at any time as necessary and appropriate to include prevailing
          practices on <span className="font-bold">Estajer.com</span>, or
          regulatory requirements or other purposes.
        </p>
        <p className="mb-4 leading-relaxed">
          16.2. All changes are effective immediately upon posting on this page,
          and your use of the services after the updated version of the privacy
          policy <br /> is posted constitutes your agreement to all such changes.
        </p>
        <p className="mb-4 leading-relaxed">
          16.3. You should check this page from time to time to ensure you
          understand any changes to this policy. We may notify you of changes to
          this policy by email.
        </p>

        <h2 className="text-3xl font-bold mb-6">17. Declarations</h2>
        <p className="mb-4 leading-relaxed">
          17.1. You acknowledge that the information and personal data you
          provide on or through <span className="font-bold">Estajer.com</span>{" "}
          are your responsibility. <br /> If you provide us with any data related to a
          person other than the account holder, you are responsible to us, to
          the competent authorities, and to the affected person, and you
          undertake to pay all appropriate compensation.
        </p>
        <p className="mb-4 leading-relaxed">
          17.2. You acknowledge and agree to read this policy and abide by all
          its terms and conditions. <br /> Your continued use of the site or services
          is considered your agreement to comply with this policy.
        </p>

        <h2 className="text-3xl font-bold mb-6">18. Contact Us</h2>
        <p className="mb-4 leading-relaxed">
          If you have any questions or comments about this policy, please do not
          hesitate to contact us at:
        </p>
        <p className="mb-4 leading-relaxed px-10 flex gap-3">
        <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.89777 11.1309L4.99902 10.7259C5.13317 10.3326 5.3105 9.95525 5.52777 9.60093C6.02175 8.77613 6.72911 8.09986 7.57527 7.64343L13.4815 4.44843C14.2625 4.0328 15.1337 3.81543 16.0184 3.81543C16.9031 3.81543 17.7743 4.0328 18.5553 4.44843L24.4615 7.64343C25.3077 8.09986 26.015 8.77613 26.509 9.60093C26.729 9.95222 26.9029 10.3303 27.0265 10.7259V10.8834C27.1525 11.3339 27.2169 11.7994 27.2178 12.2672V20.8397C27.2148 22.256 26.6508 23.6135 25.6493 24.615C24.6478 25.6165 23.2904 26.1805 21.874 26.1834H10.0615C9.35977 26.1834 8.66489 26.0452 8.01656 25.7767C7.36822 25.5081 6.77913 25.1145 6.28292 24.6183C5.78671 24.1221 5.39309 23.533 5.12454 22.8847C4.85599 22.2363 4.71777 21.5414 4.71777 20.8397V12.2559C4.73793 11.8756 4.79827 11.4985 4.89777 11.1309ZM14.1903 14.8997C14.7479 15.2152 15.3777 15.381 16.0184 15.381C16.6591 15.381 17.2889 15.2152 17.8465 14.8997L25.1928 10.6472C25.159 10.5609 25.1178 10.4784 25.069 10.3997C24.7295 9.83485 24.2436 9.37229 23.6628 9.06093L17.7565 5.86593C17.2251 5.57638 16.6292 5.42548 16.024 5.42718C15.4153 5.42552 14.8158 5.57636 14.2803 5.86593L8.37402 9.06093C7.67906 9.43664 7.12597 10.0292 6.79902 10.7484L14.1903 14.8997Z" stroke="blue"/>
</svg>
          <a
            href="mailto:service@estajer.com"
            className="text-black font-semibold"
          >
            service@estajer.com
          </a>
        </p>
      </div>
    </>
  );
};

export default ContentSectionEn;

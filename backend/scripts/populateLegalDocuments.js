import mongoose from 'mongoose';
import LegalDocument from '../models/LegalDocument.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Professional Privacy Policy Template
const privacyPolicyContent = `<h1>Privacy Policy</h1>

<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

<h2>1. Introduction</h2>
<p>ScanBit ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital menu platform and services.</p>

<h2>2. Information We Collect</h2>

<h3>2.1 Information You Provide</h3>
<ul>
  <li><strong>Account Information:</strong> Name, email address, phone number, business information</li>
  <li><strong>Business Data:</strong> Restaurant name, address, menu items, prices, images</li>
  <li><strong>Payment Information:</strong> Billing details, payment method (processed securely through third-party providers)</li>
  <li><strong>Communication Data:</strong> Messages, support tickets, feedback</li>
</ul>

<h3>2.2 Automatically Collected Information</h3>
<ul>
  <li><strong>Usage Data:</strong> QR code scans, menu views, interaction patterns</li>
  <li><strong>Device Information:</strong> Device type, browser, IP address, operating system</li>
  <li><strong>Location Data:</strong> General location based on IP address (if applicable)</li>
  <li><strong>Cookies and Tracking:</strong> Cookies, web beacons, and similar tracking technologies</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>We use the collected information for the following purposes:</p>
<ul>
  <li>To provide, maintain, and improve our services</li>
  <li>To process transactions and manage subscriptions</li>
  <li>To send administrative information and updates</li>
  <li>To respond to your inquiries and provide customer support</li>
  <li>To analyze usage patterns and improve user experience</li>
  <li>To detect, prevent, and address technical issues</li>
  <li>To comply with legal obligations</li>
  <li>To protect our rights and prevent fraud</li>
</ul>

<h2>4. Information Sharing and Disclosure</h2>
<p>We do not sell your personal information. We may share your information in the following circumstances:</p>

<h3>4.1 Service Providers</h3>
<p>We may share information with third-party service providers who perform services on our behalf, such as:</p>
<ul>
  <li>Payment processing</li>
  <li>Cloud hosting and storage</li>
  <li>Analytics and data analysis</li>
  <li>Customer support services</li>
</ul>

<h3>4.2 Legal Requirements</h3>
<p>We may disclose your information if required by law or in response to valid requests by public authorities.</p>

<h3>4.3 Business Transfers</h3>
<p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>

<h2>5. Data Security</h2>
<p>We implement appropriate technical and organizational security measures to protect your information, including:</p>
<ul>
  <li>SSL/TLS encryption for data in transit</li>
  <li>Encrypted storage for sensitive data</li>
  <li>Regular security assessments and updates</li>
  <li>Access controls and authentication</li>
  <li>Regular backups and disaster recovery procedures</li>
</ul>
<p>However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>

<h2>6. Your Rights and Choices</h2>
<p>Depending on your location, you may have the following rights regarding your personal information:</p>
<ul>
  <li><strong>Access:</strong> Request access to your personal information</li>
  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
  <li><strong>Portability:</strong> Request transfer of your data</li>
  <li><strong>Objection:</strong> Object to processing of your information</li>
  <li><strong>Restriction:</strong> Request restriction of processing</li>
  <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
</ul>
<p>To exercise these rights, please contact us using the information provided in the "Contact Us" section.</p>

<h2>7. Cookies and Tracking Technologies</h2>
<p>We use cookies and similar tracking technologies to:</p>
<ul>
  <li>Remember your preferences and settings</li>
  <li>Analyze website traffic and usage patterns</li>
  <li>Provide personalized content and advertisements</li>
  <li>Improve our services and user experience</li>
</ul>
<p>You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our services.</p>

<h2>8. Data Retention</h2>
<p>We retain your personal information for as long as necessary to:</p>
<ul>
  <li>Provide our services to you</li>
  <li>Comply with legal obligations</li>
  <li>Resolve disputes and enforce agreements</li>
  <li>Maintain business records</li>
</ul>
<p>When we no longer need your information, we will securely delete or anonymize it.</p>

<h2>9. Children's Privacy</h2>
<p>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.</p>

<h2>10. International Data Transfers</h2>
<p>Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We take appropriate measures to ensure your information receives adequate protection.</p>

<h2>11. Third-Party Links</h2>
<p>Our services may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.</p>

<h2>12. Changes to This Privacy Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
<ul>
  <li>Posting the new Privacy Policy on this page</li>
  <li>Updating the "Last Updated" date</li>
  <li>Sending you an email notification (if applicable)</li>
  <li>Displaying a prominent notice on our website</li>
</ul>
<p>Your continued use of our services after changes become effective constitutes acceptance of the updated Privacy Policy.</p>

<h2>13. Contact Us</h2>
<p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
<ul>
  <li><strong>Email:</strong> privacy@scanbit.com</li>
  <li><strong>Address:</strong> [Your Company Address]</li>
  <li><strong>Phone:</strong> [Your Phone Number]</li>
</ul>

<h2>14. Compliance</h2>
<p>This Privacy Policy is designed to comply with:</p>
<ul>
  <li>General Data Protection Regulation (GDPR)</li>
  <li>California Consumer Privacy Act (CCPA)</li>
  <li>Other applicable data protection laws</li>
</ul>

<p><strong>By using our services, you acknowledge that you have read and understood this Privacy Policy.</strong></p>`;

// Professional Terms & Conditions Template
const termsConditionsContent = `<h1>Terms and Conditions</h1>

<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

<h2>1. Agreement to Terms</h2>
<p>By accessing or using ScanBit's digital menu platform and services ("Services"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not access or use our Services.</p>

<h2>2. Definitions</h2>
<ul>
  <li><strong>"Service" or "Services"</strong> refers to ScanBit's digital menu platform, website, mobile applications, and related services.</li>
  <li><strong>"User" or "You"</strong> refers to any individual or entity that accesses or uses our Services.</li>
  <li><strong>"Account"</strong> refers to your registered account with ScanBit.</li>
  <li><strong>"Content"</strong> refers to any text, images, data, or other materials uploaded or created through our Services.</li>
</ul>

<h2>3. Account Registration</h2>
<h3>3.1 Account Requirements</h3>
<ul>
  <li>You must be at least 18 years old to create an account</li>
  <li>You must provide accurate, current, and complete information</li>
  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
  <li>You are responsible for all activities that occur under your account</li>
  <li>You must notify us immediately of any unauthorized use</li>
</ul>

<h3>3.2 Account Termination</h3>
<p>We reserve the right to suspend or terminate your account at any time for:</p>
<ul>
  <li>Violation of these Terms</li>
  <li>Fraudulent or illegal activity</li>
  <li>Non-payment of fees</li>
  <li>Any other reason we deem necessary</li>
</ul>

<h2>4. Use of Services</h2>
<h3>4.1 Permitted Use</h3>
<p>You may use our Services for lawful business purposes in accordance with these Terms. You agree to:</p>
<ul>
  <li>Use the Services only for their intended purpose</li>
  <li>Comply with all applicable laws and regulations</li>
  <li>Respect the rights of others</li>
  <li>Maintain the security of your account</li>
</ul>

<h3>4.2 Prohibited Activities</h3>
<p>You agree not to:</p>
<ul>
  <li>Use the Services for any illegal or unauthorized purpose</li>
  <li>Violate any laws or regulations</li>
  <li>Infringe upon intellectual property rights</li>
  <li>Upload malicious code, viruses, or harmful content</li>
  <li>Attempt to gain unauthorized access to our systems</li>
  <li>Interfere with or disrupt the Services</li>
  <li>Use automated systems to access the Services without permission</li>
  <li>Impersonate any person or entity</li>
  <li>Collect or harvest information about other users</li>
  <li>Use the Services to transmit spam or unsolicited communications</li>
</ul>

<h2>5. Content and Intellectual Property</h2>
<h3>5.1 Your Content</h3>
<p>You retain ownership of all content you upload or create through our Services. By using our Services, you grant us a worldwide, non-exclusive, royalty-free license to:</p>
<ul>
  <li>Use, store, and display your content to provide the Services</li>
  <li>Reproduce and modify your content as necessary to provide the Services</li>
  <li>Use your content for support, maintenance, and improvement of the Services</li>
</ul>

<h3>5.2 Our Intellectual Property</h3>
<p>All rights, title, and interest in and to the Services, including all intellectual property rights, remain with ScanBit and our licensors. You may not:</p>
<ul>
  <li>Copy, modify, or create derivative works of the Services</li>
  <li>Reverse engineer, decompile, or disassemble the Services</li>
  <li>Remove or alter any copyright, trademark, or proprietary notices</li>
  <li>Use our trademarks or logos without permission</li>
</ul>

<h2>6. Payment Terms</h2>
<h3>6.1 Subscription Fees</h3>
<p>Our Services are offered on a subscription basis. By subscribing, you agree to:</p>
<ul>
  <li>Pay all fees associated with your selected plan</li>
  <li>Pay fees in advance for the billing period</li>
  <li>Authorize automatic renewal of your subscription</li>
</ul>

<h3>6.2 Billing</h3>
<ul>
  <li>Fees are charged at the beginning of each billing cycle</li>
  <li>All fees are non-refundable except as required by law</li>
  <li>We reserve the right to change our pricing with 30 days' notice</li>
  <li>Failure to pay may result in suspension or termination of Services</li>
</ul>

<h3>6.3 Refunds</h3>
<p>Refunds are provided in accordance with our Refund Policy. We offer a 30-day money-back guarantee for new subscriptions.</p>

<h2>7. Service Availability</h2>
<p>We strive to provide reliable Services but do not guarantee:</p>
<ul>
  <li>Uninterrupted or error-free operation</li>
  <li>That the Services will meet your specific requirements</li>
  <li>That defects will be corrected</li>
  <li>That the Services are free from viruses or harmful components</li>
</ul>
<p>We reserve the right to modify, suspend, or discontinue any part of the Services at any time.</p>

<h2>8. Limitation of Liability</h2>
<p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
<ul>
  <li>SCANBIT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
  <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRIOR TO THE CLAIM</li>
  <li>WE ARE NOT LIABLE FOR ANY LOSS OF DATA, PROFITS, OR BUSINESS OPPORTUNITIES</li>
</ul>

<h2>9. Indemnification</h2>
<p>You agree to indemnify, defend, and hold harmless ScanBit, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:</p>
<ul>
  <li>Your use of the Services</li>
  <li>Your violation of these Terms</li>
  <li>Your violation of any rights of another party</li>
  <li>Your content or conduct</li>
</ul>

<h2>10. Disclaimers</h2>
<p>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
<ul>
  <li>IMPLIED WARRANTIES OF MERCHANTABILITY</li>
  <li>FITNESS FOR A PARTICULAR PURPOSE</li>
  <li>NON-INFRINGEMENT</li>
  <li>ACCURACY OR RELIABILITY</li>
</ul>

<h2>11. Dispute Resolution</h2>
<h3>11.1 Governing Law</h3>
<p>These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>

<h3>11.2 Dispute Resolution Process</h3>
<p>In the event of a dispute:</p>
<ol>
  <li>Contact us to attempt to resolve the dispute amicably</li>
  <li>If unresolved, disputes shall be resolved through binding arbitration</li>
  <li>Arbitration shall be conducted in accordance with [Arbitration Rules]</li>
</ol>

<h2>12. Modifications to Terms</h2>
<p>We reserve the right to modify these Terms at any time. We will notify you of material changes by:</p>
<ul>
  <li>Posting the updated Terms on our website</li>
  <li>Updating the "Last Updated" date</li>
  <li>Sending you an email notification (if applicable)</li>
</ul>
<p>Your continued use of the Services after changes become effective constitutes acceptance of the updated Terms.</p>

<h2>13. Termination</h2>
<h3>13.1 Termination by You</h3>
<p>You may terminate your account at any time by:</p>
<ul>
  <li>Contacting our support team</li>
  <li>Using the account deletion feature in your settings</li>
</ul>

<h3>13.2 Termination by Us</h3>
<p>We may terminate or suspend your account immediately if:</p>
<ul>
  <li>You violate these Terms</li>
  <li>You engage in fraudulent or illegal activity</li>
  <li>You fail to pay required fees</li>
  <li>We discontinue the Services</li>
</ul>

<h3>13.3 Effect of Termination</h3>
<p>Upon termination:</p>
<ul>
  <li>Your right to use the Services will immediately cease</li>
  <li>We may delete your account and content</li>
  <li>You remain responsible for all fees incurred before termination</li>
  <li>Provisions that by their nature should survive will remain in effect</li>
</ul>

<h2>14. Miscellaneous</h2>
<h3>14.1 Entire Agreement</h3>
<p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and ScanBit regarding the Services.</p>

<h3>14.2 Severability</h3>
<p>If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.</p>

<h3>14.3 Waiver</h3>
<p>Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.</p>

<h3>14.4 Assignment</h3>
<p>You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms without restriction.</p>

<h2>15. Contact Information</h2>
<p>If you have questions about these Terms, please contact us:</p>
<ul>
  <li><strong>Email:</strong> legal@scanbit.com</li>
  <li><strong>Address:</strong> [Your Company Address]</li>
  <li><strong>Phone:</strong> [Your Phone Number]</li>
</ul>

<p><strong>By using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</strong></p>`;

// Default legal documents
const defaultDocuments = [
  {
    title: "Privacy Policy",
    type: "privacy-policy",
    content: privacyPolicyContent,
    shortDescription: "Our commitment to protecting your privacy and personal information",
    version: "1.0",
    isActive: true,
    isDefault: true,
    language: "en",
    requiresAcceptance: false,
    acceptanceRequiredFor: [],
  },
  {
    title: "Terms and Conditions",
    type: "terms-conditions",
    content: termsConditionsContent,
    shortDescription: "Terms governing your use of ScanBit services and platform",
    version: "1.0",
    isActive: true,
    isDefault: true,
    language: "en",
    requiresAcceptance: true,
    acceptanceRequiredFor: ["signup"],
  },
  {
    title: "Cookie Policy",
    type: "cookie-policy",
    content: `<h1>Cookie Policy</h1>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

<h2>1. What Are Cookies</h2>
<p>Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience and allow us to improve our services.</p>

<h2>2. How We Use Cookies</h2>
<p>We use cookies for:</p>
<ul>
  <li>Authentication and security</li>
  <li>Remembering your preferences</li>
  <li>Analyzing website traffic</li>
  <li>Improving user experience</li>
</ul>

<h2>3. Types of Cookies</h2>
<h3>3.1 Essential Cookies</h3>
<p>These cookies are necessary for the website to function properly. They cannot be disabled.</p>

<h3>3.2 Analytics Cookies</h3>
<p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>

<h3>3.3 Functional Cookies</h3>
<p>These cookies enable enhanced functionality and personalization, such as remembering your preferences.</p>

<h2>4. Managing Cookies</h2>
<p>You can control cookies through your browser settings. However, disabling cookies may affect website functionality.</p>

<h2>5. Third-Party Cookies</h2>
<p>We may use third-party services that set their own cookies. We do not control these cookies.</p>

<h2>6. Contact Us</h2>
<p>If you have questions about our use of cookies, please contact us at privacy@scanbit.com</p>`,
    shortDescription: "Information about how we use cookies on our website",
    version: "1.0",
    isActive: true,
    isDefault: true,
    language: "en",
    requiresAcceptance: false,
    acceptanceRequiredFor: [],
  },
];

// Function to populate legal documents
async function populateLegalDocuments() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {

      process.exit(1);
    }

    await mongoose.connect(mongoUri);

    // Get admin user (or create a system user for createdBy)
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {

    }

    const userId = adminUser ? adminUser._id : null;

    // Populate Legal Documents

    let docCount = 0;
    for (const docData of defaultDocuments) {
      // Check if document already exists
      const existingDoc = await LegalDocument.findOne({ 
        type: docData.type, 
        isDefault: true,
        language: docData.language 
      });
      if (!existingDoc) {
        const document = new LegalDocument({
          ...docData,
          slug: docData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          effectiveDate: new Date(),
          lastUpdated: new Date(),
          createdBy: userId
        });
        await document.save();
        docCount++;

      } else {

      }
    }


    process.exit(0);
  } catch (error) {

    process.exit(1);
  }
}

// Run the script
populateLegalDocuments();

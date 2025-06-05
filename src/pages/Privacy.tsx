

import SEO from "@/components/SEO";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-figuro-dark text-white">
      <SEO 
        title="Privacy Policy - Figuro"
        description="Learn how Figuro collects, uses, and protects your personal information when you use our AI-powered 3D figurine creation platform."
        canonicalUrl="/privacy"
      />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          <header className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-figuro-accent">Privacy Policy</h1>
            <p className="text-white/80 text-lg">Effective Date: January 1, 2025</p>
            <p className="text-white/80 mt-2">Last Updated: January 1, 2025</p>
          </header>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">1. Introduction</h2>
              <p className="text-white/90 leading-relaxed">
                Welcome to Figuro ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered 3D figurine creation platform, including our website, mobile applications, and related services (collectively, the "Service").
              </p>
              <p className="text-white/90 leading-relaxed mt-4">
                We are committed to protecting your privacy and ensuring you understand how your information is being used. By using our Service, you consent to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3 text-white">2.1 Personal Information</h3>
              <p className="text-white/90 leading-relaxed mb-4">
                We collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li>Register for an account (email address, display name, full name)</li>
                <li>Subscribe to our services</li>
                <li>Contact us for support</li>
                <li>Participate in surveys or promotional activities</li>
                <li>Upload profile pictures or avatars</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">2.2 Content and Creative Data</h3>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li><strong>Text Prompts:</strong> Descriptions you provide for AI-generated content</li>
                <li><strong>Images:</strong> Photos and images you upload for 3D conversion</li>
                <li><strong>Generated Content:</strong> 3D models, figurines, and other AI-generated content</li>
                <li><strong>Camera Data:</strong> Images captured through our camera feature</li>
                <li><strong>Creative Metadata:</strong> Art styles, generation settings, and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">2.3 Usage and Technical Data</h3>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Analytics:</strong> Pages visited, features used, time spent on platform</li>
                <li><strong>Performance Data:</strong> Generation times, error logs, system performance metrics</li>
                <li><strong>Session Data:</strong> Login times, authentication tokens, user preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">2.4 Payment Information</h3>
              <p className="text-white/90 leading-relaxed">
                Payment processing is handled by Stripe. We store subscription status, plan type, and billing history, but we do not store your complete payment card information on our servers. Stripe's privacy policy governs the collection and use of payment information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">3. How We Use Your Information</h2>
              
              <h3 className="text-xl font-semibold mb-3 text-white">3.1 Service Provision</h3>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li>Generate 3D models and figurines using AI technology</li>
                <li>Process and convert images to 3D models</li>
                <li>Provide personalized content recommendations</li>
                <li>Maintain your account and user preferences</li>
                <li>Enable sharing and gallery features</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">3.2 Communication and Support</h3>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li>Send service-related notifications and updates</li>
                <li>Provide customer support and technical assistance</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Notify you about new features and improvements</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">3.3 Platform Improvement</h3>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li>Analyze usage patterns to improve our AI models</li>
                <li>Enhance user experience and platform performance</li>
                <li>Develop new features and services</li>
                <li>Conduct research and analytics</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">3.4 Legal and Security</h3>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li>Comply with legal obligations and regulations</li>
                <li>Protect against fraud and unauthorized access</li>
                <li>Enforce our Terms of Service</li>
                <li>Maintain security and prevent misuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold mb-3 text-white">4.1 Third-Party Service Providers</h3>
              <p className="text-white/90 leading-relaxed mb-4">
                We work with trusted third-party service providers who assist us in operating our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li><strong>Supabase:</strong> Database hosting, authentication, and file storage</li>
                <li><strong>Stripe:</strong> Payment processing and subscription management</li>
                <li><strong>AI Service Providers:</strong> Third-party APIs for image generation and 3D model creation</li>
                <li><strong>Cloud Infrastructure:</strong> Hosting and content delivery services</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">4.2 Public Content</h3>
              <p className="text-white/90 leading-relaxed">
                Content you choose to make public (such as figurines shared in our public gallery) will be visible to other users and may be featured on our platform. You control the visibility of your content through your privacy settings.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">4.3 Legal Requirements</h3>
              <p className="text-white/90 leading-relaxed">
                We may disclose your information if required by law, court order, or to protect our rights, property, or safety, or that of our users or the public.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">4.4 Business Transfers</h3>
              <p className="text-white/90 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction, subject to equivalent privacy protections.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">5. Data Security</h2>
              <p className="text-white/90 leading-relaxed mb-4">
                We implement comprehensive security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li><strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
                <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
                <li><strong>Security Monitoring:</strong> Continuous monitoring for suspicious activities</li>
                <li><strong>Regular Audits:</strong> Periodic security assessments and updates</li>
                <li><strong>Email Verification:</strong> Required email verification for account security</li>
                <li><strong>Session Management:</strong> Secure session handling and automatic timeouts</li>
              </ul>
              <p className="text-white/90 leading-relaxed mt-4">
                While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but will notify you of any security breaches as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">6. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-semibold mb-3 text-white">6.1 Account Management</h3>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li><strong>Access:</strong> View and update your account information</li>
                <li><strong>Correction:</strong> Update or correct your personal information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Export:</strong> Request a copy of your data in a portable format</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">6.2 Content Control</h3>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li>Control the visibility of your generated content</li>
                <li>Delete individual figurines and creations</li>
                <li>Manage sharing preferences</li>
                <li>Control what appears in your public profile</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">6.3 Communication Preferences</h3>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li>Opt out of marketing communications</li>
                <li>Choose notification preferences</li>
                <li>Control email frequency and types</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white mt-6">6.4 Regional Rights</h3>
              <p className="text-white/90 leading-relaxed">
                Depending on your location, you may have additional rights under laws such as GDPR (EU), CCPA (California), or other applicable privacy regulations. These may include rights to portability, restriction of processing, and objection to certain uses of your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">7. Data Retention</h2>
              <p className="text-white/90 leading-relaxed mb-4">
                We retain your information for different periods depending on the type of data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable period after deletion</li>
                <li><strong>Generated Content:</strong> Retained according to your settings and applicable laws</li>
                <li><strong>Usage Analytics:</strong> Aggregated and anonymized data may be retained indefinitely</li>
                <li><strong>Payment Records:</strong> Retained as required by financial regulations</li>
                <li><strong>Security Logs:</strong> Retained for security and compliance purposes</li>
              </ul>
              <p className="text-white/90 leading-relaxed mt-4">
                When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain certain information for legal or regulatory compliance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">8. International Data Transfers</h2>
              <p className="text-white/90 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. When we transfer your information internationally, we ensure appropriate safeguards are in place, such as standard contractual clauses or adequacy decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">9. Children's Privacy</h2>
              <p className="text-white/90 leading-relaxed">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">10. Cookies and Tracking Technologies</h2>
              <p className="text-white/90 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li><strong>Essential Cookies:</strong> Required for basic functionality and security</li>
                <li><strong>Performance Cookies:</strong> Help us understand how you use our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Analytics:</strong> Provide insights into platform usage and performance</li>
              </ul>
              <p className="text-white/90 leading-relaxed mt-4">
                You can control cookies through your browser settings, but disabling certain cookies may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">11. AI and Machine Learning</h2>
              <p className="text-white/90 leading-relaxed mb-4">
                Our platform uses artificial intelligence and machine learning technologies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/90">
                <li><strong>Content Generation:</strong> Your prompts and preferences help train our AI models</li>
                <li><strong>Quality Improvement:</strong> Generated content may be analyzed to improve AI performance</li>
                <li><strong>Personalization:</strong> AI helps customize your experience and recommendations</li>
                <li><strong>Content Moderation:</strong> Automated systems help ensure appropriate content</li>
              </ul>
              <p className="text-white/90 leading-relaxed mt-4">
                We implement safeguards to ensure AI processing respects your privacy and complies with applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">12. Updates to This Privacy Policy</h2>
              <p className="text-white/90 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by posting the updated policy on our platform and updating the "Last Updated" date. For significant changes, we may provide additional notice through email or platform notifications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">13. Contact Information</h2>
              <p className="text-white/90 leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-figuro-accent/10 border border-figuro-accent/30 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-2">Privacy Officer</h4>
                <p className="text-white/90">Email: privacy@figuro.ai</p>
                <p className="text-white/90">Subject Line: Privacy Policy Inquiry</p>
                <p className="text-white/90 mt-3">
                  For data protection rights requests, please include "Data Rights Request" in the subject line and provide sufficient information to verify your identity.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-figuro-accent">14. Compliance and Jurisdiction</h2>
              <p className="text-white/90 leading-relaxed">
                This Privacy Policy is governed by the laws of the jurisdiction where our company is incorporated. We comply with applicable data protection laws including but not limited to GDPR, CCPA, and other regional privacy regulations. Any disputes related to this Privacy Policy will be resolved in accordance with our Terms of Service.
              </p>
            </section>

            <div className="mt-12 p-6 bg-figuro-accent/10 border border-figuro-accent/30 rounded-lg">
              <p className="text-white/90 text-sm">
                <strong>Note:</strong> This Privacy Policy is effective as of the date listed above and applies to all users of the Figuro platform. By continuing to use our Service after any changes to this Privacy Policy, you accept the updated terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;


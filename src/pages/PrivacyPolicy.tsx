import { ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { useTimezone } from '@/contexts/TimezoneContext'

export function PrivacyPolicy() {
  const navigate = useNavigate()
  const { formatDate } = useTimezone()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-brand-600" />
              <span className="text-2xl font-bold">DevSecureX</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-muted-foreground">
              Last updated: {formatDate(new Date(), { includeTime: false, includeTimezone: false })}
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                DevSecureX ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our security platform service. Please read this privacy policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium mb-2 mt-4">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>Register for an account</li>
                <li>Use our services</li>
                <li>Contact us for support</li>
                <li>Subscribe to our newsletter</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">Usage Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                We automatically collect certain information about your device and usage patterns:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>IP address, browser type, and operating system</li>
                <li>Pages visited and time spent on our service</li>
                <li>Security scan results and vulnerability data</li>
                <li>API usage patterns and performance metrics</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">Repository Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you connect your repositories, we may access:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>Repository metadata (name, description, language)</li>
                <li>Code content for security analysis</li>
                <li>Commit history and pull request information</li>
                <li>Issue and vulnerability reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>Provide, operate, and maintain our security services</li>
                <li>Perform security scans and vulnerability analysis</li>
                <li>Generate security reports and recommendations</li>
                <li>Improve our AI-powered security assistance</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your requests and provide customer support</li>
                <li>Monitor usage and prevent abuse of our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-lg font-medium mb-2 mt-4">We Do Not Sell Your Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties.
              </p>

              <h3 className="text-lg font-medium mb-2 mt-4">Limited Sharing</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may share your information only in these limited circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With trusted service providers who assist our operations</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement comprehensive security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>End-to-end encryption for data transmission</li>
                <li>AES-256 encryption for data at rest</li>
                <li>Multi-factor authentication and access controls</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>SOC 2 Type II compliance and industry certifications</li>
                <li>Secure development practices and code reviews</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>Account information: Retained while your account is active</li>
                <li>Security scan data: Retained for historical analysis and trending</li>
                <li>Usage logs: Retained for 12 months for security monitoring</li>
                <li>Deleted account data: Securely deleted within 30 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have several rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Export your data in a common format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>Essential cookies for authentication and security</li>
                <li>Analytics cookies to understand usage patterns</li>
                <li>Preference cookies to remember your settings</li>
                <li>You can control cookies through your browser settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Third-Party Integration</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service integrates with third-party platforms:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li><strong>GitHub:</strong> Repository access and webhook notifications</li>
                <li><strong>Google OAuth:</strong> Authentication services</li>
                <li><strong>Security Tools:</strong> Vulnerability scanning and analysis</li>
                <li>These integrations are governed by their respective privacy policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during international transfers, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>Standard contractual clauses approved by regulatory authorities</li>
                <li>Adequacy decisions for countries with equivalent protection</li>
                <li>Certification under recognized privacy frameworks</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg mt-3">
                <p className="text-muted-foreground">
                  <strong>DevSecureX Privacy Team</strong><br />
                  Email: privacy@devsecurex.com<br />
                  Address: [Your Business Address]<br />
                  Website: https://devsecurex.com<br />
                  Phone: [Your Contact Number]
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground text-center">
                This Privacy Policy is effective as of the date stated above and will remain in effect except with respect to any changes in its provisions in the future.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
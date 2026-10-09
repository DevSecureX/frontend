import { ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { useTimezone } from '@/contexts/TimezoneContext'

export function TermsOfService() {
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
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
            <p className="text-center text-muted-foreground">
              Last updated: {formatDate(new Date(), { includeTime: false, includeTimezone: false })}
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using DevSecureX ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                DevSecureX is a comprehensive security platform that provides automated security scanning, vulnerability detection, and AI-powered security assistance for software development projects. Our service includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>Automated security scanning with 20+ security tools</li>
                <li>GitHub integration and pull request security reviews</li>
                <li>AI-powered security consultation and recommendations</li>
                <li>Custom security rules and vulnerability detection</li>
                <li>Security analytics and reporting dashboards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts and Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your login credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Use the service only for lawful purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Acceptable Use Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree not to use the service to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>Upload, post, or transmit any malicious code or content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any applicable local, state, national, or international law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Security and Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We take data security seriously and implement industry-standard security measures to protect your information. However, no method of transmission over the Internet is 100% secure. We maintain comprehensive security practices including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure code scanning and analysis processes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                The service and its original content, features, and functionality are and will remain the exclusive property of DevSecureX and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to maintain high service availability but do not guarantee uninterrupted access to the service. We may suspend or restrict access for maintenance, updates, or other operational reasons with reasonable notice when possible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall DevSecureX, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg mt-3">
                <p className="text-muted-foreground">
                  <strong>DevSecureX Support Team</strong><br />
                  Email: support@devsecurex.com<br />
                  Website: https://devsecurex.com
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground text-center">
                By using DevSecureX, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
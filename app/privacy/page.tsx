import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10">
          <div className="mb-8 pb-6 border-b border-slate-100">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
            <p className="mt-2 text-sm text-slate-400">Last updated: February 2026</p>
          </div>

          <div className="space-y-8 text-slate-600 leading-relaxed">
            <p className="text-base">
              This privacy policy describes how Briefly collects, uses, and protects your information.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Information We Collect</h2>
              <p className="text-base">
                We collect information you provide directly to us, such as when you create an account, subscribe to RSS feeds, or contact us. This includes your email address, feed preferences, and delivery schedule settings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">How We Use Your Information</h2>
              <p className="text-base">
                We use the information we collect to provide, maintain, and improve our services, including generating personalized summaries of your RSS feeds. Your data is never sold to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Data Protection</h2>
              <p className="text-base">
                We implement industry-standard security measures to protect your personal information. Your data is encrypted in transit and at rest, and we regularly review our security practices to keep your information safe.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Your Rights</h2>
              <p className="text-base">
                You have the right to access, correct, or delete your personal data at any time. You may also request a copy of the data we hold about you by contacting our support team.
              </p>
            </section>

            <section className="pt-4 border-t border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Contact Us</h2>
              <p className="text-base">
                If you have any questions about this privacy policy, please contact us at{' '}
                <a href="mailto:privacy@briefly.ai" className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                  privacy@briefly.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

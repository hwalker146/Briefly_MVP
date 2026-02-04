import Link from 'next/link'

export default function Terms() {
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
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
            <p className="mt-2 text-sm text-slate-400">Last updated: February 2026</p>
          </div>

          <div className="space-y-8 text-slate-600 leading-relaxed">
            <p className="text-base">
              These terms of service govern your use of Briefly and our services. By using Briefly, you agree to these terms.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Acceptance of Terms</h2>
              <p className="text-base">
                By accessing and using Briefly, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Use of the Service</h2>
              <p className="text-base">
                You may use our service to subscribe to RSS feeds and receive AI-generated summaries via email. You agree not to misuse the service or use it for any unlawful purpose.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Account Responsibilities</h2>
              <p className="text-base">
                You are responsible for maintaining the security of your account and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Privacy</h2>
              <p className="text-base">
                Your privacy is important to us. Please see our{' '}
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                  Privacy Policy
                </Link>{' '}
                for information about how we collect and use your data.
              </p>
            </section>

            <section className="pt-4 border-t border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Contact</h2>
              <p className="text-base">
                For questions about these terms, contact us at{' '}
                <a href="mailto:legal@briefly.ai" className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                  legal@briefly.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

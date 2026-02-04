import Link from 'next/link'

export default function Contact() {
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
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contact Us</h1>
            <p className="mt-2 text-base text-slate-500">
              We'd love to hear from you. Reach out using any of the channels below.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-10">
            <a
              href="mailto:hello@briefly.ai"
              className="group relative flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-center transition-all hover:shadow-md hover:border-indigo-100 hover:bg-white"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">General</h3>
              <p className="text-sm text-indigo-600 font-medium group-hover:text-indigo-500 transition-colors">
                hello@briefly.ai
              </p>
            </a>

            <a
              href="mailto:support@briefly.ai"
              className="group relative flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-center transition-all hover:shadow-md hover:border-indigo-100 hover:bg-white"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Support</h3>
              <p className="text-sm text-indigo-600 font-medium group-hover:text-indigo-500 transition-colors">
                support@briefly.ai
              </p>
            </a>

            <a
              href="mailto:privacy@briefly.ai"
              className="group relative flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-center transition-all hover:shadow-md hover:border-indigo-100 hover:bg-white"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-200/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Privacy</h3>
              <p className="text-sm text-indigo-600 font-medium group-hover:text-indigo-500 transition-colors">
                privacy@briefly.ai
              </p>
            </a>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Response Time</span>
            </div>
            <p className="text-sm text-slate-600">
              We typically respond to emails within 24 hours during business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { RssIcon, SparklesIcon, ClockIcon, CheckIcon, ArrowRightIcon, BoltIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-lg group-hover:shadow-indigo-200 transition-shadow">
                <RssIcon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Briefly</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left column - Content */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-8">
                <BoltIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Powered by AI</span>
              </div>

              <h1 className="text-4xl lg:text-[3.5rem] font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                Your daily news,{' '}
                <span className="gradient-text">brilliantly</span>{' '}
                summarized
              </h1>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-lg">
                Subscribe to any RSS feed and get AI-powered summaries delivered to your inbox.
                Stay informed in minutes, not hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all"
                >
                  Start for Free
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all"
                >
                  See How It Works
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  <span>No credit card needed</span>
                </div>
              </div>
            </div>

            {/* Right column - Email mockup */}
            <div className="relative animate-fade-in-up stagger-2 opacity-0">
              <div className="animate-float">
                <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="ml-3 text-xs text-gray-400 font-medium">Your Daily Digest</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-md flex items-center justify-center">
                        <RssIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Briefly Digest</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-4">Today &middot; 5 articles &middot; 4 min read</div>

                    <div className="space-y-4">
                      <div className="border-l-[3px] border-indigo-500 pl-4 py-0.5">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          New AI Model Achieves Breakthrough
                        </h4>
                        <p className="text-xs text-gray-500 mb-1.5 leading-relaxed">
                          Researchers at Stanford released a new language model that outperforms existing benchmarks...
                        </p>
                        <span className="text-[11px] text-gray-400 font-medium">TechCrunch &middot; 2h ago</span>
                      </div>

                      <div className="border-l-[3px] border-emerald-500 pl-4 py-0.5">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          Climate Policy Updates for 2026
                        </h4>
                        <p className="text-xs text-gray-500 mb-1.5 leading-relaxed">
                          Three key policy changes affecting renewable energy adoption across Europe...
                        </p>
                        <span className="text-[11px] text-gray-400 font-medium">Reuters &middot; 4h ago</span>
                      </div>

                      <div className="border-l-[3px] border-amber-500 pl-4 py-0.5">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          SpaceX Launches Satellite Constellation
                        </h4>
                        <p className="text-xs text-gray-500 mb-1.5 leading-relaxed">
                          The latest mission deployed 60 satellites, expanding global coverage to remote regions...
                        </p>
                        <span className="text-[11px] text-gray-400 font-medium">Ars Technica &middot; 5h ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything you need to stay informed
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Briefly transforms your information overload into clear, actionable insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: SparklesIcon,
                title: 'Smart Summaries',
                description: 'AI-powered summaries that capture the essence of articles in just a few sentences. Customize your prompts for different content.',
                color: 'indigo'
              },
              {
                icon: ClockIcon,
                title: 'Perfect Timing',
                description: 'Receive your digest exactly when you want it. Set precise delivery times and never miss important updates.',
                color: 'violet'
              },
              {
                icon: RssIcon,
                title: 'Any RSS Feed',
                description: 'Works with any RSS feed or website. Automatically discover feeds from your favorite sites and blogs.',
                color: 'blue'
              }
            ].map((feature) => (
              <div key={feature.title} className="group text-center p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100 transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              How it works
            </h2>
            <p className="text-lg text-gray-500">Three simple steps to your personalized digest</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '1', title: 'Add your feeds', desc: 'Paste any website URL and we will automatically find the RSS feed for you.' },
              { step: '2', title: 'Set your schedule', desc: 'Choose when you want your digest delivered -- morning, evening, or any time.' },
              { step: '3', title: 'Read your digest', desc: 'Get beautifully summarized articles delivered straight to your inbox.' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white font-bold text-lg shadow-md shadow-indigo-200">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-500">
              Start free, upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg hover:shadow-gray-100 transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Free</h3>
              <p className="text-sm text-gray-500 mb-6">For getting started</p>
              <div className="text-4xl font-bold text-gray-900 mb-8">
                $0<span className="text-base font-normal text-gray-400">/month</span>
              </div>

              <ul className="space-y-3.5 mb-8">
                {['5 RSS feeds', 'Daily digest emails', 'Basic AI summaries', 'Email support'].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signin"
                className="block w-full text-center px-6 py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-white to-indigo-50/30 rounded-2xl border-2 border-indigo-200 p-8 relative shadow-lg shadow-indigo-100/50">
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider shadow-md">
                  Popular
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">Pro</h3>
              <p className="text-sm text-gray-500 mb-6">For power users</p>
              <div className="text-4xl font-bold text-gray-900 mb-8">
                $9<span className="text-base font-normal text-gray-400">/month</span>
              </div>

              <ul className="space-y-3.5 mb-8">
                {['Unlimited RSS feeds', 'Custom digest schedules', 'Advanced AI prompts', 'Full-text extraction', 'Priority support'].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signin"
                className="block w-full text-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-400/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
            Ready to reclaim your reading time?
          </h2>
          <p className="text-lg text-indigo-200 mb-10">
            Join thousands who start their day with Briefly. Set up takes less than 2 minutes.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-8 py-4 text-base font-semibold text-indigo-700 bg-white hover:bg-gray-50 rounded-xl shadow-xl transition-all"
          >
            Get Started Free
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="flex items-center mb-4 md:mb-0">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                <RssIcon className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">Briefly</span>
            </Link>

            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

import Link from 'next/link'
import { RssIcon, SparklesIcon, ClockIcon, CheckIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-1200 mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <RssIcon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Briefly</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-1200 mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Content */}
            <div>
              <h1 className="text-28 lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                AI-powered RSS summaries delivered to your inbox
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Stay informed without the overwhelm. Get personalized AI summaries of your favorite feeds, 
                delivered exactly when you want them.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Get Started for Free
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right column - Email mockup */}
            <div className="relative">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-600 mb-2">Your Daily Digest • Aug 29, 2025</div>
                  <h3 className="font-semibold text-gray-900 mb-4">5 articles from your feeds</h3>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-indigo-600 pl-4">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        New AI Model Achieves Breakthrough
                      </h4>
                      <p className="text-13 text-gray-600 mb-2">
                        Researchers at Stanford released a new language model that outperforms existing benchmarks...
                      </p>
                      <div className="text-13 text-gray-500">TechCrunch • 2 hours ago</div>
                    </div>
                    
                    <div className="border-l-4 border-green-600 pl-4">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        Climate Policy Updates
                      </h4>
                      <p className="text-13 text-gray-600 mb-2">
                        Three key policy changes affecting renewable energy adoption across Europe...
                      </p>
                      <div className="text-13 text-gray-500">Reuters • 4 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-1200 mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to stay informed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Briefly transforms your information overload into clear, actionable insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Summaries</h3>
              <p className="text-gray-600">
                AI-powered summaries that capture the essence of articles in just a few sentences. 
                Customize your prompts for different types of content.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Perfect Timing</h3>
              <p className="text-gray-600">
                Receive your digest exactly when you want it. Set precise delivery times 
                and never miss important updates.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <RssIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Any RSS Feed</h3>
              <p className="text-gray-600">
                Works with any RSS feed or website. Automatically discover feeds 
                from your favorite sites and blogs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-1200 mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                $0<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  '5 RSS feeds',
                  'Daily digest emails',
                  'Basic AI summaries',
                  'Email support'
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/auth/signin"
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-lg border-2 border-indigo-600 p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-600 text-white px-3 py-1 text-sm font-semibold rounded-full">
                  Popular
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                $9<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited RSS feeds',
                  'Custom digest schedules',
                  'Advanced AI prompts',
                  'Full-text article extraction',
                  'Priority support'
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/auth/signin"
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-1200 mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <RssIcon className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">Briefly</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="/privacy" className="hover:text-gray-900">Privacy Policy</a>
              <a href="/terms" className="hover:text-gray-900">Terms of Service</a>
              <a href="/contact" className="hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
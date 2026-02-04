'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { RssIcon } from '@heroicons/react/24/outline'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signIn('email', { email, callbackUrl: '/dashboard' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-inter">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-center px-16">
          <Link href="/" className="flex items-center mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <RssIcon className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold text-white">Briefly</span>
          </Link>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your news,<br />brilliantly summarized.
          </h1>
          <p className="text-lg text-indigo-200 leading-relaxed max-w-md">
            AI-powered RSS digests delivered to your inbox exactly when you want them.
          </p>

          <div className="mt-12 space-y-4">
            {['Smart AI summaries', 'Customizable delivery schedule', 'Works with any RSS feed'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-indigo-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Link href="/" className="flex items-center">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                <RssIcon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Briefly</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          <div className="space-y-4">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-gray-50 text-gray-400 uppercase tracking-wider font-medium">or</span>
              </div>
            </div>

            {/* Email Sign In */}
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  'Send Magic Link'
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

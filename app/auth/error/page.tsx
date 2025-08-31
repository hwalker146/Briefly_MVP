export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was a problem signing you in. Please try again.
          </p>
          <a
            href="/auth/signin"
            className="mt-4 inline-block text-blue-600 hover:text-blue-500"
          >
            Back to sign in
          </a>
        </div>
      </div>
    </div>
  )
}
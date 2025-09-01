export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
          <div className="prose prose-gray max-w-none">
            <p>We'd love to hear from you! Get in touch with us using the information below.</p>
            <h2>Email</h2>
            <p>For general inquiries: hello@briefly.ai</p>
            <p>For support: support@briefly.ai</p>
            <p>For privacy questions: privacy@briefly.ai</p>
            <h2>Response Time</h2>
            <p>We typically respond to emails within 24 hours during business days.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
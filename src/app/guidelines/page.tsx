import Link from 'next/link';

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Resource Submission Guidelines
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Help us maintain a high-quality collection of developer resources by following these guidelines.
          </p>
        </div>

        {/* Guidelines Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 space-y-8">
          {/* Quality Standards */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-3xl">✅</span>
              Quality Standards
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="font-medium text-gray-900 dark:text-white">Resources should be:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Relevant:</strong> Directly related to software development, programming, or technical skills</li>
                <li><strong>Accessible:</strong> Free or have a clear free tier/trial available</li>
                <li><strong>Up-to-date:</strong> Maintained and current (not outdated or deprecated)</li>
                <li><strong>Well-documented:</strong> Have clear instructions, examples, or explanations</li>
                <li><strong>Trustworthy:</strong> From reputable sources or verified authors</li>
              </ul>
            </div>
          </section>

          {/* What to Submit */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-3xl">📚</span>
              What to Submit
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-bold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                  <span>✓</span> Great Examples
                </h3>
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                  <li>• Official documentation</li>
                  <li>• Interactive tutorials</li>
                  <li>• Open-source tools & libraries</li>
                  <li>• Educational courses</li>
                  <li>• Technical blogs & articles</li>
                  <li>• Developer communities</li>
                  <li>• Code playgrounds</li>
                  <li>• Best practice guides</li>
                </ul>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                  <span>✗</span> Avoid Submitting
                </h3>
                <ul className="space-y-1 text-sm text-red-700 dark:text-red-400">
                  <li>• Spam or promotional content</li>
                  <li>• Affiliate links without disclosure</li>
                  <li>• Outdated or unmaintained resources</li>
                  <li>• Paywalled content without free tier</li>
                  <li>• Low-quality or plagiarized content</li>
                  <li>• Unrelated to development</li>
                  <li>• Broken or dead links</li>
                  <li>• Duplicate submissions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Submission Requirements */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-3xl">📝</span>
              Submission Requirements
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Clear Title</h3>
                <p className="text-sm">Use the official name of the resource. Avoid clickbait or misleading titles.</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Example: "React Official Documentation"</p>
                <p className="text-xs text-red-600 dark:text-red-400">✗ Avoid: "Best React Resource Ever!!!"</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Detailed Description</h3>
                <p className="text-sm">Explain what the resource offers, who it's for, and why it's valuable. Be specific and honest.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 50 characters recommended</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Accurate Categorization</h3>
                <p className="text-sm">Select the most appropriate type, technologies, and sources. This helps users find relevant content.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. Valid Links</h3>
                <p className="text-sm">Ensure the URL is correct, active, and leads directly to the resource (not a landing page or ad).</p>
              </div>
            </div>
          </section>

          {/* Review Process */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-3xl">⏳</span>
              Review Process
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">1</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Submission</p>
                  <p className="text-sm">Your resource is submitted and queued for review</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">2</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Admin Review</p>
                  <p className="text-sm">Our team checks the resource against these guidelines (usually within 24-48 hours)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">3</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Notification</p>
                  <p className="text-sm">You'll receive a notification about approval or reasons for decline</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center font-bold text-sm">4</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Published</p>
                  <p className="text-sm">Approved resources go live and are visible to the community</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tips for Success */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-3xl">💡</span>
              Tips for Success
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span>Double-check your links before submitting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span>Write clear, informative descriptions that help others understand the value</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span>Select all relevant technologies to improve discoverability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span>If a similar resource exists, consider if yours adds unique value</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span>Be patient during the review process</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              If you have questions about these guidelines or need clarification, please reach out to our admin team through the notification system.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg cursor-pointer"
          >
            Ready to Submit a Resource
          </Link>
        </div>
      </div>
    </div>
  );
}

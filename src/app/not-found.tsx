import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* 404 Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m6 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          {/* 404 Content */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/" className="block">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Go to Homepage
              </button>
            </Link>
            <Link href="/submit" className="block">
              <button className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                Create Content
              </button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Quick Links:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link href="/analytics" className="text-blue-600 dark:text-blue-400 hover:underline">
                Analytics
              </Link>
              <Link href="/scheduler" className="text-blue-600 dark:text-blue-400 hover:underline">
                Scheduler
              </Link>
              <Link href="/analytics" className="text-blue-600 dark:text-blue-400 hover:underline">
                Analytics
              </Link>
              <Link href="/settings" className="text-blue-600 dark:text-blue-400 hover:underline">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

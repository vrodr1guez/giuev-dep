import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-7xl font-bold text-blue-600 dark:text-blue-400 mb-6">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        
        <div className="mb-8 p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Possible Reasons:</h3>
          <ul className="text-left text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-2">
            <li>The URL might be incorrectly typed</li>
            <li>The backend server might be offline</li>
            <li>You might not have the necessary permissions to access this page</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Go to Home Page
          </Link>
          <Link href="/api-docs" className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors">
            Visit API Docs
          </Link>
        </div>
      </div>
    </div>
  );
} 
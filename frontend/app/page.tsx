export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center">
        <img
          src="/logo.jpg"
          alt="SJP Call Center Logo"
          className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-8 rounded-full shadow-2xl"
        />
        <h1 className="text-3xl sm:text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
          Call Center Management System
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
          Sindh Job Portal - Professional Query Management
        </p>
        <a
          href="/login"
          className="inline-block px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
        >
          Get Started
        </a>
        <footer className="mt-16 text-sm text-gray-500">
          Developed by Call Center Internees
        </footer>
      </div>
    </div>
  );
}

import { Outlet, Link } from "react-router-dom"

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 text-xl font-bold">🏥</span>
            <Link
              to="/"
              className="text-sm text-blue-600 font-medium"
            >
              Hospital Queue System
            </Link>
          </div>

          <Link
            to="/teller/login"
            className="text-sm text-blue-600 font-medium"
          >
            Staff Login
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <Outlet />
      </main>
    </div>
  )
}

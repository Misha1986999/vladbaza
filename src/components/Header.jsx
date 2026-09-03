import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
export default function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }
  return (
    <header className="border-b border-ink/10 bg-fog/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-semibold text-bay">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-bay">
            <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 7v13M7 12H3a9 9 0 0 0 9 9 9 9 0 0 0 9-9h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          ВладБаза
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/new"
                className="bg-bay text-white px-4 py-2 rounded-md font-medium hover:bg-bay/90 transition-colors"
              >
                Разместить объявление
              </Link>
              <button
                onClick={handleSignOut}
                className="text-ink/70 hover:text-ink px-3 py-2 text-sm"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-ink/70 hover:text-ink px-3 py-2 text-sm">
                Войти
              </Link>
              <Link
                to="/register"
                className="bg-bay text-white px-4 py-2 rounded-md font-medium hover:bg-bay/90 transition-colors"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

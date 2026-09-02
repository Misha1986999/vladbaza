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
        <Link to="/" className="font-display text-2xl font-semibold text-bay">
          ВладБаза
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/new"
                className="bg-coral text-white px-4 py-2 rounded-md font-medium hover:bg-coral/90 transition-colors"
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

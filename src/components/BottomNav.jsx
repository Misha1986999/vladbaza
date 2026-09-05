import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
export default function BottomNav() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }
  const itemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-xs ${
      isActive ? 'text-bay' : 'text-ink/60'
    }`
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-ink/10 flex items-stretch">
      <NavLink to="/" end className={itemClass}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 11l8-6 8 6M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Главная
      </NavLink>
      <NavLink to={user ? '/new' : '/login'} className={itemClass}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Разместить
      </NavLink>
      <NavLink to={user ? '/group-chat' : '/login'} className={itemClass}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 4h16v12H8l-4 4V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Чат
      </NavLink>
      {profile?.is_admin && (
        <NavLink to="/admin" className={itemClass}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Админка
        </NavLink>
      )}
      {user ? (
        <button onClick={handleSignOut} className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-xs text-ink/60">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 17l5-5-5-5M20 12H9M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Выйти
        </button>
      ) : (
        <NavLink to="/login" className={itemClass}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Войти
        </NavLink>
      )}
    </nav>
  )
}

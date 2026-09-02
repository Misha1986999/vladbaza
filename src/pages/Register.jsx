import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setSubmitting(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, full_name: fullName })
    }

    setSubmitting(false)
    navigate('/')
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Регистрация</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Имя"
          className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль (от 6 символов)"
          className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
        />
        {error && <p className="text-coral text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-bay text-white px-4 py-2.5 rounded-md font-medium hover:bg-bay/90 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-4">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-bay hover:underline">
          Войти
        </Link>
      </p>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext.jsx'

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: convs } = await supabase
        .from('conversations')
        .select('*, listings(title)')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (!convs || convs.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      const otherIds = convs.map((c) => (c.user1_id === user.id ? c.user2_id : c.user1_id))
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', otherIds)

      const withNames = convs.map((c) => {
        const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id
        const profile = profiles?.find((p) => p.id === otherId)
        return { ...c, otherName: profile?.full_name || 'Собеседник' }
      })

      setConversations(withNames)
      setLoading(false)
    }

    load()
  }, [user.id])

  if (loading) return <p className="text-ink/50">Загрузка...</p>

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Мои переписки</h1>
      {conversations.length === 0 ? (
        <p className="text-ink/50">Переписок пока нет. Напишите продавцу с любой страницы объявления.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              to={`/chat/${c.id}`}
              className="block bg-white border border-ink/10 rounded-lg p-4 hover:border-bay/40 transition-colors"
            >
              <p className="font-medium">{c.otherName}</p>
              {c.listings?.title && (
                <p className="text-sm text-ink/50">по объявлению «{c.listings.title}»</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext.jsx'

export default function GroupChat() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [names, setNames] = useState({})
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    let channel

    const load = async () => {
      const { data: msgs } = await supabase
        .from('group_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(200)

      setMessages(msgs ?? [])

      const senderIds = [...new Set((msgs ?? []).map((m) => m.sender_id))]
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', senderIds)
        const map = {}
        profiles?.forEach((p) => (map[p.id] = p.full_name || 'Пользователь'))
        setNames(map)
      }

      setLoading(false)

      channel = supabase
        .channel('group-chat')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'group_messages' },
          async (payload) => {
            setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
            if (!names[payload.new.sender_id]) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', payload.new.sender_id)
                .single()
              setNames((prev) => ({ ...prev, [payload.new.sender_id]: profile?.full_name || 'Пользователь' }))
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'group_messages' },
          (payload) => {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
          }
        )
        .subscribe()
    }

    load()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const content = text.trim()
    setText('')
    await supabase.from('group_messages').insert({
      sender_id: user.id,
      content,
    })
  }

  const removeMessage = async (id) => {
    const confirmed = window.confirm('Удалить это сообщение?')
    if (!confirmed) return
    setMessages((prev) => prev.filter((m) => m.id !== id))
    const { error } = await supabase.from('group_messages').delete().eq('id', id)
    if (error) {
      alert('Не удалось удалить: ' + error.message)
    }
  }

  if (loading) return <p className="text-ink/50">Загрузка...</p>

  return (
    <div className="max-w-xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
      <h1 className="text-xl font-semibold border-b border-ink/10 pb-3 mb-3">Общий чат ВладБазы</h1>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3">
        {messages.length === 0 ? (
          <p className="text-ink/40 text-sm text-center py-8">Сообщений пока нет — напишите первым.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-1 ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
              {profile?.is_admin && (
                <button
                  onClick={() => removeMessage(m.id)}
                  className="w-6 h-6 rounded-full bg-coral text-white text-sm flex items-center justify-center flex-shrink-0 mt-1"
                  title="Удалить сообщение"
                >
                  ×
                </button>
              )}
              <div
                className={`inline-block max-w-[75%] px-3 py-2 rounded-lg text-sm break-words ${
                  m.sender_id === user.id ? 'bg-bay text-white' : 'bg-white border border-ink/10'
                }`}
              >
                {m.sender_id !== user.id && (
                  <p className="text-xs font-medium text-bay mb-0.5">{names[m.sender_id] || 'Пользователь'}</p>
                )}
                {m.content}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать в общий чат..."
          className="flex-1 min-w-0 px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
        />
        <button
          type="submit"
          className="bg-bay text-white px-4 py-2 rounded-md font-medium hover:bg-bay/90 flex-shrink-0"
        >
          Отправить
        </button>
      </form>
    </div>
  )
}

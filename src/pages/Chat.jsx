import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext.jsx'

export default function Chat() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [otherName, setOtherName] = useState('')
  const [listingTitle, setListingTitle] = useState(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    let channel

    const load = async () => {
      const { data: conv } = await supabase
        .from('conversations')
        .select('*, listings(title)')
        .eq('id', id)
        .single()

      if (conv) {
        const otherId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id
        const { data: p } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', otherId)
          .single()
        setOtherName(p?.full_name || 'Собеседник')
        setListingTitle(conv.listings?.title ?? null)
      }

      const { data: msgs } = await supabase
        .from('private_messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })
      setMessages(msgs ?? [])
      setLoading(false)

      channel = supabase
        .channel('chat-' + id)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'private_messages', filter: `conversation_id=eq.${id}` },
          (payload) => setMessages((prev) => [...prev, payload.new])
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'private_messages', filter: `conversation_id=eq.${id}` },
          (payload) => setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
        )
        .subscribe()
    }

    load()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [id, user.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const content = text.trim()
    setText('')
    await supabase.from('private_messages').insert({
      conversation_id: id,
      sender_id: user.id,
      content,
    })
  }

  const removeMessage = async (msgId) => {
    const confirmed = window.confirm('Удалить это сообщение?')
    if (!confirmed) return
    await supabase.from('private_messages').delete().eq('id', msgId)
  }

  if (loading) return <p className="text-ink/50">Загрузка...</p>

  return (
    <div className="max-w-xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
      <div className="border-b border-ink/10 pb-3 mb-3">
        <Link to="/messages" className="text-sm text-bay hover:underline">
          ← Все переписки
        </Link>
        <h1 className="text-xl font-semibold mt-1">{otherName}</h1>
        {listingTitle && <p className="text-sm text-ink/50">по объявлению «{listingTitle}»</p>}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3">
        {messages.length === 0 ? (
          <p className="text-ink/40 text-sm text-center py-8">Сообщений пока нет — напишите первым.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`group relative inline-block max-w-[75%] px-3 py-2 rounded-lg text-sm break-words ${
                  m.sender_id === user.id ? 'bg-bay text-white' : 'bg-white border border-ink/10'
                }`}
              >
                {m.content}
                {profile?.is_admin && (
                  <button
                    onClick={() => removeMessage(m.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-coral text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить сообщение"
                  >
                    ×
                  </button>
                )}
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
          placeholder="Написать сообщение..."
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

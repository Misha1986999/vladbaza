import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminPanel() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    supabase
      .from('listings')
      .select('*, listing_photos(url, sort_order), categories(name), districts(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setPending(data ?? [])
        setLoading(false)
      })
  }

  useEffect(load, [])

  const approve = async (id) => {
    await supabase.from('listings').update({ status: 'approved' }).eq('id', id)
    load()
  }

  const reject = async (id) => {
    const reason = window.prompt('Причина отклонения (необязательно):') ?? ''
    await supabase.from('listings').update({ status: 'rejected', rejection_reason: reason }).eq('id', id)
    load()
  }

  if (loading) return <p className="text-ink/50">Загрузка...</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Модерация объявлений</h1>

      {pending.length === 0 ? (
        <p className="text-ink/50">Нет объявлений, ожидающих проверки.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((listing) => {
            const photo = [...(listing.listing_photos ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]
            return (
              <div key={listing.id} className="bg-white border border-ink/10 rounded-lg p-4 flex gap-4">
                <div className="w-24 h-24 bg-ink/5 rounded-md overflow-hidden flex-shrink-0">
                  {photo ? (
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">
                      Без фото
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{listing.title}</p>
                  <p className="text-sm text-ink/50 mb-1">
                    {listing.categories?.name} · {listing.districts?.name ?? 'Владивосток'} ·{' '}
                    {listing.price ? `${Number(listing.price).toLocaleString('ru-RU')} ₽` : 'без цены'}
                  </p>
                  <p className="text-sm text-ink/70 line-clamp-2">{listing.description}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => approve(listing.id)}
                    className="bg-bay text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-bay/90"
                  >
                    Одобрить
                  </button>
                  <button
                    onClick={() => reject(listing.id)}
                    className="border border-coral text-coral px-4 py-1.5 rounded-md text-sm font-medium hover:bg-coral/5"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

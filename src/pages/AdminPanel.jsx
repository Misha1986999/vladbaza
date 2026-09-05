import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminPanel() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*, listing_photos(url, sort_order), categories(name), districts(name)')
      .order('created_at', { ascending: false })

    if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)

    query.then(({ data }) => {
      setListings(data ?? [])
      setLoading(false)
    })
  }

  useEffect(load, [search])

  const remove = async (id, title) => {
    const confirmed = window.confirm(`Удалить объявление «${title}»? Это действие нельзя отменить.`)
    if (!confirmed) return
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) {
      alert(`Не удалось удалить: ${error.message}`)
      return
    }
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Все объявления</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по названию..."
        className="w-full mb-6 px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
      />

      {loading ? (
        <p className="text-ink/50">Загрузка...</p>
      ) : listings.length === 0 ? (
        <p className="text-ink/50">Объявлений не найдено.</p>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const photo = [...(listing.listing_photos ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]
            return (
              <div key={listing.id} className="bg-white border border-ink/10 rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-24 h-40 sm:h-24 bg-ink/5 rounded-md overflow-hidden flex-shrink-0">
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
                <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                  <Link
                    to={`/edit/${listing.id}`}
                    className="bg-bay text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-bay/90 text-center"
                  >
                    Редактировать
                  </Link>
                  <button
                    onClick={() => remove(listing.id, listing.title)}
                    className="border border-coral text-coral px-4 py-1.5 rounded-md text-sm font-medium hover:bg-coral/5"
                  >
                    Удалить
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

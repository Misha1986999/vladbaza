import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext.jsx'

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPhone, setShowPhone] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    supabase
      .from('listings')
      .select('*, listing_photos(url, sort_order), categories(name), districts(name)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setListing(data)
        setLoading(false)
      })
  }, [id])

  const startChat = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!listing?.user_id || listing.user_id === user.id) return

    setStarting(true)
    const otherUserId = listing.user_id

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .or(
        `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
      )
      .maybeSingle()

    if (existing) {
      navigate(`/chat/${existing.id}`)
      setStarting(false)
      return
    }

    const { data: created, error } = await supabase
      .from('conversations')
      .insert({
        user1_id: user.id,
        user2_id: otherUserId,
        listing_id: listing.id,
      })
      .select('id')
      .single()

    setStarting(false)

    if (error) {
      alert('Не удалось начать чат: ' + error.message)
      return
    }

    navigate(`/chat/${created.id}`)
  }

  if (loading) return <p className="text-ink/50">Загрузка...</p>
  if (!listing) return <p className="text-ink/50">Объявление не найдено или ещё не одобрено.</p>
  const photos = [...(listing.listing_photos ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const isOwner = user && listing.user_id === user.id

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="min-w-0">
        <div className="aspect-[4/3] bg-ink/5 rounded-lg overflow-hidden mb-3">
          {photos.length > 0 ? (
            <img src={photos[activePhoto].url} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/30">Без фото</div>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <button
                key={p.url + i}
                onClick={() => setActivePhoto(i)}
                className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                  i === activePhoto ? 'border-bay' : 'border-transparent'
                }`}
              >
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <Link to="/" className="text-sm text-bay hover:underline">
          Ко всем объявлениям
        </Link>
        <h1 className="text-2xl font-semibold mt-2 mb-1 break-words">{listing.title}</h1>
        <p className="font-display text-3xl text-bay mb-4">
          {listing.price ? Number(listing.price).toLocaleString('ru-RU') + ' ₽' : 'Цена не указана'}
        </p>
        <div className="flex gap-2 text-sm text-ink/50 mb-4">
          <span>{listing.categories?.name}</span>
          <span>·</span>
          <span>{listing.districts?.name ?? 'Владивосток'}</span>
        </div>
        <p className="text-ink/80 whitespace-pre-wrap break-words mb-6">{listing.description}</p>
        <div className="border-t border-ink/10 pt-4 flex flex-wrap gap-3">
          {showPhone ? (
            
            <a  href={'tel:' + listing.phone}
              className="inline-block bg-bay text-white px-5 py-3 rounded-md font-medium"
            >
              {listing.phone}
            </a>
          ) : (
            <button
              onClick={() => setShowPhone(true)}
              className="bg-coral text-white px-5 py-3 rounded-md font-medium hover:bg-coral/90 transition-colors"
            >
              Показать телефон
            </button>
          )}

          {!isOwner && (
            <button
              onClick={startChat}
              disabled={starting}
              className="border border-bay text-bay px-5 py-3 rounded-md font-medium hover:bg-fog transition-colors disabled:opacity-50"
            >
              {starting ? 'Открываем чат...' : 'Написать'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

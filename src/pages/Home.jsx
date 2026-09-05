import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/ListingCard.jsx'

const CATEGORY_ICONS = {
  'Транспорт': (
    <path d="M4 16l1.5-6h13L20 16M4 16h16M4 16v3h2v-3M18 16v3h2v-3M7 10V6h10v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'Недвижимость': (
    <path d="M4 11l8-6 8 6M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'Работа': (
    <path d="M4 8h16v11H4V8Zm4 0V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'Для дома и дачи': (
    <path d="M5 4v16M5 4h11l-2 3 2 3H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'Электроника': (
    <path d="M4 5h16v11H4V5Zm5 15h6M12 16v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'Животные': (
    <path d="M12 21c-4-2-7-5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 12c0 4-3 7-7 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'Личные вещи': (
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 7h16l-1 13H5L4 7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'Услуги': (
    <path d="M12 3l2 4 4.5.7-3.2 3.2.8 4.6L12 13.5 8 15.5l.8-4.6L5.5 7.7 10 7l2-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
 'Хобби и отдых': (
    <path d="M12 3v6M9 8h6l3 12H6L9 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'Привезу автомобиль': (
    <path d="M3 16l1.5-6h11L17 16M3 16h14M3 16v3h2v-3M15 16v3h2v-3M6 10V6h6v4M19 9l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
}

const DEFAULT_ICON = (
  <path d="M12 3v6M9 9h6l3 12H6L9 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
)

export default function Home() {
  const [listings, setListings] = useState([])
  const [categories, setCategories] = useState([])
  const [districts, setDistricts] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data ?? []))
    supabase.from('districts').select('*').order('name').then(({ data }) => setDistricts(data ?? []))
  }, [])

  useEffect(() => {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*, listing_photos(url, sort_order), districts(name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (categoryId) query = query.eq('category_id', categoryId)
    if (districtId) query = query.eq('district_id', districtId)
    if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)

    query.then(({ data, error }) => {
      if (!error) setListings(data ?? [])
      setLoading(false)
    })
  }, [categoryId, districtId, search])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Объявления Владивостока</h1>
        <p className="text-ink/60 mb-3">Публикуйте и находите — от соседей, без посредников.</p>
      
      </div>

      {categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          <button
            onClick={() => setCategoryId('')}
            className={`text-left bg-white rounded-lg border p-4 transition-all hover:border-bay/40 hover:shadow-[0_8px_24px_-8px_rgba(11,59,77,0.25)] ${
              categoryId === '' ? 'border-bay bg-fog' : 'border-ink/10'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-bay mb-2">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <p className="text-sm font-medium text-ink">Все категории</p>
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`text-left bg-white rounded-lg border p-4 transition-all hover:border-bay/40 hover:shadow-[0_8px_24px_-8px_rgba(11,59,77,0.25)] ${
                categoryId === c.id ? 'border-bay bg-fog' : 'border-ink/10'
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-bay mb-2">
                {CATEGORY_ICONS[c.name] ?? DEFAULT_ICON}
              </svg>
              <p className="text-sm font-medium text-ink">{c.name}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию..."
          className="flex-1 min-w-[200px] px-3 py-2 rounded-md border border-ink/15 bg-white focus:border-bay outline-none"
        />
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          className="px-3 py-2 rounded-md border border-ink/15 bg-white focus:border-bay outline-none"
        >
          <option value="">Все районы</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-ink/50">Загрузка объявлений...</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 text-ink/50">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 text-bay/40">
            <path d="M12 2v6M9 8h6l3 12H6L9 8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M4 22h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <p className="text-lg mb-1 text-ink/70">Пока здесь пусто</p>
          <p className="text-sm">Будьте первым, кто разместит объявление в этой категории.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}

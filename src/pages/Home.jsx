import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/ListingCard.jsx'

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
        <h1 className="text-3xl font-semibold text-ink mb-1">Объявления Владивостока</h1>
        <p className="text-ink/60 mb-3">Публикуйте и находите — от соседей, без посредников.</p>
        <svg width="120" height="10" viewBox="0 0 120 10" fill="none" className="text-tide">
          <path d="M0 5c6-6 12 6 18 0s12-6 18 0 12 6 18 0 12-6 18 0 12 6 18 0 12-6 18 0 12 6 12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию..."
          className="flex-1 min-w-[200px] px-3 py-2 rounded-md border border-ink/15 bg-white focus:border-bay outline-none"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="px-3 py-2 rounded-md border border-ink/15 bg-white focus:border-bay outline-none"
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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

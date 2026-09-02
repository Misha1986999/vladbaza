import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext.jsx'

export default function NewListing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [districts, setDistricts] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [phone, setPhone] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data ?? []))
    supabase.from('districts').select('*').order('name').then(({ data }) => setDistricts(data ?? []))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title || !description || !phone || !categoryId) {
      setError('Заполните обязательные поля: заголовок, описание, телефон, категория.')
      return
    }

    setSubmitting(true)
    try {
      const { data: listing, error: insertError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title,
          description,
          price: price ? Number(price) : null,
          phone,
          category_id: Number(categoryId),
          district_id: districtId ? Number(districtId) : null,
          status: 'pending',
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Загрузка фото по одному в Storage, затем запись ссылок в listing_photos
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const path = `${user.id}/${listing.id}/${Date.now()}-${i}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(path, file)
        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage.from('listing-photos').getPublicUrl(path)

        await supabase.from('listing_photos').insert({
          listing_id: listing.id,
          url: publicUrlData.publicUrl,
          sort_order: i,
        })
      }

      setDone(true)
    } catch (err) {
      setError(err.message ?? 'Что-то пошло не так. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-semibold mb-2">Объявление отправлено на проверку</h1>
        <p className="text-ink/60 mb-6">
          Оно появится на сайте после одобрения модератором — обычно это занимает немного времени.
        </p>
        <button onClick={() => navigate('/')} className="text-bay hover:underline">
          Вернуться на главную
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Новое объявление</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Заголовок *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
            placeholder="Например: Велосипед Stels, б/у"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Описание *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
            placeholder="Состояние, особенности, причина продажи..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Цена, ₽</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
              placeholder="Оставьте пустым, если не хотите указывать"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Телефон *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
              placeholder="+7 900 000-00-00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Категория *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
            >
              <option value="">Выберите категорию</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Район</label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
            >
              <option value="">Не указан</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Фотографии</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="w-full text-sm"
          />
        </div>

        {error && <p className="text-coral text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-coral text-white px-5 py-3 rounded-md font-medium hover:bg-coral/90 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Отправка...' : 'Отправить на проверку'}
        </button>
      </form>
    </div>
  )
}

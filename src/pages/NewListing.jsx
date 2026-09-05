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
  const [previews, setPreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [newListingId, setNewListingId] = useState(null)

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data ?? []))
    supabase.from('districts').select('*').order('name').then(({ data }) => setDistricts(data ?? []))
  }, [])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files])

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

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
          status: 'approved',
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

      setNewListingId(listing.id)
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
        <h1 className="text-2xl font-semibold mb-2">Объявление опубликовано</h1>
        <p className="text-ink/60 mb-6">
          Оно уже видно всем на сайте.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => navigate('/')} className="text-bay hover:underline">
            На главную
          </button>
          {newListingId && (
            <button onClick={() => navigate(`/listing/${newListingId}`)} className="text-bay hover:underline">
              Посмотреть объявление
            </button>
          )}
        </div>
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
            className="w-full text-sm mb-3"
          />
          {previews.length > 0 && (
            <div>
              <div className="relative aspect-[4/3] bg-ink/5 rounded-lg overflow-hidden mb-2 max-w-sm">
                <img src={previews[0]} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(0)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/70 text-white flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              {previews.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {previews.slice(1).map((url, i) => (
                    <div key={url} className="relative w-16 h-16 rounded-md overflow-hidden border border-ink/15 flex-shrink-0">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i + 1)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink/70 text-white text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-coral text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-bay text-white px-5 py-3 rounded-md font-medium hover:bg-bay/90 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Публикация...' : 'Опубликовать объявление'}
        </button>
      </form>
    </div>
  )
}

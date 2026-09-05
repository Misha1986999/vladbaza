import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [districts, setDistricts] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [phone, setPhone] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data ?? []))
    supabase.from('districts').select('*').order('name').then(({ data }) => setDistricts(data ?? []))

    supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title ?? '')
          setDescription(data.description ?? '')
          setPrice(data.price ?? '')
          setPhone(data.phone ?? '')
          setCategoryId(data.category_id ?? '')
          setDistrictId(data.district_id ?? '')
        }
        setLoading(false)
      })
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title || !description || !phone || !categoryId) {
      setError('Заполните обязательные поля: заголовок, описание, телефон, категория.')
      return
    }

    setSubmitting(true)
    const { error: updateError } = await supabase
      .from('listings')
      .update({
        title,
        description,
        price: price ? Number(price) : null,
        phone,
        category_id: Number(categoryId),
        district_id: districtId ? Number(districtId) : null,
      })
      .eq('id', id)

    setSubmitting(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    navigate(`/listing/${id}`)
  }

  if (loading) return <p className="text-ink/50">Загрузка...</p>

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Редактирование объявления</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Заголовок *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Описание *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Телефон *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-ink/15 focus:border-bay outline-none"
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

        {error && <p className="text-coral text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-bay text-white px-5 py-3 rounded-md font-medium hover:bg-bay/90 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  )
}

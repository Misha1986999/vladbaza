import { Link } from 'react-router-dom'

export default function ListingCard({ listing }) {
  const photo = listing.listing_photos?.[0]?.url

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group block bg-white rounded-lg overflow-hidden border border-ink/10 hover:border-bay/40 transition-colors"
    >
      <div className="aspect-[4/3] bg-ink/5 overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-sm">
            Без фото
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-ink line-clamp-2 leading-snug">{listing.title}</p>
        <p className="font-display text-lg text-bay mt-1">
          {listing.price ? `${Number(listing.price).toLocaleString('ru-RU')} ₽` : 'Цена не указана'}
        </p>
        <p className="text-sm text-ink/50 mt-1">{listing.districts?.name ?? 'Владивосток'}</p>
      </div>
    </Link>
  )
}

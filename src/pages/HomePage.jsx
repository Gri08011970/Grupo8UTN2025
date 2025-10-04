import { Link } from 'react-router-dom'
export default function HomePage() {
  const cats = [
    { slug: 'mujer', title: 'Mujer' },
    { slug: 'hombre', title: 'Hombre' },
    { slug: 'unisex', title: 'Unisex' },
  ]
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">RopaShop</h1>
      <p className="text-gray-600 mb-6">Elegí una categoría para explorar productos.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(c => (
          <Link key={c.slug} to={`/categoria/${c.slug}`} className="bg-white border rounded-xl p-6 hover:shadow">
            <h3 className="text-lg font-semibold">{c.title}</h3>
            <p className="text-sm text-gray-500 mt-1">Ver subcategorías y productos</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

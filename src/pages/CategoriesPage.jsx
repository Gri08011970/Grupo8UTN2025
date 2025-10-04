import { Link } from 'react-router-dom'
export default function CategoriesPage() {
  const cats = ['mujer', 'hombre', 'unisex']
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Categorías</h2>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cats.map(slug => (
          <li key={slug}>
            <Link to={`/categoria/${slug}`} className="block bg-white border rounded-lg p-4 hover:shadow">
              {slug.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

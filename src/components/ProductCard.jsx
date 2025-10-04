import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <article className="bg-white rounded-xl border shadow-sm hover:shadow-md transition p-3">
      <img src={product.image} alt={product.name} className="w-full aspect-[4/3] object-cover rounded-lg" />
      <h3 className="mt-3 font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-500">{product.category} {product.subcategory ? `• ${product.subcategory}` : ''}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-bold">${product.price}</span>
        <Link to={`/producto/${product.id}`} className="text-indigo-600 hover:underline">Ver</Link>
      </div>
    </article>
  )
}

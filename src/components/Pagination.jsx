export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex gap-2 items-center justify-center mt-6">
      <button className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      <span className="text-sm">Página {page} de {totalPages}</span>
      <button className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}>
        Siguiente
      </button>
    </div>
  )
}

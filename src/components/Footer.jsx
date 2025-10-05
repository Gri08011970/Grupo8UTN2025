// src/components/Footer.jsx
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div
        className="container mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600
                      flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Izquierda */}
        <p>
          © {year} RopaShop —{" "}
          <span className="font-semibold">Diplomatura MERN (UTN)</span>.
        </p>

        {/* Derecha: “desde GRUPO 8 …” alineado a la derecha */}
        <p className="sm:ml-auto sm:text-right">
          <span className="font-semibold">GRUPO 8</span>: Axel . Magalí · Diego
          · Daniela · Gri
        </p>
      </div>
    </footer>
  );
}

export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="container mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="order-2 md:order-1">
          © 2025 <span className="font-semibold">RopaShop</span> — Diplomatura Desarrollo Web Fullstack I (UTN) 
        </p>

        <div className="order-1 md:order-2 flex items-center gap-4">
          {/* LOGO WORDMARK (GUIONES BAJOS) */}

          <img
            src="/images/logo_g8_gear_128.png"
            alt="Grupo 8 · UTN"
            className="h-9 w-9 rounded-full ring-1 ring-indigo-200"
            width="24"
            height="24"
          />

          <img
            src="/images/logo_g8_wordmark_indigo.png"
            alt="GRUPO 8 · UTN"
            className="h-5 w-auto inline-block"
            loading="lazy"
            decoding="async"
          />
          <span>
            ♥ Integrantes:   <span className="text-pink-600" aria-hidden></span>  Axel Chamorro · Magalí Izaurralde · Diego Farias· Daniela Ávalos · Mauro Britez . Leandro Pinazo .  Griselda Molina./ Profesor Axel Leonardi
          </span>
        </div>
      </div>
    </footer>
  );
}

import { deweyCategories, type Shelf } from "../data/libraryData";

type Props = {
  shelf: Shelf;
  onClose: () => void;
};

export default function ShelfPanel({ shelf, onClose }: Props) {
  const cats = deweyCategories.filter((c) => shelf.categoryIds.includes(c.id));
  const color = shelf.color ?? cats[0]?.color ?? "#5454E9";

  return (
    <div
      className="flex flex-col bg-white text-gray-900 border-2 border-gray-950 shadow-2xl relative"
      style={{
        width: 330,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Absolute Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-50 bg-gray-950/80 hover:bg-gray-950 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
        aria-label="Cerrar"
      >
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
          <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* ── TOP SECTION: PHOTO OR TECHNICAL DRAWING ── */}
      <div className="bg-gray-50 border-b border-gray-950 flex items-center justify-center overflow-hidden aspect-[4/3] relative">
        {shelf.imageUrl ? (
          <img
            src={shelf.imageUrl}
            alt={shelf.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            {shelf.kind === "area" ? (
              // Minimal desk drawing
              <svg viewBox="0 0 100 80" className="w-28 h-28 stroke-gray-400 fill-none" strokeWidth="1.2">
                <rect x="20" y="30" width="60" height="35" rx="1" />
                <line x1="25" y1="35" x2="75" y2="35" />
                <line x1="30" y1="30" x2="30" y2="65" />
                <line x1="70" y1="30" x2="70" y2="65" />
                <rect x="42" y="15" width="16" height="15" rx="1" />
                <line x1="50" y1="30" x2="50" y2="50" />
                {/* Chair outline */}
                <path d="M 46 22 L 54 22 L 54 30 L 46 30 Z" />
              </svg>
            ) : (
              // Minimal bookshelf drawing
              <svg viewBox="0 0 100 85" className="w-28 h-28 stroke-gray-400 fill-none" strokeWidth="1.2">
                <rect x="25" y="10" width="50" height="65" rx="1" />
                <line x1="25" y1="28" x2="75" y2="28" />
                <line x1="25" y1="46" x2="75" y2="46" />
                <line x1="25" y1="62" x2="75" y2="62" />
                {/* Books layer 1 */}
                <rect x="30" y="14" width="6" height="14" />
                <rect x="36" y="14" width="5" height="14" />
                <rect x="41" y="16" width="6" height="12" transform="rotate(12 41 16)" />
                {/* Books layer 2 */}
                <rect x="55" y="32" width="7" height="14" />
                <rect x="62" y="32" width="8" height="14" />
                {/* Books layer 3 */}
                <rect x="32" y="50" width="6" height="12" />
                <rect x="38" y="50" width="8" height="12" />
              </svg>
            )}
            <span className="text-[10px] font-bold text-gray-400 mt-1">
              Esquema técnico de referencia
            </span>
          </div>
        )}
      </div>

      {/* ── CENTRAL SECTION: MAIN HEADINGS ── */}
      <div className="px-5 py-4 border-b border-gray-950 bg-white">
        <div className="flex items-baseline justify-between">
          <h4 className="text-xs font-normal tracking-tight text-gray-400">
            {shelf.kind === "area" ? "Sala / Área" : "Colección / Estante"}
          </h4>
        </div>
        <h3 className="text-3xl font-black text-gray-900 tracking-tight mt-1 leading-none">
          {shelf.label}
        </h3>
      </div>

      {/* ── TECHNICAL DATA SHEET GRID ── */}
      <div className="px-5 py-4 border-b border-gray-950 bg-white text-[11px] grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <span className="block font-normal text-gray-400 text-[10px] mb-0.5">
            Ubicación
          </span>
          <span className="font-extrabold text-gray-900">
            Piso {shelf.floor} · {shelf.zone ?? "General"}
          </span>
        </div>

        <div>
          <span className="block font-normal text-gray-400 text-[10px] mb-0.5">
            Categoría / Tipo
          </span>
          <span className="font-extrabold text-gray-900">
            {shelf.kind === "area" ? "Área de servicio" : "Estantería física"}
          </span>
        </div>

        <div>
          <span className="block font-normal text-gray-400 text-[10px] mb-0.5">
            Signatura dewey
          </span>
          <span className="font-mono font-extrabold text-gray-900 text-xs">
            {shelf.kind !== "area" && shelf.deweyRanges.length > 0 ? shelf.deweyRanges.join(" · ") : "N/A"}
          </span>
        </div>

        <div>
          <span className="block font-normal text-gray-400 text-[10px] mb-0.5">
            Color
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-3.5 h-3.5 inline-block border border-gray-950 shadow-sm"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono font-bold text-gray-700">
              {color}
            </span>
          </div>
        </div>
      </div>

      {/* ── DESCRIPTION / CONTENT ── */}
      <div className="px-5 py-4 bg-gray-50 flex-1">
        <span className="block font-normal text-gray-400 text-[10px] mb-2">
          Especificación de contenido
        </span>
        <p className="text-xs text-gray-700 font-semibold leading-relaxed">
          {shelf.description || "Sin descripción física asignada."}
        </p>
      </div>
    </div>
  );
}

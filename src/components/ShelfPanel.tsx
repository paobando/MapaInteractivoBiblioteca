import { useState, useEffect, useRef } from "react";
import { deweyCategories, type Shelf } from "../data/libraryData";

type Props = {
  shelf: Shelf;
  onClose: () => void;
};

export default function ShelfPanel({ shelf, onClose }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Dewey category resolution
  const category = deweyCategories.find((c) => shelf.categoryIds.includes(c.id));
  const color = shelf.color ?? category?.color ?? "#5454E9";

  // El foco va al botón de cerrar al montar
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // Esc cierra la ficha
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isShelf = shelf.kind !== "area";

  // Determinar la zona o área real para el título de la ficha (toma la zona o área física configurada)
  const displayTitle =
    shelf.zone?.trim() ||
    (isShelf
      ? (shelf.floor === 3 ? "Sala de lectura" : "Colección general")
      : shelf.label?.trim() || "Área");

  return (
    <div
      role="dialog"
      aria-labelledby="shelf-panel-title"
      className="w-full sm:w-[350px] max-h-[85vh] sm:max-h-[80vh] flex flex-col bg-white border-2 border-gray-950 shadow-2xl overflow-hidden font-sans text-gray-900"
      style={{ borderRadius: 0 }}
    >
      {/* ── FRANJA SUPERIOR CON EL COLOR DEL PIN ── */}
      <div className="h-2 w-full shrink-0" style={{ backgroundColor: color }} />

      {/* ── CABECERA Y FOTO EN 16:9 ── */}
      <div className="relative shrink-0 w-full aspect-video bg-gray-100 border-b border-gray-950 overflow-hidden flex items-center justify-center">
        {/* Botón de cerrar plano en la esquina superior derecha */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar ficha"
          className="absolute top-2 right-2 z-20 size-8 bg-gray-950/80 hover:bg-gray-950 text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          style={{ borderRadius: 0 }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Foto o Respaldo sin imagen rota */}
        {shelf.imageUrl && !imgFailed ? (
          <img
            src={shelf.imageUrl}
            alt={shelf.label}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-50 text-center select-none">
            {isShelf ? (
              // Ícono de estantería en el color del pin
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="mb-1.5" style={{ color }}>
                <rect x="4" y="3" width="16" height="18" stroke="currentColor" strokeWidth="1.8" />
                <line x1="4" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1.8" />
                <line x1="4" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="1.8" />
                <line x1="8" y1="9" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1.8" />
                <line x1="12" y1="9" x2="12" y2="4.5" stroke="currentColor" strokeWidth="1.8" />
                <line x1="10" y1="15" x2="10" y2="10.5" stroke="currentColor" strokeWidth="1.8" />
                <line x1="14" y1="15" x2="14" y2="10.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            ) : (
              // Ícono de área en el color del pin
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="mb-1.5" style={{ color }}>
                <rect x="3" y="6" width="18" height="13" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M13 10h5M13 14h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
            <p className="text-[11px] font-bold text-gray-500">
              Foto del lugar no disponible
            </p>
          </div>
        )}
      </div>

      {/* ── CUERPO DE LA FICHA ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Identificación según tipo */}
        <div>
          {isShelf ? (
            <>
              {/* Kicker: Estantería T1 · Piso 2 */}
              <p className="text-[11px] font-bold text-gray-500">
                Estantería {shelf.label} · Piso {shelf.floor}
              </p>

              {/* Título: Nombre de la zona física o área */}
              <h3
                id="shelf-panel-title"
                className="text-lg font-black text-gray-950 mt-0.5 leading-tight tracking-tight"
              >
                {displayTitle}
              </h3>

              {/* Signatura Dewey */}
              {shelf.deweyRanges && shelf.deweyRanges.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-500 shrink-0">
                    Signatura:
                  </span>
                  <span className="px-2 py-1 bg-gray-100 border border-gray-300 font-mono text-xs font-extrabold text-gray-900">
                    {shelf.deweyRanges.join(" · ")}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Kicker: Área · Piso 2 · Zona */}
              <p className="text-[11px] font-bold text-gray-500">
                Área · Piso {shelf.floor}{shelf.zone?.trim() && ` · ${shelf.zone.trim()}`}
              </p>

              {/* Título: Nombre del área */}
              <h3
                id="shelf-panel-title"
                className="text-xl font-black text-gray-950 mt-0.5 leading-tight tracking-tight"
              >
                {shelf.label?.trim() || "Área"}
              </h3>
            </>
          )}
        </div>

        {/* Descripción del contenido si existe */}
        {shelf.description && shelf.description.trim().length > 0 && (
          <div className="p-3 bg-gray-50 border border-gray-200">
            <p className="text-[11px] font-bold text-gray-400 mb-1">
              Descripción
            </p>
            <p className="text-xs font-normal text-gray-700 leading-relaxed">
              {shelf.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

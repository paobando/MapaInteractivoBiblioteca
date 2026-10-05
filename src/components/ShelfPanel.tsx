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
      className="overflow-hidden flex flex-col"
      style={{
        backgroundColor: "white",
        borderRadius: 0,
        border: "1.5px solid rgba(255,255,255,0.9)",
      }}
    >
      {/* Colored header band */}
      <div
        className="px-5 py-4 flex items-start justify-between gap-3"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.65)" }}>
            Piso {shelf.floor} · {shelf.kind === "area" ? "Área" : "Estantería"}
          </p>
          <h3 className="text-white text-3xl font-extrabold mt-0.5 leading-none">{shelf.label}</h3>
          {shelf.kind !== "area" && (
            <>
              <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.65)" }}>
                Signatura Dewey
              </p>
              <p className="font-mono text-base font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
                {shelf.deweyRanges.join(" · ")}
              </p>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-full w-8 h-8 flex items-center justify-center transition-colors shrink-0 mt-0.5"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          aria-label="Cerrar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 3L3 11M3 3l8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Location color */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
          <span className="size-3" style={{ backgroundColor: color }} />
          Color de ubicación · {color.toUpperCase()}
        </div>

        {/* Description */}
        <div
          className="rounded-2xl px-4 py-3"
          style={{ backgroundColor: "#F5F6FA" }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contenido</p>
          <p className="text-sm text-gray-700 leading-relaxed">{shelf.description}</p>
        </div>

        {/* Location hint */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ backgroundColor: `${color}0D`, border: `1px solid ${color}22` }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <path
              d="M9 1.5A5.5 5.5 0 0 0 3.5 7c0 4.375 5.5 9.5 5.5 9.5S14.5 11.375 14.5 7A5.5 5.5 0 0 0 9 1.5Zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
              fill={color}
            />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color }}>
            Dirígete al <strong>Piso {shelf.floor}</strong>
            {shelf.zone ? <> · <strong>{shelf.zone}</strong></> : null} y ubica{" "}
            {shelf.kind === "area" ? "el área" : "la estantería"} <strong>{shelf.label}</strong> señalizada en el plano.
          </p>
        </div>
      </div>
    </div>
  );
}

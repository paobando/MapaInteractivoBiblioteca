import { useState } from "react";
import { deweyCategories, type Shelf } from "../data/libraryData";

const colorPresets = ["#5454E9", "#865CF0", "#E9683B", "#4CB979", "#E4EB60", "#111827"];

type Props = {
  shelf: Shelf;
  onSave: (updated: Shelf) => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function EditPanel({ shelf, onSave, onDelete, onClose }: Props) {
  const [label, setLabel] = useState(shelf.label);
  const [dewey, setDewey] = useState(shelf.deweyRanges[0] ?? "");
  const [kind, setKind] = useState<"shelf" | "area">(shelf.kind ?? "shelf");
  const [description, setDescription] = useState(shelf.description);
  const [zone, setZone] = useState(shelf.zone ?? "");
  const defaultCategory = deweyCategories.find((category) => shelf.categoryIds.includes(category.id));
  const [color, setColor] = useState(shelf.color ?? defaultCategory?.color ?? "#5454E9");
  const [colorText, setColorText] = useState(color.toUpperCase());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    onSave({
      ...shelf,
      label: label.trim() || shelf.label,
      deweyRanges: dewey.trim() ? [dewey.trim()] : shelf.deweyRanges,
      description: description.trim(),
      zone: zone.trim() || undefined,
      color,
      kind,
    });
    onClose();
  };

  return (
    <div
      className="overflow-hidden flex flex-col"
      style={{
        backgroundColor: "white",
        borderRadius: 0,
        border: "1.5px solid rgba(255,255,255,0.9)",
        width: 320,
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3.5 flex items-center justify-between gap-3"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9.5 2.5a1.5 1.5 0 0 1 2.121 2.121L5.121 11.12l-2.828.708.707-2.828L9.5 2.5Z"
              stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <p className="text-white font-bold text-sm">
            Editar {kind === "area" ? "área" : "estantería"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full w-7 h-7 flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3l6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <div className="px-5 py-4 flex flex-col gap-3">
        {/* Label + element type */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              {kind === "area" ? "Nombre" : "Etiqueta"}
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={kind === "area" ? 40 : 4}
              placeholder={kind === "area" ? "Sala de lectura" : "T1"}
            className="w-full px-3 py-2 text-sm font-bold bg-gray-50 border border-gray-200
                         focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
            />
          </div>
          <div className="flex-[2]">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Tipo de elemento
            </label>
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as "shelf" | "area")}
              className="w-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-icesi-blue focus:ring-2 focus:ring-icesi-blue/15"
            >
              <option value="shelf">Estantería</option>
              <option value="area">Área</option>
            </select>
          </div>
        </div>

        {kind === "shelf" && (
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Signatura Dewey
            </label>
            <input
              value={dewey}
              onChange={(e) => setDewey(e.target.value)}
              placeholder="000 – 099.9"
              className="w-full border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
            Área o zona
          </label>
          <input
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Ej. Literatura"
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200
                       focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
            Color del pin
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(event) => {
                setColor(event.target.value);
                setColorText(event.target.value.toUpperCase());
              }}
              className="h-10 w-12 cursor-pointer border border-gray-200 bg-white p-1"
              aria-label="Seleccionar color personalizado"
            />
            <input
              value={colorText}
              onChange={(event) => {
                const value = event.target.value.toUpperCase();
                setColorText(value);
                if (/^#[0-9A-F]{6}$/.test(value)) setColor(value);
              }}
              maxLength={7}
              className="h-10 min-w-0 flex-1 border border-gray-200 bg-gray-50 px-3 font-mono text-sm font-bold text-gray-700 outline-none focus:border-icesi-blue"
              aria-label="Código hexadecimal del color"
            />
          </div>
          <div className="mt-2 flex gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setColor(preset);
                  setColorText(preset);
                }}
                aria-label={`Usar color ${preset}`}
                className="size-7 border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: preset,
                  borderColor: color.toLowerCase() === preset.toLowerCase() ? "#111827" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
            Contenido / descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe el contenido de esta estantería..."
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all
                       placeholder-gray-400"
          />
        </div>

        {/* Drag hint */}
        <div
          className="flex items-center gap-2 px-3 py-2.5"
          style={{ backgroundColor: "#F5F6FA" }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0">
            <path
              d="M6.5 1v11M1 6.5h11M4 4L1 6.5 4 9M9 4l3 2.5L9 9"
              stroke="#88898C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <p className="text-xs text-gray-400">Arrastra el pin en el mapa para reubicarlo</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {confirmDelete ? (
            <>
              <button
                onClick={onDelete}
                className="flex-1 py-2.5 text-sm font-bold text-white transition-all"
                style={{ backgroundColor: "#E9683B" }}
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 transition-all"
                style={{ backgroundColor: "#F5F6FA" }}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 text-sm font-bold text-white transition-all"
                style={{ backgroundColor: color }}
              >
                Guardar
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-10 h-10 flex items-center justify-center shrink-0 transition-all"
                style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
                title="Eliminar pin"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 3.5h10M5.5 3.5V2.5h3v1M4 3.5l.7 7.5h4.6l.7-7.5"
                    stroke="#E9683B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

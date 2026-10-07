import { useState, useEffect, useRef, useCallback } from "react";
import { deweyCategories, type Shelf, type DeweyCategory } from "../data/libraryData";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

type Props = {
  shelf: Shelf;
  onSave: (updated: Shelf) => void;
  onDelete: () => void;
  onClose: () => void;
};

const ICESI_COLORS = [
  { name: "Azul Icesi", hex: "#5454E9" },
  { name: "Morado", hex: "#865CF0" },
  { name: "Naranja", hex: "#E9683B" },
  { name: "Verde", hex: "#4CB979" },
  { name: "Amarillo", hex: "#E4EB60" },
  { name: "Grafito", hex: "#111827" },
];

/**
 * Calcula el color de texto con contraste óptimo (blanco o grafito)
 * para garantizar legibilidad absoluta sobre cualquier fondo.
 */
function getContrastTextColor(hexColor: string): string {
  const clean = hexColor.replace("#", "");
  if (clean.length !== 6) return "#FFFFFF";
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "#FFFFFF";
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 165 ? "#111827" : "#FFFFFF";
}

/**
 * Detecta la categoría Dewey principal (000–900) basándose en
 * el primer valor numérico contenido en la signatura.
 */
function detectDeweyCategory(text: string): DeweyCategory | null {
  if (!text) return null;
  const match = text.match(/(\d{1,3})/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  if (isNaN(num) || num < 0 || num > 999) return null;
  const baseHundred = String(Math.floor(num / 100) * 100).padStart(3, "0");
  return deweyCategories.find((cat) => cat.id === baseHundred) ?? null;
}

export default function EditPanel({ shelf, onSave, onDelete, onClose }: Props) {
  // ── Estado del formulario ──
  const [kind, setKind] = useState<"shelf" | "area">(shelf.kind ?? "shelf");
  const [label, setLabel] = useState(shelf.label);
  const [dewey, setDewey] = useState(shelf.deweyRanges[0] ?? "");
  const [zone, setZone] = useState(shelf.zone ?? "");
  const [description, setDescription] = useState(shelf.description ?? "");

  const defaultCategory = deweyCategories.find((category) => shelf.categoryIds.includes(category.id));
  const initialColor = (shelf.color ?? defaultCategory?.color ?? "#5454E9").toUpperCase();
  const [color, setColor] = useState(initialColor);
  const [colorHexInput, setColorHexInput] = useState(initialColor);

  const [imageUrl, setImageUrl] = useState(shelf.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Detección de Dewey ──
  const detectedDeweyCategory = kind === "shelf" ? detectDeweyCategory(dewey) : null;

  // ── Validaciones ──
  const maxLabelLen = kind === "shelf" ? 4 : 40;
  const isLabelEmpty = label.trim().length === 0;
  const isLabelTooLong = label.trim().length > maxLabelLen;

  let labelError = "";
  if (isLabelEmpty) {
    labelError = "La etiqueta no puede estar vacía.";
  } else if (isLabelTooLong) {
    labelError = kind === "shelf"
      ? "Máximo 4 caracteres para estanterías (ej. T1, T2B)."
      : "Máximo 40 caracteres para áreas de servicio.";
  }

  const isValidHex = /^#([0-9A-Fa-f]{6})$/.test(colorHexInput);
  const hexError = !isValidHex ? "Formato HEX no válido (debe ser #RRGGBB)." : "";

  const hasErrors = Boolean(labelError || hexError);

  // ── Detección de cambios ("Sin guardar") ──
  const initialDewey = shelf.deweyRanges[0] ?? "";
  const initialZone = shelf.zone ?? "";
  const initialKind = shelf.kind ?? "shelf";
  const initialDescription = shelf.description ?? "";
  const initialImageUrl = shelf.imageUrl ?? "";

  const isDirty =
    label !== shelf.label ||
    kind !== initialKind ||
    (kind === "shelf" && dewey !== initialDewey) ||
    zone !== initialZone ||
    color.toUpperCase() !== initialColor ||
    description !== initialDescription ||
    imageUrl !== initialImageUrl;

  // ── Procesamiento de subida de archivo (Supabase Storage + fallback Base64) ──
  const processUploadFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo debe ser una imagen (PNG, JPG, WebP o GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("El archivo supera el límite de 5MB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setImageLoadError(false);

    try {
      const bucketName = "images";
      const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const uploadUrl = `https://${projectId}.supabase.co/storage/v1/object/${bucketName}/${cleanFileName}`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": file.type,
        },
        body: file,
      });

      if (response.ok) {
        const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}/${cleanFileName}`;
        setImageUrl(publicUrl);
        setUploading(false);
        return;
      }
    } catch {
      // Intento de fallback
    }

    // Fallback a Base64
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageUrl(reader.result);
          setUploading(false);
        } else {
          setUploadError("Error al codificar la imagen.");
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setUploadError("Error al leer el archivo del dispositivo.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError("Error en la lectura del archivo.");
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadFile(file);
    }
    // Reiniciar para permitir seleccionar el mismo archivo si es necesario
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // ── Guardar ──
  const handleSave = useCallback(() => {
    if (hasErrors || !isDirty || uploading) return;

    // Calcular categoryIds según la signatura detectada o la anterior
    let finalCategoryIds = shelf.categoryIds;
    if (kind === "shelf") {
      if (detectedDeweyCategory) {
        finalCategoryIds = [detectedDeweyCategory.id];
      }
    }

    onSave({
      ...shelf,
      label: label.trim(),
      kind,
      deweyRanges: kind === "shelf" && dewey.trim() ? [dewey.trim()] : [],
      categoryIds: finalCategoryIds,
      description: description.trim(),
      zone: zone.trim() || undefined,
      color: color.toUpperCase(),
      imageUrl: imageUrl.trim() || undefined,
    });
    onClose();
  }, [hasErrors, isDirty, uploading, kind, detectedDeweyCategory, onSave, shelf, label, dewey, description, zone, color, imageUrl, onClose]);

  // ── Petición de cierre ──
  const handleRequestClose = useCallback(() => {
    if (isDirty) {
      setConfirmDiscard(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // ── Atajos de teclado: Ctrl/Cmd + Enter (guardar), Esc (cerrar) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (isDirty && !hasErrors && !uploading) {
          handleSave();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (confirmDiscard) {
          setConfirmDiscard(false);
        } else if (confirmDelete) {
          setConfirmDelete(false);
        } else {
          handleRequestClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, hasErrors, uploading, confirmDiscard, confirmDelete, handleSave, handleRequestClose]);

  const previewTextColor = getContrastTextColor(color);

  return (
    <div
      className="relative flex flex-col bg-white border border-gray-950 shadow-2xl w-[370px] max-h-[84vh] text-gray-900 font-sans"
      style={{ borderRadius: 0 }}
    >
      {/* ── AVISO DE CONFIRMACIÓN DE DESCARTAR CAMBIOS ── */}
      {confirmDiscard && (
        <div className="absolute inset-0 z-50 bg-white/95 p-6 flex flex-col justify-center items-center text-center border-2 border-icesi-orange">
          <div className="size-10 bg-amber-100 flex items-center justify-center text-icesi-orange font-bold text-lg mb-3">
            !
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1.5">
            ¿Descartar cambios no guardados?
          </h4>
          <p className="text-[12px] text-gray-600 mb-5 leading-relaxed">
            Has realizado modificaciones en este elemento que se perderán si sales sin guardar.
          </p>
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-[12px] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Descartar y salir
            </button>
            <button
              type="button"
              onClick={() => setConfirmDiscard(false)}
              className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[12px] border border-gray-300 transition-colors"
              style={{ borderRadius: 0 }}
            >
              Seguir editando
            </button>
          </div>
        </div>
      )}

      {/* ── ENCABEZADO FIJO CON VISTA PREVIA Y AVISO 'SIN GUARDAR' ── */}
      <div className="shrink-0 px-4 py-3 bg-white border-b border-gray-950 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mini vista previa del pin en vivo */}
          <div className="relative shrink-0 flex flex-col items-center">
            {kind === "shelf" ? (
              <>
                <div
                  className="size-7 flex items-center justify-center text-[11px] font-black border border-gray-950 shadow-sm"
                  style={{
                    backgroundColor: color,
                    color: previewTextColor,
                    borderRadius: 0,
                  }}
                >
                  {label.slice(0, 3) || "T?"}
                </div>
                <div
                  className="size-0 border-x-[4px] border-t-[5px] border-x-transparent -mt-[1px]"
                  style={{ borderTopColor: color }}
                />
              </>
            ) : (
              <div
                className="size-7 flex items-center justify-center border-2 bg-white shadow-sm"
                style={{
                  borderColor: color,
                  borderRadius: 0,
                }}
              >
                <div className="size-3" style={{ backgroundColor: color }} />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-gray-950 truncate">
                Editar {kind === "shelf" ? "Estantería" : "Área"}
              </h3>
              {isDirty && (
                <span className="shrink-0 px-1.5 py-0.5 text-[11px] font-bold bg-[#e8e8ff] text-[#5454E9] border-0">
                  Sin guardar
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 font-semibold truncate">
              Piso {shelf.floor} · {shelf.label || "Sin etiqueta"}
            </p>
          </div>
        </div>

        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={handleRequestClose}
          aria-label="Cerrar panel de edición"
          className="size-7 shrink-0 flex items-center justify-center text-gray-600 hover:text-gray-950 hover:bg-gray-100 border border-gray-300 transition-colors"
          style={{ borderRadius: 0 }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ── CUERPO CON SCROLL PROPIO Y TRES SECCIONES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 text-gray-800">
        {/* ═════════ SECCIÓN 1: IDENTIFICACIÓN ═════════ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
            <h4 className="text-[11px] font-bold text-gray-950">
              1. Identificación
            </h4>
          </div>

          {/* Control segmentado: Estantería / Área */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
              Tipo de elemento
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 border border-gray-300">
              <button
                type="button"
                onClick={() => setKind("shelf")}
                className={`py-1.5 text-xs font-bold transition-colors ${
                  kind === "shelf"
                    ? "bg-gray-950 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-950 hover:bg-gray-200"
                }`}
                style={{ borderRadius: 0 }}
              >
                Estantería
              </button>
              <button
                type="button"
                onClick={() => setKind("area")}
                className={`py-1.5 text-xs font-bold transition-colors ${
                  kind === "area"
                    ? "bg-gray-950 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-950 hover:bg-gray-200"
                }`}
                style={{ borderRadius: 0 }}
              >
                Área
              </button>
            </div>
          </div>

          {/* Etiqueta / Nombre con contador y validación */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-label" className="text-[11px] font-bold text-gray-500">
                {kind === "shelf" ? "Etiqueta del estante" : "Nombre del área"}
              </label>
              <span
                className={`text-[11px] font-bold ${
                  isLabelTooLong ? "text-red-600" : "text-gray-400"
                }`}
              >
                {label.length} / {maxLenLabelText(maxLabelLen)}
              </span>
            </div>
            <input
              id="input-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={kind === "shelf" ? "ej. T1, T2" : "ej. Sala de lectura"}
              className={`w-full px-3 py-2 text-xs font-bold border transition-colors outline-none ${
                labelError
                  ? "border-red-500 bg-red-50/40 text-red-950 focus:border-red-600"
                  : "border-gray-300 bg-white text-gray-900 focus:border-icesi-blue focus:ring-1 focus:ring-icesi-blue"
              }`}
              style={{ borderRadius: 0 }}
            />
            {labelError && (
              <p className="mt-1 text-[11px] font-bold text-red-600">{labelError}</p>
            )}
          </div>

          {/* Área o zona */}
          <div>
            <label htmlFor="input-zone" className="block text-[11px] font-bold text-gray-500 mb-1.5">
              Zona o sala
            </label>
            <input
              id="input-zone"
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="ej. Literatura, Colección general"
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 bg-white text-gray-900 outline-none focus:border-icesi-blue focus:ring-1 focus:ring-icesi-blue"
              style={{ borderRadius: 0 }}
            />
          </div>
        </section>

        {/* ═════════ SECCIÓN 2: COLOR ═════════ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
            <h4 className="text-[11px] font-bold text-gray-950">
              2. Color del pin
            </h4>
          </div>

          {/* Muestras de marca Icesi */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
              Colores institucionales
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {ICESI_COLORS.map((c) => {
                const isSelected = color.toUpperCase() === c.hex.toUpperCase();
                const textColor = getContrastTextColor(c.hex);
                return (
                  <button
                    key={c.hex}
                    type="button"
                    title={`${c.name} (${c.hex})`}
                    onClick={() => {
                      setColor(c.hex);
                      setColorHexInput(c.hex);
                    }}
                    className="relative h-8 flex items-center justify-center border transition-transform hover:scale-105"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: isSelected ? "#111827" : "#CECFDA",
                      borderRadius: 0,
                      boxShadow: isSelected ? "inset 0 0 0 2px #FFFFFF" : undefined,
                    }}
                  >
                    {isSelected && (
                      <span className="font-bold text-xs" style={{ color: textColor }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color personalizado + Campo HEX validado */}
          <div>
            <label htmlFor="input-hex" className="block text-[11px] font-bold text-gray-500 mb-1.5">
              Personalizado / Código HEX
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={isValidHex ? colorHexInput : color}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setColor(val);
                  setColorHexInput(val);
                }}
                title="Elegir color personalizado"
                className="size-9 p-0.5 cursor-pointer border border-gray-300 bg-white shrink-0"
                style={{ borderRadius: 0 }}
              />
              <div className="flex-1 relative">
                <input
                  id="input-hex"
                  type="text"
                  maxLength={7}
                  value={colorHexInput}
                  onChange={(e) => {
                    let val = e.target.value.trim().toUpperCase();
                    if (!val.startsWith("#") && val.length > 0) val = `#${val}`;
                    setColorHexInput(val);
                    if (/^#([0-9A-Fa-f]{6})$/.test(val)) {
                      setColor(val);
                    }
                  }}
                  placeholder="#5454E9"
                  className={`w-full px-3 py-2 text-xs font-mono font-bold border transition-colors outline-none ${
                    hexError
                      ? "border-red-500 bg-red-50/40 text-red-950 focus:border-red-600"
                      : "border-gray-300 bg-white text-gray-900 focus:border-icesi-blue"
                  }`}
                  style={{ borderRadius: 0 }}
                />
              </div>
              {/* Muestra con texto legible contrastado */}
              <div
                className="px-2.5 py-2 text-[11px] font-bold border border-gray-950 shrink-0"
                style={{
                  backgroundColor: color,
                  color: previewTextColor,
                  borderRadius: 0,
                }}
              >
                Muestra
              </div>
            </div>
            {hexError && (
              <p className="mt-1 text-[11px] font-bold text-red-600">{hexError}</p>
            )}
          </div>
        </section>

        {/* ═════════ SECCIÓN 3: CONTENIDO ═════════ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
            <h4 className="text-[11px] font-bold text-gray-950">
              3. Contenido y multimedia
            </h4>
          </div>

          {/* Signatura Dewey (solo para estanterías) */}
          {kind === "shelf" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-dewey" className="text-[11px] font-bold text-gray-500">
                  Signatura Dewey
                </label>
                <span className="text-[11px] text-gray-400 font-semibold">
                  ej. 800–899.9
                </span>
              </div>
              <input
                id="input-dewey"
                type="text"
                value={dewey}
                onChange={(e) => setDewey(e.target.value)}
                placeholder="ej. 800 – 899.9"
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-gray-300 bg-white text-gray-900 outline-none focus:border-icesi-blue focus:ring-1 focus:ring-icesi-blue"
                style={{ borderRadius: 0 }}
              />
            </div>
          )}

          {/* Descripción */}
          <div>
            <label htmlFor="input-desc" className="block text-[11px] font-bold text-gray-500 mb-1.5">
              Descripción / temas
            </label>
            <textarea
              id="input-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el contenido temático de este punto..."
              className="w-full px-3 py-2 text-xs font-medium border border-gray-300 bg-white text-gray-900 resize-none outline-none focus:border-icesi-blue focus:ring-1 focus:ring-icesi-blue"
              style={{ borderRadius: 0 }}
            />
          </div>

          {/* Foto: Arrastrar y soltar + Reemplazar / Quitar + Detección de error */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-gray-500">
                Foto de la ubicación
              </label>
              <span className="text-[11px] text-gray-400 font-semibold">
                Máx. 5MB
              </span>
            </div>

            {/* Input oculto de archivos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              disabled={uploading}
              className="hidden"
            />

            {/* Estado con imagen cargada */}
            {imageUrl ? (
              <div className="border border-gray-300 bg-gray-50 p-2 space-y-2">
                <div className="relative aspect-video w-full bg-gray-200 overflow-hidden border border-gray-200 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Vista previa de la ubicación"
                    className="w-full h-full object-cover"
                    onError={() => setImageLoadError(true)}
                    onLoad={() => setImageLoadError(false)}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-[12px] font-bold">
                      <div className="size-5 border-2 border-white border-t-transparent animate-spin mb-1" />
                      Subiendo...
                    </div>
                  )}
                </div>

                {imageLoadError && (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold">
                    Aviso: La imagen no pudo cargarse en el navegador. Comprueba el archivo o la URL.
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 py-1.5 px-2 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-bold transition-colors"
                    style={{ borderRadius: 0 }}
                  >
                    Reemplazar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      setImageLoadError(false);
                      setUploadError("");
                    }}
                    disabled={uploading}
                    className="py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-bold border border-red-300 transition-colors"
                    style={{ borderRadius: 0 }}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              /* Zona de arrastrar y soltar */
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border-2 border-dashed text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
                  isDragging
                    ? "border-icesi-blue bg-blue-50/60"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
                style={{ borderRadius: 0 }}
              >
                {uploading ? (
                  <div className="flex flex-col items-center py-2">
                    <div className="size-5 border-2 border-icesi-blue border-t-transparent animate-spin mb-2" />
                    <p className="text-[12px] font-bold text-icesi-blue">
                      Subiendo a Supabase...
                    </p>
                  </div>
                ) : (
                  <>
                    <svg className="size-6 text-gray-400 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[12px] font-bold text-gray-700">
                      Arrastra una foto aquí o haz clic para examinar
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Soporta JPG, PNG, WebP o GIF (máx. 5MB)
                    </p>
                  </>
                )}
              </div>
            )}

            {uploadError && (
              <p className="mt-1 text-[11px] font-bold text-red-600">{uploadError}</p>
            )}
          </div>
        </section>
      </div>

      {/* ── ACCIONES FIJAS ABAJO (FOOTER) ── */}
      <div className="shrink-0 p-3 bg-white border-t border-gray-950">
        {confirmDelete ? (
          <div className="space-y-2 bg-red-50 p-2.5 border border-red-300">
            <p className="text-[11px] font-bold text-red-900 leading-tight">
              ¿Eliminar este {kind === "shelf" ? "estante" : "área"} permanentemente del mapa?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[12px] transition-colors"
                style={{ borderRadius: 0 }}
              >
                Sí, eliminar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-[12px] transition-colors"
                style={{ borderRadius: 0 }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Botón Guardar (desactivado si no hay cambios o si hay errores) */}
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || hasErrors || uploading}
              title={
                !isDirty
                  ? "Sin cambios que guardar"
                  : hasErrors
                  ? "Corrige los errores antes de guardar"
                  : "Guardar cambios (Ctrl+Enter)"
              }
              className={`flex-1 py-2.5 px-3 text-[12px] font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                !isDirty || hasErrors || uploading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                  : "bg-icesi-blue hover:bg-blue-700 text-white shadow-sm cursor-pointer"
              }`}
              style={{ borderRadius: 0 }}
            >
              <span>Guardar</span>
            </button>

            {/* Botón Eliminar */}
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title="Eliminar este pin del mapa"
              className="size-9 shrink-0 flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
              style={{ borderRadius: 0 }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2.5 4h11M5.5 4V2.5h5V4M4 4l.8 9.5h6.4L12 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function maxLenLabelText(max: number): string {
  return `${max}`;
}

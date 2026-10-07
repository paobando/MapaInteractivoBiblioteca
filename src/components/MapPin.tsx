import React from "react";
import { deweyCategories, type Shelf } from "../data/libraryData";

export type MapPinProps = {
  shelf: Shelf;
  selected: boolean;
  editMode: boolean;
  isDragging?: boolean;
  allFloorShelves?: Shelf[];
  onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) => void;
  onPointerMove?: (e: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) => void;
  onClick?: (shelf: Shelf) => void;
  onMove?: (id: string, x: number, y: number) => void;
};

/**
 * Nombres de áreas que ya aparecen rotuladas en los planos físicos de la biblioteca.
 * Para estas áreas, no se duplica la etiqueta debajo del ícono.
 */
const KNOWN_PLAN_LABELS = new Set([
  "salas de profesores",
  "united way",
  "sala general",
  "la idea",
  "literatura",
  "coordinación de servicios",
  "sala oasis",
  "oficina biblioteca",
  "oficina de innovación educativa",
  "sala patrimonial",
  "el encuentro",
  "hall de biblioteca",
  "marketing zone",
  "salas de estudio",
  "sei",
  "oficina de vigilancia",
  "sala de escucha",
  "sala de video 1",
  "sala de video 2",
]);

export function isNameAlreadyOnPlan(label: string): boolean {
  if (!label) return false;
  return KNOWN_PLAN_LABELS.has(label.trim().toLowerCase());
}

/**
 * Retorna texto blanco o grafito garantizando contraste óptimo.
 * Nunca blanco sobre amarillo ni claro sobre colores pálidos.
 */
export function getContrastTextColor(hexColor: string): "#FFFFFF" | "#111827" {
  const clean = hexColor.replace("#", "");
  if (clean.length !== 6) return "#FFFFFF";
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "#FFFFFF";
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 165 ? "#111827" : "#FFFFFF";
}

export default function MapPin({
  shelf,
  selected,
  editMode,
  isDragging = false,
  allFloorShelves = [],
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onClick,
  onMove,
}: MapPinProps) {
  const category = deweyCategories.find((item) => shelf.categoryIds.includes(item.id));
  const color = shelf.color ?? category?.color ?? "#5454E9";
  const isArea = shelf.kind === "area";
  const contrastTextColor = getContrastTextColor(color);

  // ── Detección de superposición con pines previos en el mismo piso ──
  let overlapIndex = 0;
  if (allFloorShelves && allFloorShelves.length > 0) {
    const currentIndex = allFloorShelves.findIndex((s) => s.id === shelf.id);
    if (currentIndex > 0) {
      for (let i = 0; i < currentIndex; i++) {
        const other = allFloorShelves[i];
        if (Math.abs(shelf.x - other.x) < 3.2 && Math.abs(shelf.y - other.y) < 3.2) {
          overlapIndex++;
        }
      }
    }
  }

  // Desplazamiento si se superpone con otro pin (sin alterar sus coordenadas reales)
  const offsetDx = overlapIndex > 0 ? 30 * overlapIndex : 0;
  const offsetDy = overlapIndex > 0 ? -30 * overlapIndex : 0;

  // ── Movimiento accesible con flechas del teclado ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!editMode || !onMove) return;
    const step = e.shiftKey ? 2.0 : 0.5;
    let newX = shelf.x;
    let newY = shelf.y;

    if (e.key === "ArrowUp") {
      newY = Math.max(2, Math.min(98, Number((shelf.y - step).toFixed(1))));
    } else if (e.key === "ArrowDown") {
      newY = Math.max(2, Math.min(98, Number((shelf.y + step).toFixed(1))));
    } else if (e.key === "ArrowLeft") {
      newX = Math.max(2, Math.min(98, Number((shelf.x - step).toFixed(1))));
    } else if (e.key === "ArrowRight") {
      newX = Math.max(2, Math.min(98, Number((shelf.x + step).toFixed(1))));
    } else {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    onMove(shelf.id, newX, newY);
  };

  const showAreaLabel = isArea && !isNameAlreadyOnPlan(shelf.label);
  const showDeweyBadge = !editMode && !isArea && shelf.deweyRanges && shelf.deweyRanges.length > 0;

  return (
    <div
      style={{
        position: "absolute",
        left: `${shelf.x}%`,
        top: `${shelf.y}%`,
        zIndex: isDragging ? 50 : selected ? 40 : 20,
        pointerEvents: "none",
      }}
    >
      {/* ── LÍNEA GUÍA SI HAY SUPERPOSICIÓN ── */}
      {overlapIndex > 0 && (
        <svg
          className="pointer-events-none absolute overflow-visible"
          style={{
            left: 0,
            top: 0,
            zIndex: 10,
          }}
        >
          {/* Punto de anclaje exacto en (shelf.x, shelf.y) */}
          <rect x="-2" y="-2" width="4" height="4" fill="#030712" />
          {/* Línea guía discontinua recta */}
          <line
            x1="0"
            y1="0"
            x2={offsetDx}
            y2={offsetDy}
            stroke="#030712"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
        </svg>
      )}

      {/* ── BOTÓN INTERACTIVO DEL PIN ── */}
      <button
        type="button"
        tabIndex={0}
        aria-label={
          isArea
            ? `Área ${shelf.label}`
            : `Estantería ${shelf.label}, signatura ${shelf.deweyRanges.join(", ")}`
        }
        aria-pressed={selected}
        onPointerDown={(e) => onPointerDown?.(e, shelf)}
        onPointerMove={(e) => onPointerMove?.(e, shelf)}
        onPointerUp={(e) => onPointerUp?.(e, shelf)}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(shelf);
        }}
        onKeyDown={handleKeyDown}
        className={`pointer-events-auto group absolute select-none focus:outline-none ${
          editMode ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-pointer"
        }`}
        style={{
          transform: `translate(${offsetDx}px, ${offsetDy}px) ${
            isDragging ? "scale(1.12) translateY(-4px)" : "scale(1)"
          }`,
          transition: isDragging ? "none" : "transform 0.15s ease",
          touchAction: "none",
          borderRadius: 0,
        }}
      >
        {isArea ? (
          /* ── PIN DE ÁREA (el centro cae exactamente en shelf.x, shelf.y) ── */
          <div
            className="relative flex flex-col items-center"
            style={{
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={`flex size-8 items-center justify-center border-2 bg-white ${
                selected
                  ? "ring-2 ring-gray-950 ring-offset-1"
                  : "focus-visible:ring-2 focus-visible:ring-gray-950"
              }`}
              style={{
                borderColor: color,
                borderRadius: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="3" y="6" width="12" height="7" stroke={color} strokeWidth="1.5" />
                <circle cx="6" cy="4" r="1.25" fill={color} />
                <circle cx="12" cy="4" r="1.25" fill={color} />
                <circle cx="6" cy="15" r="1.25" fill={color} />
                <circle cx="12" cy="15" r="1.25" fill={color} />
              </svg>
            </div>

            {/* Etiqueta solo si el nombre no está ya impreso en el plano */}
            {showAreaLabel && (
              <span
                className="pointer-events-none absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-950 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-sm"
                style={{ borderRadius: 0 }}
              >
                {shelf.label}
              </span>
            )}
          </div>
        ) : (
          /* ── PIN DE ESTANTERÍA (la punta inferior del triángulo cae exactamente en shelf.x, shelf.y) ── */
          <div
            className="relative flex flex-col items-center"
            style={{
              transform: "translate(-50%, -100%)",
            }}
          >
            {/* Cuerpo cuadrado del pin: siempre muestra la etiqueta (T1), nunca lápiz */}
            <div
              className={`flex h-7 min-w-[28px] px-1.5 items-center justify-center border border-white text-[8.5px] font-black tracking-tight ${
                selected
                  ? "ring-2 ring-gray-950 ring-offset-1"
                  : "focus-visible:ring-2 focus-visible:ring-gray-950"
              }`}
              style={{
                backgroundColor: color,
                color: contrastTextColor,
                borderRadius: 0,
              }}
            >
              {shelf.label}
            </div>

            {/* Aguja triangular cuya punta inferior coincide con (0, 0) */}
            <div
              className="size-0 border-x-[5px] border-t-[6px] border-x-transparent"
              style={{
                borderTopColor: color,
                marginTop: "-1px",
              }}
            />

            {/* 
              Etiqueta Dewey: posicionada de forma absoluta debajo de la aguja 
              para que NUNCA altere la altura ni desplace verticalmente la punta del pin 
            */}
            {showDeweyBadge && (
              <span
                className="pointer-events-none absolute top-[calc(100%+2px)] left-1/2 -translate-x-1/2 whitespace-nowrap border border-gray-300 bg-white px-1 py-[1px] text-[8px] font-bold text-gray-900 shadow-sm"
                style={{ borderRadius: 0 }}
              >
                {shelf.deweyRanges[0]}
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}

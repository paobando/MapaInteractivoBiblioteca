import { useRef } from "react";
import { deweyCategories, type Shelf } from "../data/libraryData";
import piso1 from "@/imports/Piso_uno.png";
import piso2 from "@/imports/Piso_2.png";
import piso3 from "@/imports/Piso_tres.png";

const floorImages: Record<number, string> = { 1: piso1, 2: piso2, 3: piso3 };

type Props = {
  floor: number;
  shelves: Shelf[];
  editMode: boolean;
  onShelfClick: (shelf: Shelf) => void;
  onShelfMove: (id: string, x: number, y: number) => void;
  onMapClick: (x: number, y: number) => void;
  selectedShelf: Shelf | null;
};

export default function FloorMap({
  floor, shelves = [], editMode, onShelfClick, onShelfMove, onMapClick, selectedShelf,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: string } | null>(null);

  const floorShelves = shelves.filter((s) => s.floor === floor);

  const getCategoryColor = (shelf: Shelf) => {
    if (shelf.color) return shelf.color;
    const cat = deweyCategories.find((c) => shelf.categoryIds.includes(c.id));
    return cat?.color ?? "#5454E9";
  };

  const getPosition = (e: React.PointerEvent): { x: number; y: number } | null => {
    if (!overlayRef.current) return null;
    const rect = overlayRef.current.getBoundingClientRect();
    return {
      x: Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  };

  const handlePinPointerDown = (e: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    draggingRef.current = { id: shelf.id };
  };

  const handlePinPointerMove = (e: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) => {
    if (!editMode || !draggingRef.current || draggingRef.current.id !== shelf.id) return;
    const pos = getPosition(e);
    if (pos) onShelfMove(shelf.id, pos.x, pos.y);
  };

  const handlePinPointerUp = () => {
    draggingRef.current = null;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editMode) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onMapClick(x, y);
  };

  return (
    <div className="relative w-full h-full">
      <img
        src={floorImages[floor]}
        alt={`Plano piso ${floor}`}
        className="w-full h-full object-contain select-none"
        draggable={false}
      />

      {/* Pin overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        onClick={handleOverlayClick}
        style={{ cursor: editMode ? "crosshair" : "default" }}
      >
        {editMode && (
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              border: "2px dashed #5454E955",
              background: "rgba(84,84,233,0.02)",
            }}
          />
        )}

        {floorShelves.map((shelf) => {
          const selected = selectedShelf?.id === shelf.id;
          const color = getCategoryColor(shelf);

          return (
            <button
              key={shelf.id}
              onPointerDown={(e) => handlePinPointerDown(e, shelf)}
              onPointerMove={(e) => handlePinPointerMove(e, shelf)}
              onPointerUp={handlePinPointerUp}
              onClick={(e) => {
                e.stopPropagation();
                if (!draggingRef.current) onShelfClick(shelf);
              }}
              style={{
                position: "absolute",
                left: `${shelf.x}%`,
                top: `${shelf.y}%`,
                transform: "translate(-50%, -100%)",
                zIndex: selected ? 20 : 10,
                cursor: editMode ? "grab" : "pointer",
                touchAction: "none",
              }}
              className="group focus:outline-none"
            >
              {/* Ring pulse on selected */}
              {selected && (
                <div
                  className="absolute animate-ping"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: `${color}44`,
                    top: 0,
                    left: 0,
                  }}
                />
              )}

              {/* Pin body */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 0,
                  backgroundColor: selected ? "#1a1a2e" : color,
                  border: "none",
                  boxShadow: selected
                    ? `0 0 0 3px ${color}44, 0 6px 16px rgba(0,0,0,0.3)`
                    : editMode
                    ? `0 3px 10px rgba(0,0,0,0.22), 0 0 0 1.5px ${color}66`
                    : "0 3px 10px rgba(0,0,0,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s, border 0.15s",
                  transform: selected ? "scale(1.18)" : "scale(1)",
                  position: "relative",
                }}
                className="group-hover:scale-110"
              >
                {editMode ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M7 2a1 1 0 0 1 1.414 1.414L3.414 8 1.5 8.5l.5-1.914L7 2Z"
                      stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="font-extrabold text-white leading-none select-none" style={{ fontSize: "7px" }}>
                    {shelf.label}
                  </span>
                )}
              </div>

              {/* Pin needle */}
              <div
                style={{
                  width: 0, height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: `7px solid ${selected ? "#1a1a2e" : color}`,
                  margin: "0 auto", marginTop: "-1px",
                }}
              />

              {/* Label chip below needle */}
              <div
                style={{
                  marginTop: 2,
                  backgroundColor: "white",
                  border: `1px solid ${color}55`,
                  borderRadius: 6,
                  padding: "1px 5px",
                  fontSize: 8,
                  fontWeight: 700,
                  color: color,
                  textAlign: "center",
                  lineHeight: 1.4,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                {shelf.label}
              </div>

              {/* Hover tooltip */}
              {!editMode && (
                <div
                  className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap"
                  style={{
                    bottom: "calc(100% + 6px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#1a1a2e",
                    color: "white",
                    fontSize: 11,
                    borderRadius: 10,
                    padding: "6px 10px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    zIndex: 30,
                  }}
                >
                  <p className="font-bold">{shelf.label}</p>
                  {shelf.kind !== "area" && (
                    <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{shelf.deweyRanges[0]}</p>
                  )}
                  <div style={{
                    position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
                    borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
                    borderTop: "5px solid #1a1a2e",
                  }} />
                </div>
              )}
            </button>
          );
        })}

        {/* Piso 1 note */}
        {floor === 1 && (
          <div className="absolute inset-x-0 bottom-5 flex justify-center pointer-events-none">
            <div style={{
              backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 20,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.8)",
              padding: "10px 20px", textAlign: "center",
            }}>
              <p className="text-sm font-bold text-gray-700">Piso 1 — Área administrativa y de acceso</p>
              <p className="text-xs text-gray-400 mt-0.5">La colección de libros se encuentra en los pisos 2 y 3</p>
            </div>
          </div>
        )}

        {/* Edit mode: click-to-add hint */}
        {editMode && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              backgroundColor: "#5454E9",
              color: "white",
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 11,
              fontWeight: 600,
              boxShadow: "0 4px 16px #5454E944",
            }}
          >
            Haz clic en el plano para agregar un pin · Arrastra para mover
          </div>
        )}
      </div>
    </div>
  );
}

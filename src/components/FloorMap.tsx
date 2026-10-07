import { useRef } from "react";
import { type Shelf } from "../data/libraryData";
import MapPin from "./MapPin";
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
  const draggingRef = useRef<{ id: string; moved: boolean } | null>(null);

  const floorShelves = shelves.filter((s) => s.floor === floor);

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
    draggingRef.current = { id: shelf.id, moved: false };
  };

  const handlePinPointerMove = (e: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) => {
    if (!editMode || !draggingRef.current || draggingRef.current.id !== shelf.id) return;
    const pos = getPosition(e);
    if (pos) {
      draggingRef.current.moved = true;
      onShelfMove(shelf.id, pos.x, pos.y);
    }
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
          <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-icesi-orange/60" />
        )}

        {floorShelves.map((shelf) => {
          const selected = selectedShelf?.id === shelf.id;
          const isDragging = draggingRef.current?.id === shelf.id && draggingRef.current.moved;

          return (
            <MapPin
              key={shelf.id}
              shelf={shelf}
              selected={selected}
              editMode={editMode}
              isDragging={isDragging}
              allFloorShelves={floorShelves}
              onPointerDown={(e) => handlePinPointerDown(e, shelf)}
              onPointerMove={(e) => handlePinPointerMove(e, shelf)}
              onPointerUp={handlePinPointerUp}
              onClick={(clickedShelf) => {
                if (!draggingRef.current?.moved) onShelfClick(clickedShelf);
              }}
              onMove={onShelfMove}
            />
          );
        })}

        {/* Piso 1 note */}
        {floor === 1 && (
          <div className="absolute inset-x-0 bottom-5 flex justify-center pointer-events-none">
            <div
              className="bg-white/95 px-5 py-2.5 text-center shadow-md border border-gray-200"
              style={{ borderRadius: 0 }}
            >
              <p className="text-sm font-bold text-gray-800">Piso 1 — Área administrativa y de acceso</p>
              <p className="text-xs text-gray-500 mt-0.5">La colección de libros se encuentra en los pisos 2 y 3</p>
            </div>
          </div>
        )}

        {/* Edit mode: click-to-add hint */}
        {editMode && (
          <div
            className="pointer-events-none absolute bottom-3 right-3 bg-gray-950 text-white px-2.5 py-1 text-[11px] font-bold shadow-md border border-gray-800"
            style={{ borderRadius: 0 }}
          >
            Clic en plano para agregar · Arrastra para mover
          </div>
        )}
      </div>
    </div>
  );
}

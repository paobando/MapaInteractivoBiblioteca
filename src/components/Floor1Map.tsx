import { useEffect, useRef, useState } from "react";
import { type Shelf } from "../data/libraryData";
import MapPin from "./MapPin";

const DESIGN_W = 752;
const DESIGN_H = 674;

type Props = {
  shelves: Shelf[];
  editMode: boolean;
  onShelfClick: (shelf: Shelf) => void;
  onShelfMove: (id: string, x: number, y: number) => void;
  onMapClick: (x: number, y: number) => void;
  selectedShelf: Shelf | null;
};

function FloorPlan() {
  return (
    <div className="relative size-full bg-white" aria-label="Plano del primer piso">
      <div className="floor-grid-pattern absolute left-[309px] top-[54px] h-[165px] w-[174px]" />
      <div className="floor-grid-pattern absolute left-[309px] top-[466px] h-[165px] w-[170px]" />

      <div className="absolute left-[486px] top-[54px] flex h-[165px] w-[124px] items-center justify-center bg-[#f6f6f6]">
        <span className="w-[91px] text-center font-['Plus_Jakarta_Sans:Regular'] text-[12px] text-black">Oficina Biblioteca</span>
      </div>
      <div className="absolute left-[62px] top-[54px] flex h-[165px] w-[244px] items-center justify-center bg-[#f6f6f6]">
        <span className="w-[137px] font-['Plus_Jakarta_Sans:Regular'] text-[12px] text-black">
          Oficina de innovación educativa
        </span>
      </div>
      <div className="absolute left-[112px] top-[466px] flex h-[165px] w-[194px] items-center justify-center bg-[#f6f6f6]">
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[12px] text-black">Sala Oasis</span>
      </div>
      <div className="absolute left-[62px] top-[466px] flex h-[165px] w-[47px] items-center justify-center bg-[#f6f6f6]">
        <span className="-rotate-90 whitespace-nowrap font-['Plus_Jakarta_Sans:Regular'] text-[12px] text-black">Sala patrimonial</span>
      </div>
      <div className="absolute left-[309px] top-[542px] h-[89px] w-[71px] bg-[#f6f6f6]" />
      <div className="absolute left-[321px] top-[568px] flex w-[46px] flex-col items-center gap-[3px]">
        <img src="/assets/48d4c.svg" alt="" width="21" height="21" />
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[10px] text-black">Escaleras</span>
      </div>
      <div className="absolute left-[443px] top-[527px] h-[39px] w-[36px] bg-[#f6f6f6]" />
      <div className="absolute left-[433px] top-[570px] h-[60px] w-[46px] bg-[#f6f6f6]" />
      <img
        className="absolute left-[449px] top-[535px]"
        src="/assets/34366.svg"
        alt="Acceso para personas con movilidad reducida"
        width="24"
        height="24"
      />
      <img
        className="absolute left-[445px] top-[590px]"
        src="/assets/38d0f.svg"
        alt="Cafetería"
        width="24"
        height="24"
      />
      <img className="absolute left-[385px] top-[465px]" src="/assets/40496.svg" alt="" width="32" height="32" />
      <div className="absolute left-[386px] top-[542px] flex size-[42px] items-center justify-center bg-[#f6f6f6]">
        <img src="/assets/912b0.svg" alt="Ascensor" width="23" height="28.1414" />
      </div>
      <div className="absolute left-[310px] top-[54px] h-[89px] w-[92px] bg-[#f6f6f6]" />
      <div className="absolute left-[333px] top-[80px] flex w-[46px] flex-col items-center gap-[3px]">
        <img src="/assets/48d4c.svg" alt="" width="21" height="21" />
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[10px] text-black">Escaleras</span>
      </div>
      <div className="absolute left-[482px] top-[466px] flex h-[165px] w-[16px] items-center justify-center bg-black">
        <span className="-rotate-90 whitespace-nowrap font-['Plus_Jakarta_Sans:SemiBold'] text-[8px] text-white">Salas de profesores</span>
      </div>
      <div className="absolute left-[498px] top-[466px] flex h-[165px] w-[48px] items-center justify-center bg-[#f6f6f6]">
        <span className="-rotate-90 whitespace-nowrap font-['Plus_Jakarta_Sans:Regular'] text-[12px] text-black">El encuentro</span>
      </div>
      <div className="absolute left-[309px] top-[223px] flex h-[239px] w-[300px] items-center justify-center bg-[#f6f6f6]">
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[12px] text-black">Hall de biblioteca</span>
      </div>
      <div className="absolute left-[553px] top-[465px] flex h-[165px] w-[133px] items-center justify-center bg-[#f6f6f6]">
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[12px] text-black">Marketing zone</span>
      </div>

      <div className="absolute left-[309px] top-[223px] h-[8px] w-[120px] bg-icesi-orange" />
      <div className="absolute left-[309px] top-[454px] h-[8px] w-[120px] bg-icesi-orange" />
      <div className="absolute left-[309px] top-[277px] h-[131px] w-[8px] bg-icesi-orange" />
      <div className="absolute left-[601px] top-[277px] h-[131px] w-[8px] bg-icesi-orange" />

      {[
        { top: 54, label: "103B" },
        { top: 111, label: "102B" },
        { top: 167, label: "101B" },
      ].map((room) => (
        <div
          key={room.label}
          className="absolute left-[633px] flex h-[52px] w-[53px] items-center justify-center bg-[#f6f6f6]"
          style={{ top: room.top }}
        >
          <span className="font-['Plus_Jakarta_Sans:Regular'] text-[12px] text-black">{room.label}</span>
        </div>
      ))}

      <div className="absolute left-[613px] top-[54px] flex h-[165px] w-[16px] items-center justify-center bg-black">
        <span className="-rotate-90 whitespace-nowrap font-['Plus_Jakarta_Sans:SemiBold'] text-[8px] text-white">Salas de estudio</span>
      </div>
    </div>
  );
}

export default function Floor1Map({
  shelves = [],
  editMode,
  onShelfClick,
  onShelfMove,
  onMapClick,
  selectedShelf,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<string | null>(null);
  const movedRef = useRef(false);
  const [{ scale, ox, oy }, setTransform] = useState({ scale: 1, ox: 0, oy: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const nextScale = Math.min(width / DESIGN_W, height / DESIGN_H);
      setTransform({
        scale: nextScale,
        ox: Math.max(0, (width - DESIGN_W * nextScale) / 2),
        oy: Math.max(0, (height - DESIGN_H * nextScale) / 2),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const getPosition = (event: React.PointerEvent) => {
    if (!overlayRef.current) return null;
    const rect = overlayRef.current.getBoundingClientRect();
    return {
      x: Math.max(2, Math.min(98, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(2, Math.min(98, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  };

  const scaledWidth = DESIGN_W * scale;
  const scaledHeight = DESIGN_H * scale;
  const floorShelves = shelves.filter((shelf) => shelf.floor === 1);

  return (
    <div ref={containerRef} className="relative size-full overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute"
        style={{ left: ox, top: oy, width: scaledWidth, height: scaledHeight }}
      >
        <div
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <FloorPlan />
        </div>
      </div>

      <div
        ref={overlayRef}
        className="absolute"
        onClick={(event) => {
          if (!editMode || (event.target as HTMLElement).closest("button")) return;
          const rect = event.currentTarget.getBoundingClientRect();
          onMapClick(
            ((event.clientX - rect.left) / rect.width) * 100,
            ((event.clientY - rect.top) / rect.height) * 100,
          );
        }}
        style={{
          left: ox,
          top: oy,
          width: scaledWidth,
          height: scaledHeight,
          cursor: editMode ? "crosshair" : "default",
        }}
      >
        {editMode && <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-icesi-orange/60" />}

        {floorShelves.map((shelf) => {
          const selected = selectedShelf?.id === shelf.id;
          const isDragging = draggingRef.current === shelf.id;

          return (
            <MapPin
              key={shelf.id}
              shelf={shelf}
              selected={selected}
              editMode={editMode}
              isDragging={isDragging}
              allFloorShelves={floorShelves}
              onPointerDown={(event) => {
                if (!editMode) return;
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                movedRef.current = false;
                draggingRef.current = shelf.id;
              }}
              onPointerMove={(event) => {
                if (!editMode || draggingRef.current !== shelf.id) return;
                const position = getPosition(event);
                if (!position) return;
                movedRef.current = true;
                onShelfMove(shelf.id, position.x, position.y);
              }}
              onPointerUp={() => {
                draggingRef.current = null;
              }}
              onClick={(shelf) => {
                if (!movedRef.current) onShelfClick(shelf);
                movedRef.current = false;
              }}
              onMove={onShelfMove}
            />
          );
        })}

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

import { useEffect, useRef, useState } from "react";
import { deweyCategories, type Shelf } from "../data/libraryData";

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

const studyRooms = [
  { x: 67, y: 54, label: "318B" },
  { x: 123, y: 54, label: "317B" },
  { x: 466, y: 54, label: "316B" },
  { x: 522, y: 54, label: "315B" },
  { x: 578, y: 54, label: "314B" },
  { x: 634, y: 54, label: "313B" },
  { x: 466, y: 567, label: "312B" },
  { x: 522, y: 567, label: "311B" },
  { x: 578, y: 567, label: "310B" },
  { x: 634, y: 567, label: "309B" },
];

function FloorPlan() {
  return (
    <div className="relative size-full bg-white" aria-label="Plano del tercer piso">
      <div className="floor-pattern absolute left-[67px] top-[46px] h-[582px] w-[220px]" />
      <div className="floor-pattern absolute left-[466px] top-[46px] h-[582px] w-[220px]" />
      <div className="floor-pattern absolute left-[287px] top-[147px] h-[140px] w-[179px]" />
      <div className="floor-pattern absolute left-[287px] top-[404px] h-[114px] w-[179px]" />

      <div className="absolute left-[187px] top-[313px] flex h-[68px] w-[64px] items-center justify-center bg-[#f6f6f6]">
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">SEI</span>
      </div>
      <div className="absolute left-[66px] top-[519px] flex h-[111px] w-[61px] items-center justify-center bg-[#f6f6f6]">
        <span className="w-[42px] font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">
          Oficina de vigilancia
        </span>
      </div>
      <div className="absolute left-[226px] top-[483px] flex h-[147px] w-[61px] items-center justify-center bg-[#f6f6f6]">
        <span className="w-[36px] font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">
          Sala de escucha
        </span>
      </div>
      <div className="absolute left-[297px] top-[541px] flex h-[89px] w-[71px] items-center justify-center bg-[#f6f6f6]">
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">Escaleras</span>
      </div>
      <div className="absolute left-[291px] top-[54px] flex h-[89px] w-[107px] items-center justify-center bg-[#f6f6f6]">
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[10px] text-black">Escaleras</span>
      </div>

      <div className="absolute left-[403px] top-[133px] flex size-[52px] items-center justify-center bg-icesi-green">
        <img src="/assets/9aed8.svg" alt="Baño de hombres" width="24" height="24" />
      </div>
      <div className="absolute left-[403px] top-[240px] h-[6px] w-[52px] bg-black" />

      {studyRooms.map((room) => (
        <div
          key={room.label}
          className="absolute flex h-[60px] w-[52px] items-center justify-center bg-[#f6f6f6]"
          style={{ left: room.x, top: room.y }}
        >
          <span className="font-['Plus_Jakarta_Sans:Regular'] text-[12px] text-black">
            {room.label}
          </span>
        </div>
      ))}

      <div className="absolute left-[179px] top-[54px] flex h-[60px] w-[52px] items-center justify-center bg-[#f6f6f6]">
        <span className="w-[36px] text-center font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">
          Sala de video 2
        </span>
      </div>
      <div className="absolute left-[235px] top-[54px] flex h-[60px] w-[52px] items-center justify-center bg-[#f6f6f6]">
        <span className="w-[36px] text-center font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">
          Sala de video 1
        </span>
      </div>

      <div className="absolute left-[386px] top-[541px] flex size-[42px] items-center justify-center bg-[#f6f6f6]">
        <img src="/assets/2f834.svg" alt="Ascensor" width="23" height="28" />
      </div>

      <div className="absolute left-[67px] top-[45px] flex h-[25px] w-[220px] items-center justify-center bg-black">
        <span className="font-['Plus_Jakarta_Sans:SemiBold'] text-[12px] text-white">Salas de estudio</span>
      </div>
      <div className="absolute left-[466px] top-[45px] flex h-[25px] w-[220px] items-center justify-center bg-black">
        <span className="font-['Plus_Jakarta_Sans:SemiBold'] text-[12px] text-white">Salas de estudio</span>
      </div>
      <div className="absolute left-[466px] top-[611px] flex h-[25px] w-[220px] items-center justify-center bg-black">
        <span className="font-['Plus_Jakarta_Sans:SemiBold'] text-[12px] text-white">Salas de estudio</span>
      </div>
    </div>
  );
}

export default function Floor3Map({
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
  const floorShelves = shelves.filter((shelf) => shelf.floor === 3);

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
          const category = deweyCategories.find((item) => shelf.categoryIds.includes(item.id));
          const color = shelf.color ?? category?.color ?? "#5454E9";
          const isArea = shelf.kind === "area";

          return (
            <button
              key={shelf.id}
              type="button"
              aria-label={isArea ? `Área ${shelf.label}` : `${shelf.label}, signatura ${shelf.deweyRanges.join(", ")}`}
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
              onClick={(event) => {
                event.stopPropagation();
                if (!movedRef.current) onShelfClick(shelf);
                movedRef.current = false;
              }}
              className={`group absolute z-10 -translate-x-1/2 focus:outline-none ${
                isArea ? "-translate-y-1/2" : "-translate-y-full"
              }`}
              style={{
                left: `${shelf.x}%`,
                top: `${shelf.y}%`,
                cursor: editMode ? "grab" : "pointer",
                touchAction: "none",
              }}
            >
              {isArea ? (
                <>
                  <span
                    className="flex size-8 items-center justify-center border-2 bg-white shadow-md transition-transform group-hover:scale-110"
                    style={{
                      borderColor: selected ? "#111827" : color,
                      boxShadow: selected ? `0 0 0 4px ${color}38` : undefined,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <rect x="3" y="6" width="12" height="7" stroke={color} strokeWidth="1.5" />
                      <circle cx="6" cy="4" r="1.25" fill={color} />
                      <circle cx="12" cy="4" r="1.25" fill={color} />
                      <circle cx="6" cy="15" r="1.25" fill={color} />
                      <circle cx="12" cy="15" r="1.25" fill={color} />
                    </svg>
                  </span>
                  <span className="mt-1 block whitespace-nowrap bg-gray-950 px-2 py-1 text-[9px] font-semibold text-white shadow-md">
                    {shelf.label}
                  </span>
                </>
              ) : (
                <>
                  <span
                    className="flex size-8 items-center justify-center border-2 border-white text-[8px] font-extrabold text-white shadow-lg transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: selected ? "#111827" : color,
                      transform: selected ? "scale(1.16)" : undefined,
                      boxShadow: selected ? `0 0 0 4px ${color}38` : undefined,
                    }}
                  >
                    {shelf.label}
                  </span>
                  <span
                    className="mx-auto block size-0 border-x-[5px] border-t-[7px] border-x-transparent"
                    style={{ borderTopColor: selected ? "#111827" : color }}
                  />
                  {!editMode && (
                    <span className="mt-1 block whitespace-nowrap border border-gray-200 bg-white px-1.5 py-0.5 text-[8px] font-bold text-gray-700 shadow-sm">
                      {shelf.deweyRanges[0]}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}

        {editMode && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 bg-icesi-orange px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg">
            Clic para agregar · Arrastra para mover
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { deweyCategories, type Shelf } from "../data/libraryData";

const DESIGN_W = 732;
const DESIGN_H = 684;
const PLAN_X = 25;
const PLAN_Y = 22;
const PLAN_W = 690;
const PLAN_H = 640;

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
    <div className="relative size-full bg-white" aria-label="Plano del segundo piso">
      <div className="floor-pattern absolute left-[50px] top-[410px] h-[220px] w-[243px]" />
      <div className="floor-pattern absolute left-[459px] top-[411px] h-[220px] w-[223px]" />
      <div className="floor-pattern absolute left-[297px] top-[147px] h-[391px] w-[158px]" />
      <div className="floor-pattern absolute left-[174px] top-[237px] h-[42px] w-[119px]" />
      <div className="floor-pattern absolute left-[459px] top-[127px] h-[157px] w-[64px]" />

      <div className="absolute left-[403px] top-[127px] flex size-[52px] items-center justify-center bg-icesi-purple">
        <img src="/assets/0bc1b.svg" alt="Baño de mujeres" width="24" height="24" />
      </div>
      <div className="absolute left-[174px] top-[54px] h-[179px] w-[119px] bg-[#f6f6f6]" />
      <div className="absolute left-[528px] top-[54px] h-[230px] w-[154px] bg-[#f6f6f6]" />
      <div className="absolute left-[459px] top-[54px] h-[69px] w-[64px] bg-[#f6f6f6]" />
      <div className="absolute left-[297px] top-[541px] h-[89px] w-[71px] bg-[#f6f6f6]" />
      <div className="absolute left-[297px] top-[54px] h-[89px] w-[101px] bg-[#f6f6f6]" />
      <div className="absolute left-[75px] top-[54px] h-[225px] w-[95px] bg-[#f6f6f6]" />
      <div className="absolute left-[196px] top-[470px] h-[160px] w-[97px] bg-[#f6f6f6]" />
      <div className="absolute left-[574px] top-[548px] h-[60px] w-[52px] bg-[#f6f6f6]" />
      <div className="absolute left-[469px] top-[512px] h-[31px] w-[45px] bg-[#f6f6f6]" />
      <div className="absolute left-[630px] top-[548px] h-[60px] w-[52px] bg-[#f6f6f6]" />
      <div className="absolute left-[469px] top-[548px] h-[60px] w-[101px] bg-[#f6f6f6]" />
      {[410, 466, 522, 578].map((top) => (
        <div key={top} className="absolute left-[75px] h-[52px] w-[60px] bg-[#f6f6f6]" style={{ top }} />
      ))}
      <div className="absolute left-[403px] top-[240px] h-[6px] w-[52px] bg-black" />

      <div className="absolute left-[50px] top-[410px] flex h-[220px] w-[25px] items-center justify-center bg-black">
        <span className="-rotate-90 whitespace-nowrap font-['Plus_Jakarta_Sans:SemiBold'] text-[12px] text-white">
          Salas de estudio
        </span>
      </div>
      <div className="absolute left-[459px] top-[606px] flex h-[25px] w-[223px] items-center justify-center bg-black">
        <span className="font-['Plus_Jakarta_Sans:SemiBold'] text-[12px] text-white">Salas de estudio</span>
      </div>
      <div className="absolute left-[50px] top-[54px] flex h-[225px] w-[25px] items-center justify-center bg-black">
        <span className="-rotate-90 whitespace-nowrap font-['Plus_Jakarta_Sans:SemiBold'] text-[12px] text-white">
          Salas de profesores
        </span>
      </div>

      <span className="map-label left-[89px] top-[428px]">205B</span>
      <span className="map-label left-[89px] top-[484px]">206B</span>
      <span className="map-label left-[89px] top-[540px]">207B</span>
      <span className="map-label left-[89px] top-[596px]">208B</span>
      <span className="map-label left-[222px] top-[535px] w-[44px]">Sala general</span>
      <span className="map-label left-[309px] top-[579px]" style={{ fontSize: 10 }}>Escaleras</span>
      <span className="map-label left-[100px] top-[159px] w-[44px]">La idea</span>
      <span className="map-label left-[212px] top-[139px]" style={{ fontSize: 10 }}>Literatura</span>
      <span className="map-label left-[571px] top-[161px]">United Way</span>
      <span className="map-label left-[463px] top-[78px] w-[55px]" style={{ fontSize: 8 }}>Coordinación de servicios</span>
      <span className="map-label left-[324px] top-[92px]" style={{ fontSize: 10 }}>Escaleras</span>
      <span className="map-label left-[503px] top-[572px]">204B</span>
      <span className="map-label left-[584px] top-[572px]">203B</span>
      <span className="map-label left-[640px] top-[572px]">202B</span>

      <div className="absolute left-[386px] top-[541px] flex size-[42px] items-center justify-center bg-[#f6f6f6]">
        <img src="/assets/43a4f.svg" alt="Ascensor" width="23" height="28" />
      </div>
    </div>
  );
}

export default function Floor2Map({
  shelves = [],
  editMode,
  onShelfClick,
  onShelfMove,
  onMapClick,
  selectedShelf,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: string; moved: boolean } | null>(null);
  const movedPinRef = useRef(false);
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

  const floorShelves = shelves.filter((shelf) => shelf.floor === 2);

  const getPosition = (event: React.PointerEvent) => {
    if (!overlayRef.current) return null;
    const rect = overlayRef.current.getBoundingClientRect();
    return {
      x: Math.max(2, Math.min(98, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(2, Math.min(98, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  };

  const handlePinDown = (event: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) => {
    if (!editMode) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    movedPinRef.current = false;
    draggingRef.current = { id: shelf.id, moved: false };
  };

  const handlePinMove = (event: React.PointerEvent<HTMLButtonElement>, shelf: Shelf) => {
    if (!editMode || draggingRef.current?.id !== shelf.id) return;
    const position = getPosition(event);
    if (!position) return;
    draggingRef.current.moved = true;
    movedPinRef.current = true;
    onShelfMove(shelf.id, position.x, position.y);
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!editMode || (event.target as HTMLElement).closest("button")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    onMapClick(
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100,
    );
  };

  const scaledWidth = DESIGN_W * scale;
  const scaledHeight = DESIGN_H * scale;

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
          <div
            className="absolute"
            style={{ left: PLAN_X, top: PLAN_Y, width: PLAN_W, height: PLAN_H }}
          >
            <FloorPlan />
          </div>
        </div>
      </div>

      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="absolute"
        style={{
          left: ox + PLAN_X * scale,
          top: oy + PLAN_Y * scale,
          width: PLAN_W * scale,
          height: PLAN_H * scale,
          cursor: editMode ? "crosshair" : "default",
        }}
      >
        {editMode && <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-icesi-orange/60" />}

        {floorShelves.map((shelf) => {
          const selected = selectedShelf?.id === shelf.id;
          const category = deweyCategories.find((item) => shelf.categoryIds.includes(item.id));
          const color = shelf.color ?? category?.color ?? "#5454E9";

          return (
            <button
              key={shelf.id}
              type="button"
              aria-label={
                shelf.kind === "area"
                  ? `Área ${shelf.label}`
                  : `${shelf.label}, signatura ${shelf.deweyRanges.join(", ")}`
              }
              onPointerDown={(event) => handlePinDown(event, shelf)}
              onPointerMove={(event) => handlePinMove(event, shelf)}
              onPointerUp={() => {
                draggingRef.current = null;
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (!movedPinRef.current) onShelfClick(shelf);
                movedPinRef.current = false;
              }}
              className={`group absolute z-10 -translate-x-1/2 focus:outline-none ${
                shelf.kind === "area" ? "-translate-y-1/2" : "-translate-y-full"
              }`}
              style={{
                left: `${shelf.x}%`,
                top: `${shelf.y}%`,
                cursor: editMode ? "grab" : "pointer",
                touchAction: "none",
              }}
            >
              {shelf.kind === "area" ? (
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
                    {editMode ? (
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                          d="M9.5 2a1.5 1.5 0 0 1 2.121 2.121L5.121 10.62l-2.828.707.707-2.828L9.5 2Z"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : shelf.label}
                  </span>
                  <span
                    className="mx-auto block size-0 border-x-[5px] border-t-[7px] border-x-transparent"
                    style={{ borderTopColor: selected ? "#111827" : color }}
                  />
                </>
              )}
              {!editMode && shelf.kind !== "area" && (
                <span className="mt-1 block whitespace-nowrap border border-gray-200 bg-white px-1.5 py-0.5 text-[8px] font-bold text-gray-700 shadow-sm">
                  {shelf.deweyRanges[0]}
                </span>
              )}
            </button>
          );
        })}

        {editMode && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 bg-icesi-orange px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg">
            Clic para agregar · Arrastra pins o áreas para mover
          </div>
        )}

      </div>
    </div>
  );
}

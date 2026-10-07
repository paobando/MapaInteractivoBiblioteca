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

type Box = [left: number, top: number, width: number, height: number];

/* Mesa rectangular con tres sillas por lado */
function tableWithChairs(left: number, top: number, vertical: boolean, farGap = 25): Box[] {
  if (vertical) {
    return [
      [left, top, 24, 40],
      ...[0, 16, 32].flatMap((dy): Box[] => [[left - 9, top + dy, 8, 8], [left + 25, top + dy, 8, 8]]),
    ];
  }
  return [
    [left, top, 40, 24],
    ...[0, 16, 32].flatMap((dx): Box[] => [[left + dx, top - 9, 8, 8], [left + dx, top + farGap, 8, 8]]),
  ];
}

/* Estanterías, mesas, sillas y mobiliario (gris claro) */
const furniture: Box[] = [
  [200, 220, 8, 32], [98, 248, 8, 32], [106, 240, 32, 8], [200, 155, 8, 32],
  [208, 147, 32, 8], [500, 256, 8, 32], [508, 248, 32, 8], [587, 155, 8, 32],
  [595, 147, 32, 8], [545, 336, 8, 32], [513, 368, 32, 8], [650, 395, 8, 32],
  [618, 427, 32, 8], [208, 252, 53, 8], [182, 286, 53, 8], [182, 398, 53, 8],
  [174, 345, 8, 53], [587, 301, 8, 53], [595, 293, 53, 8], [495, 147, 53, 8],
  [466, 125, 8, 103], [278, 128, 8, 103], [678, 125, 8, 44], [678, 509, 8, 44],
  [678, 183, 8, 215], [525, 442, 53, 8], [497, 475, 53, 8], [597, 474, 53, 8],
  [578, 389, 8, 53], [589, 482, 8, 53], [489, 482, 8, 53], [587, 207, 8, 53],
  [95, 331, 53, 8], [103, 146, 53, 8], [95, 154, 8, 53], [218, 540, 8, 90],
  /* Mesas con sillas */
  ...tableWithChairs(108, 365, true),
  ...tableWithChairs(127, 171, true),
  ...tableWithChairs(230, 182, true),
  ...tableWithChairs(627, 234, true),
  ...tableWithChairs(540, 268, true),
  ...tableWithChairs(502, 318, true),
  ...tableWithChairs(617, 319, true),
  ...tableWithChairs(622, 494, true),
  ...tableWithChairs(510, 188, false),
  ...tableWithChairs(513, 503, false),
  ...tableWithChairs(516, 401, false, 26),
  /* Mesas pequeñas */
  [66, 255, 20, 20], [72, 246, 8, 8], [72, 276, 8, 8],
  [621, 174, 20, 20], [627, 165, 8, 8], [627, 195, 8, 8], [612, 180, 8, 8], [642, 180, 8, 8],
  [614, 390, 20, 20], [620, 381, 8, 8], [620, 411, 8, 8], [605, 396, 8, 8], [635, 396, 8, 8],
  /* Sofás junto a las escaleras */
  [295, 178, 12, 20], [295, 199, 12, 20], [290, 178, 4, 41],
  [309, 168, 20, 12], [330, 168, 20, 12], [309, 163, 41, 4],
  /* Columnas */
  [169, 284, 12, 12], [236, 284, 12, 12], [169, 399, 12, 12], [236, 399, 12, 12],
  [285, 274, 12, 12], [285, 398, 12, 12], [458, 276, 12, 12], [458, 398, 12, 12],
  [399, 278, 12, 12], [400, 396, 12, 12],
  /* Puestos junto a las líneas de estudio */
  ...[290, 304, 318, 332, 346, 360, 374, 388].flatMap((y): Box[] => [[281, y, 8, 8], [469, y, 8, 8]]),
  ...[304, 318, 332, 346, 360, 374, 388, 402, 416, 430, 444].flatMap((x): Box[] => [[x, 271, 8, 8], [x, 407, 8, 8]]),
  ...[331, 345, 359, 373, 387, 401, 415, 429, 443, 457, 471].map((y): Box => [75, y, 8, 8]),
];

/* Mesas redondas: [centroX, centroY, tamaño, rotación] */
type Round = [cx: number, cy: number, size: number, rotate: number];
const roundTables: Round[] = [
  [123.29, 461.76, 15, -5.47], [122.15, 449.82, 7, -5.47], [112.82, 467.79, 7, -5.47], [134.72, 465.69, 7, -5.47],
  [182.52, 485.78, 15, 34.12], [189.24, 475.85, 7, 34.12], [170.6, 483.75, 7, 34.12], [188.81, 496.09, 7, 34.12],
  [173.34, 547.54, 15, 4.46], [174.27, 535.57, 7, 4.46], [161.98, 551.66, 7, 4.46], [183.92, 553.38, 7, 4.46],
  [185.78, 602.8, 15, 34.12], [192.5, 592.86, 7, 34.12], [173.86, 600.76, 7, 34.12], [192.07, 613.1, 7, 34.12],
];

const studyRooms = [
  { x: 66, y: 64, label: "318B" },
  { x: 122, y: 64, label: "317B" },
  { x: 466, y: 64, label: "316B" },
  { x: 522, y: 64, label: "315B" },
  { x: 578, y: 64, label: "314B" },
  { x: 634, y: 64, label: "313B" },
  { x: 466, y: 558, label: "312B" },
  { x: 522, y: 558, label: "311B" },
  { x: 578, y: 558, label: "310B" },
  { x: 634, y: 558, label: "309B" },
];

function FloorPlan() {
  return (
    <div className="relative size-full bg-white" aria-label="Plano del tercer piso">
      <div className="floor-grid-pattern absolute left-[66px] top-[49px] h-[581px] w-[220px]" />
      <div className="floor-grid-pattern absolute left-[466px] top-[49px] h-[579px] w-[220px]" />
      <div className="floor-grid-pattern absolute left-[287px] top-[147px] h-[139px] w-[179px]" />
      <div className="floor-grid-pattern absolute left-[287px] top-[404px] h-[226px] w-[179px]" />

      <div className="absolute left-[193px] top-[313px] flex h-[58px] w-[60px] items-center justify-center bg-[#f6f6f6]">
        <span className="w-[39px] text-center font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">
          Punto de atención SEI
        </span>
      </div>
      <div className="absolute left-[66px] top-[519px] flex h-[111px] w-[72px] items-center justify-center bg-[#f6f6f6]">
        <span className="w-[42px] text-center font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">
          Oficina de vigilancia
        </span>
      </div>
      <div className="absolute left-[226px] top-[483px] flex h-[147px] w-[61px] items-center justify-center bg-[#f6f6f6]">
        <span className="w-[36px] text-center font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">
          Sala de escucha música
        </span>
      </div>
      <span className="absolute left-[360px] top-[349px] w-[39px] text-center font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">
        vacío
      </span>
      <div className="absolute left-[290px] top-[525px] h-[105px] w-[75px] bg-[#f6f6f6]" />
      <div className="absolute left-[305px] top-[559px] flex w-[46px] flex-col items-center gap-[3px]">
        <img src="/assets/48d4c.svg" alt="" width="21" height="21" />
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[10px] text-black">Escaleras</span>
      </div>
      <div className="absolute left-[290px] top-[49px] h-[94px] w-[107px] bg-[#f6f6f6]" />
      <div className="absolute left-[321px] top-[80px] flex w-[46px] flex-col items-center gap-[3px]">
        <img src="/assets/48d4c.svg" alt="" width="21" height="21" />
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[10px] text-black">Escaleras</span>
      </div>

      {/* Baño de hombres */}
      <div className="absolute left-[402px] top-[124px] size-[61px] bg-icesi-blue" />
      <div className="absolute left-[421px] top-[136px] flex w-[23px] flex-col items-center gap-[2px]">
        <img src="/assets/wc-hombres.svg" alt="Baño de hombres" width="23" height="23" />
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[10px] text-white">WC</span>
      </div>
      <div className="absolute left-[402px] top-[224px] h-[8px] w-[61px] bg-black" />
      <div className="absolute left-[390px] top-[450px] h-[52px] w-[6px] bg-icesi-gray1" />

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

      <div className="absolute left-[178px] top-[64px] flex h-[60px] w-[52px] items-center justify-center bg-[#f6f6f6]">
        <span className="w-[36px] text-center font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">
          Sala de video 2
        </span>
      </div>
      <div className="absolute left-[234px] top-[64px] flex h-[60px] w-[52px] items-center justify-center bg-[#f6f6f6]">
        <span className="w-[36px] text-center font-['Plus_Jakarta_Sans:Regular'] text-[8px] text-black">
          Sala de video 1
        </span>
      </div>

      <div className="absolute left-[368px] top-[525px] size-[42px] bg-[#f6f6f6]" />
      <img className="absolute left-[396px] top-[450px]" src="/assets/d23ea.svg" alt="" width="66" height="180" />
      <div className="absolute left-[376px] top-[533px] flex w-[27px] flex-col items-center gap-[3px]">
        <img src="/assets/ascensor-piso3.svg" alt="" width="14" height="17" />
        <span className="whitespace-nowrap font-['Plus_Jakarta_Sans:Regular'] text-[6px] text-black">Ascensor</span>
      </div>

      <div className="absolute left-[66px] top-[49px] flex h-[16px] w-[220px] items-center justify-center bg-black">
        <span className="font-['Plus_Jakarta_Sans:SemiBold'] text-[8px] text-white">Salas de estudio</span>
      </div>
      <div className="absolute left-[466px] top-[49px] flex h-[17px] w-[220px] items-center justify-center bg-black">
        <span className="font-['Plus_Jakarta_Sans:SemiBold'] text-[8px] text-white">Salas de estudio</span>
      </div>
      <div className="absolute left-[466px] top-[614px] flex h-[16px] w-[220px] items-center justify-center bg-black">
        <span className="font-['Plus_Jakarta_Sans:SemiBold'] text-[8px] text-white">Salas de estudio</span>
      </div>

      {/* Puestos de estudio */}
      <div className="absolute left-[290px] top-[289px] h-[108px] w-[8px] bg-icesi-blue" />
      <div className="absolute left-[298px] top-[280px] h-[8px] w-[159px] bg-icesi-blue" />
      <div className="absolute left-[298px] top-[398px] h-[8px] w-[159px] bg-icesi-blue" />
      <div className="absolute left-[460px] top-[289px] h-[108px] w-[8px] bg-icesi-blue" />
      <div className="absolute left-[66px] top-[328px] h-[155px] w-[8px] bg-icesi-blue" />

      {/* Mobiliario */}
      {furniture.map(([left, top, width, height], index) => (
        <div key={index} className="absolute bg-[#d9d9d9]" style={{ left, top, width, height }} />
      ))}
      {roundTables.map(([cx, cy, size, rotate], index) => (
        <div
          key={index}
          className="absolute rounded-full bg-[#d9d9d9]"
          style={{
            left: cx - size / 2,
            top: cy - size / 2,
            width: size,
            height: size,
            transform: `rotate(${rotate}deg)`,
          }}
        />
      ))}
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

import { useEffect, useRef, useState } from "react";
import { type Shelf } from "../data/libraryData";
import MapPin from "./MapPin";

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

type Box = [left: number, top: number, width: number, height: number];

/* Estanterías, mesas, sillas y mobiliario (gris claro) */
const furniture: Box[] = [
  [174, 54, 119, 8], [174, 104, 8, 129], [285, 86, 8, 54], [273, 167, 8, 66],
  [213, 97, 8, 32], [221, 89, 32, 8], [242, 165, 8, 32], [210, 197, 32, 8],
  [459, 127, 8, 100], [515, 127, 8, 100],
  [469, 447, 8, 33], [469, 504, 32, 8], [547, 455, 8, 32], [555, 447, 32, 8], [514, 532, 32, 8],
  [579, 395, 103, 8], [594, 522, 53, 8], [647, 469, 8, 53], [674, 517, 8, 31],
  /* Sofás junto a las escaleras */
  [301, 174, 12, 20], [301, 195, 12, 20], [296, 174, 4, 41],
  [315, 164, 20, 12], [336, 164, 20, 12], [315, 159, 41, 4],
  /* Mesas con sillas */
  [574, 466, 24, 40], [629, 416, 24, 40],
  ...[466, 482, 498].flatMap((y): Box[] => [[565, y, 8, 8], [599, y, 8, 8]]),
  ...[416, 432, 448].flatMap((y): Box[] => [[620, y, 8, 8], [654, y, 8, 8]]),
  /* Columnas */
  [230, 218, 15, 15], [176, 447, 12, 12], [396, 279, 12, 12], [396, 391, 12, 12],
  [504, 442, 12, 12], [542, 442, 12, 12], [564, 222, 12, 12],
  /* Puestos junto a las líneas de estudio */
  ...[280, 295, 310, 325, 340, 355, 370, 385].flatMap((y): Box[] => [[305, y, 8, 8], [437, y, 8, 8]]),
  ...[196, 211, 226, 241, 256, 271, 286, 459, 473, 487, 501, 515, 529, 543, 557].map((x): Box => [x, 404, 8, 8]),
  ...[232, 245, 258, 271, 284].map((x): Box => [x, 259, 8, 8]),
];

/* Mesas redondas: [centroX, centroY, tamaño, rotación] */
type Round = [cx: number, cy: number, size: number, rotate: number];
const roundTables: Round[] = [
  [249.5, 122.5, 15, 0], [249.5, 110.5, 7, 0], [238.5, 127.5, 7, 0], [260.5, 127.5, 7, 0],
  [624.5, 502.5, 15, 0], [624.5, 488.5, 7, 0], [636.5, 509.5, 7, 0],
  ...[
    [217.29, 179.76, 15], [216.15, 167.82, 7], [206.82, 185.79, 7], [228.72, 183.69, 7],
  ].map(([cx, cy, size]): Round => [cx, cy, size, -5.47]),
  ...[0, 106].flatMap((dy) =>
    [
      [167.78, 489.8, 15], [174.5, 479.86, 7], [155.86, 487.76, 7], [174.07, 500.1, 7],
    ].map(([cx, cy, size]): Round => [cx, cy + dy, size, 34.12]),
  ),
  ...[
    [163.91, 544.88, 15], [161.53, 533.13, 7], [154.13, 551.98, 7], [175.69, 547.6, 7],
  ].map(([cx, cy, size]): Round => [cx, cy, size, -11.47]),
];

function FloorPlan() {
  return (
    <div className="relative size-full bg-white" aria-label="Plano del segundo piso">
      <div className="floor-grid-pattern absolute left-[58px] top-[395px] h-[235px] w-[238px]" />
      <div className="floor-grid-pattern absolute left-[459px] top-[395px] h-[235px] w-[223px]" />
      <div className="floor-grid-pattern absolute left-[296px] top-[147px] h-[483px] w-[158px]" />
      <div className="floor-grid-pattern absolute left-[174px] top-[237px] h-[39px] w-[122px]" />
      <div className="floor-grid-pattern absolute left-[459px] top-[127px] h-[152px] w-[64px]" />

      <div className="absolute left-[174px] top-[54px] h-[179px] w-[119px] bg-[#f6f6f6]" />
      <div className="absolute left-[528px] top-[54px] h-[225px] w-[154px] bg-[#f6f6f6]" />
      <div className="absolute left-[459px] top-[54px] h-[69px] w-[64px] bg-[#f6f6f6]" />
      <div className="absolute left-[296px] top-[520px] h-[110px] w-[67px] bg-[#f6f6f6]" />
      <div className="absolute left-[296px] top-[54px] h-[89px] w-[101px] bg-[#f6f6f6]" />
      <div className="absolute left-[75px] top-[54px] h-[225px] w-[95px] bg-[#f6f6f6]" />
      <div className="absolute left-[196px] top-[470px] h-[160px] w-[97px] bg-[#f6f6f6]" />
      <div className="absolute left-[346px] top-[309px] h-[62px] w-[63px] bg-[#f6f6f6]" />
      <div className="absolute left-[469px] top-[548px] h-[66px] w-[101px] bg-[#f6f6f6]" />
      <div className="absolute left-[574px] top-[548px] h-[66px] w-[52px] bg-[#f6f6f6]" />
      <div className="absolute left-[630px] top-[548px] h-[66px] w-[52px] bg-[#f6f6f6]" />
      {[395, 455, 515, 575].map((top) => (
        <div key={top} className="absolute left-[74px] h-[55px] w-[60px] bg-[#f6f6f6]" style={{ top }} />
      ))}
      <div className="absolute left-[376px] top-[447px] h-[33px] w-[6px] bg-icesi-gray1" />
      <div className="absolute left-[382px] top-[447px] h-[33px] w-[87px] bg-[#f6f6f6]" />
      <div className="absolute left-[365px] top-[520px] size-[42px] bg-[#f6f6f6]" />
      <div className="absolute left-[433px] top-[520px] h-[110px] w-[33px] bg-[#f6f6f6]" />
      <img className="absolute left-[395px] top-[520px]" src="/assets/c0fa7.svg" alt="" width="35" height="110" />
      <div className="absolute left-[469px] top-[512px] h-[31px] w-[45px] bg-[#f6f6f6]" />

      {/* Baño de mujeres */}
      <div className="absolute left-[400px] top-[124px] size-[56px] bg-icesi-purple" />
      <div className="absolute left-[417px] top-[132px] flex w-[23px] flex-col items-center gap-[2px]">
        <img src="/assets/wc-mujeres.svg" alt="Baño de mujeres" width="23" height="23" />
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[10px] text-white">WC</span>
      </div>
      <div className="absolute left-[404px] top-[227px] h-[8px] w-[52px] bg-black" />

      <div className="absolute left-[323px] top-[80px] flex w-[46px] flex-col items-center gap-[3px]">
        <img src="/assets/48d4c.svg" alt="" width="21" height="21" />
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[10px] text-black">Escaleras</span>
      </div>
      <div className="absolute left-[306px] top-[557px] flex w-[46px] flex-col items-center gap-[3px]">
        <img src="/assets/48d4c.svg" alt="" width="21" height="21" />
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[10px] text-black">Escaleras</span>
      </div>
      <img className="absolute left-[380px] top-[528px]" src="/assets/ascensor-piso2.svg" alt="" width="14" height="17" />
      <span className="absolute left-[373px] top-[547px] whitespace-nowrap font-['Plus_Jakarta_Sans:Regular'] text-[6px] text-black">
        Ascensor
      </span>
      <img className="absolute left-[486px] top-[518px]" src="/assets/libro-reserva.svg" alt="" width="12" height="12" />
      <span className="absolute left-[491.5px] top-[531px] -translate-x-1/2 whitespace-nowrap font-['Plus_Jakarta_Sans:Regular'] text-[6px] text-black">
        Reserva
      </span>

      {/* Puestos de estudio */}
      <div className="absolute left-[196px] top-[395px] h-[8px] w-[97px] bg-icesi-blue" />
      <div className="absolute left-[231px] top-[268px] h-[8px] w-[62px] bg-icesi-blue" />
      <div className="absolute left-[296px] top-[279px] h-[116px] w-[8px] bg-icesi-blue" />
      <div className="absolute left-[446px] top-[279px] h-[116px] w-[8px] bg-icesi-blue" />
      <div className="absolute left-[459px] top-[395px] h-[8px] w-[106px] bg-icesi-blue" />

      <div className="absolute left-[58px] top-[395px] flex h-[235px] w-[16px] items-center justify-center bg-black">
        <span className="-rotate-90 whitespace-nowrap font-['Plus_Jakarta_Sans:SemiBold'] text-[8px] text-white">
          Salas de estudio
        </span>
      </div>
      <div className="absolute left-[469px] top-[614px] flex h-[16px] w-[213px] items-center justify-center bg-black">
        <span className="font-['Plus_Jakarta_Sans:SemiBold'] text-[8px] text-white">Salas de estudio</span>
      </div>
      <div className="absolute left-[58px] top-[54px] flex h-[225px] w-[16px] items-center justify-center bg-black">
        <span className="-rotate-90 whitespace-nowrap font-['Plus_Jakarta_Sans:SemiBold'] text-[8px] text-white">
          Salas de profesores
        </span>
      </div>

      <span className="map-label left-[88px] top-[415px]">205B</span>
      <span className="map-label left-[88px] top-[475px]">206B</span>
      <span className="map-label left-[88px] top-[535px]">207B</span>
      <span className="map-label left-[88px] top-[595px]">208B</span>
      <span className="map-label left-[214px] top-[535px] w-[61px] text-center">Sala de cómputo</span>
      <span className="map-label left-[353px] top-[330px] w-[48px] text-center" style={{ fontSize: 8 }}>
        Punto de atención
      </span>
      <span className="map-label left-[100px] top-[159px] w-[44px]">La idea</span>
      <span className="map-label left-[212px] top-[141px]" style={{ fontSize: 10 }}>Literatura</span>
      <span className="map-label left-[571px] top-[151px] whitespace-nowrap">
        Laboratorio
        <br />
        United Way
      </span>
      <span className="map-label left-[463px] top-[78px] w-[55px] text-center" style={{ fontSize: 8 }}>
        Coordinación de servicios
      </span>
      <span className="map-label left-[503px] top-[573px]">204B</span>
      <span className="map-label left-[584px] top-[573px]">203B</span>
      <span className="map-label left-[640px] top-[573px]">202B</span>

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
            transform: rotate ? `rotate(${rotate}deg)` : undefined,
          }}
        />
      ))}
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
          const isDragging = draggingRef.current?.id === shelf.id && draggingRef.current.moved;

          return (
            <MapPin
              key={shelf.id}
              shelf={shelf}
              selected={selected}
              editMode={editMode}
              isDragging={isDragging}
              allFloorShelves={floorShelves}
              onPointerDown={(event) => handlePinDown(event, shelf)}
              onPointerMove={(event) => handlePinMove(event, shelf)}
              onPointerUp={() => {
                draggingRef.current = null;
              }}
              onClick={(shelf) => {
                if (!movedPinRef.current) onShelfClick(shelf);
                movedPinRef.current = false;
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

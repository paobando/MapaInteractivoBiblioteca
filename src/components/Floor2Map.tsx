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

function FloorPlan() {
  return (
    <div className="relative size-full bg-white" aria-label="Plano del segundo piso">
      <div className="floor-grid-pattern absolute left-[58px] top-[395px] size-[235px]" />
      <div className="floor-grid-pattern absolute left-[459px] top-[395px] h-[235px] w-[223px]" />
      <div className="floor-grid-pattern absolute left-[296px] top-[147px] h-[483px] w-[160px]" />
      <div className="floor-grid-pattern absolute left-[174px] top-[237px] h-[42px] w-[119px]" />
      <div className="floor-grid-pattern absolute left-[459px] top-[127px] h-[152px] w-[64px]" />

      <div className="absolute left-[400px] top-[123px] flex size-[56px] items-center justify-center bg-icesi-purple">
        <img src="/assets/b2410.svg" alt="Baño de mujeres" width="25.8462" height="25.8462" />
      </div>
      <div className="absolute left-[174px] top-[54px] h-[179px] w-[119px] bg-[#f6f6f6]" />
      <div className="absolute left-[528px] top-[54px] h-[225px] w-[154px] bg-[#f6f6f6]" />
      <div className="absolute left-[459px] top-[54px] h-[69px] w-[64px] bg-[#f6f6f6] text-center" />
      <div className="absolute left-[296px] top-[520px] h-[110px] w-[67px] bg-[#f6f6f6]" />
      <div className="absolute left-[306px] top-[557px] flex w-[46px] flex-col items-center gap-[3px]">
        <img src="/assets/48d4c.svg" alt="" width="21" height="21" />
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[10px] text-black">Escaleras</span>
      </div>
      <div className="absolute left-[296px] top-[54px] h-[89px] w-[101px] bg-[#f6f6f6]" />
      <div className="absolute left-[323px] top-[80px] flex w-[46px] flex-col items-center gap-[3px]">
        <img src="/assets/48d4c.svg" alt="" width="21" height="21" />
        <span className="font-['Plus_Jakarta_Sans:Regular'] text-[10px] text-black">Escaleras</span>
      </div>
      <div className="absolute left-[75px] top-[54px] h-[225px] w-[95px] bg-[#f6f6f6]" />
      <div className="absolute left-[196px] top-[470px] h-[160px] w-[97px] bg-[#f6f6f6]" />
      <div className="absolute left-[574px] top-[548px] h-[66px] w-[52px] bg-[#f6f6f6]" />
      <div className="absolute left-[469px] top-[512px] h-[31px] w-[45px] bg-[#f6f6f6]" />
      <div className="absolute left-[346px] top-[309px] h-[62px] w-[63px] bg-[#f6f6f6]" />
      <div className="absolute left-[630px] top-[548px] h-[66px] w-[52px] bg-[#f6f6f6]" />
      <div className="absolute left-[469px] top-[548px] h-[66px] w-[101px] bg-[#f6f6f6]" />
      {[395, 455, 515, 575].map((top) => (
        <div key={top} className="absolute left-[74px] h-[55px] w-[60px] bg-[#f6f6f6]" style={{ top }} />
      ))}
      <div className="absolute left-[404px] top-[227px] h-[8px] w-[52px] bg-[#c4c4c4]" />
      <div className="absolute left-[374px] top-[447px] h-[33px] w-[8px] bg-[#101828]" />
      <div className="absolute left-[382px] top-[447px] h-[33px] w-[84px] bg-[#f6f6f6]" />
      <div className="absolute left-[365px] top-[520px] size-[42px] bg-[#f6f6f6]" />
      <img className="absolute left-[395px] top-[520px]" src="/assets/c0fa7.svg" alt="" width="35" height="110" />
      <div className="absolute left-[433px] top-[520px] h-[110px] w-[33px] bg-[#f6f6f6]" />
      <img className="absolute left-[375px] top-[527px]" src="/assets/f4b65.svg" alt="Ascensor" width="23" height="28.1414" />

      <div className="absolute left-[153px] top-[489px] size-[22px] bg-[#f6f6f6]" />
      <div className="absolute left-[153px] top-[523px] size-[22px] bg-[#f6f6f6]" />
      <div className="absolute left-[153px] top-[557px] size-[22px] bg-[#f6f6f6]" />
      <div className="absolute left-[153px] top-[591px] size-[22px] bg-[#f6f6f6]" />
      <div className="absolute left-[196px] top-[395px] h-[8px] w-[97px] bg-icesi-blue" />
      <div className="absolute left-[231px] top-[271px] h-[8px] w-[62px] bg-icesi-blue" />
      <div className="absolute left-[296px] top-[279px] h-[116px] w-[8px] bg-icesi-blue" />
      <div className="absolute left-[448px] top-[279px] h-[116px] w-[8px] bg-icesi-blue" />
      <div className="absolute left-[459px] top-[395px] h-[8px] w-[107px] bg-icesi-blue" />

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
      <span className="map-label left-[222px] top-[535px] w-[44px] text-center">Sala general</span>
      <span className="map-label left-[100px] top-[159px] w-[44px]">La idea</span>
      <span className="map-label left-[212px] top-[141px]" style={{ fontSize: 10 }}>Literatura</span>
      <span className="map-label left-[572px] top-[159px]">United Way</span>
      <span className="map-label left-[463px] top-[78px] w-[55px]" style={{ fontSize: 8 }}>Coordinación de servicios</span>
      <span className="map-label left-[503px] top-[573px]">204B</span>
      <span className="map-label left-[584px] top-[573px]">203B</span>
      <span className="map-label left-[640px] top-[573px]">202B</span>

      {/* Mobiliario y divisiones */}
      <div className="absolute left-[174px] top-[54px] h-[8px] w-[119px] bg-[#c4c4c4]" />
      <div className="absolute left-[174px] top-[104px] h-[129px] w-[8px] bg-[#c4c4c4]" />
      <div className="absolute left-[285px] top-[86px] h-[54px] w-[8px] bg-[#c4c4c4]" />
      <div className="absolute left-[273px] top-[167px] h-[66px] w-[8px] bg-[#c4c4c4]" />
      <div className="absolute left-[459px] top-[127px] h-[100px] w-[8px] bg-[#c4c4c4]" />
      <div className="absolute left-[515px] top-[127px] h-[100px] w-[8px] bg-[#c4c4c4]" />

      <div className="absolute left-[213px] top-[97px] h-[32px] w-[8px] bg-[#c4c4c4]" />
      <div className="absolute left-[221px] top-[89px] h-[8px] w-[32px] bg-[#c4c4c4]" />
      <div className="absolute left-[242px] top-[165px] h-[32px] w-[8px] bg-[#c4c4c4]" />
      <div className="absolute left-[210px] top-[197px] h-[8px] w-[32px] bg-[#c4c4c4]" />

      <div className="absolute left-[520px] top-[455px] h-[32px] w-[8px] bg-[#c4c4c4]" />
      <div className="absolute left-[528px] top-[447px] h-[8px] w-[32px] bg-[#c4c4c4]" />
      <div className="absolute left-[520px] top-[532px] h-[8px] w-[32px] bg-[#c4c4c4]" />
      <div className="absolute left-[579px] top-[395px] h-[8px] w-[103px] bg-[#c4c4c4]" />
      <div className="absolute left-[594px] top-[522px] h-[8px] w-[53px] bg-[#c4c4c4]" />
      <div className="absolute left-[647px] top-[469px] h-[53px] w-[8px] bg-[#c4c4c4]" />
      <div className="absolute left-[674px] top-[517px] h-[31px] w-[8px] bg-[#c4c4c4]" />

      {/* Mesas con sillas (tres por lado) */}
      {[
        [556, 471],
        [619, 416],
      ].map(([x, y]) => (
        <div key={`mesa-${x}`} className="absolute h-[39px] w-[44px]" style={{ left: x, top: y }}>
          <div className="absolute left-[10px] top-0 h-[39px] w-[24px] bg-[#d9d9d9]" />
          {[0, 35].map((chairX) =>
            [
              [0, 8],
              [16, 7],
              [31, 8],
            ].map(([chairY, h]) => (
              <div
                key={`${chairX}-${chairY}`}
                className="absolute w-[9px] bg-[#d9d9d9]"
                style={{ left: chairX, top: chairY, height: h }}
              />
            )),
          )}
        </div>
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

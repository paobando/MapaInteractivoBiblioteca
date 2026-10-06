import { useEffect, useRef, useState } from "react";
import { shelves as initialShelves, type Shelf } from "./data/libraryData";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import FloorMap from "./components/FloorMap";
import Floor1Map from "./components/Floor1Map";
import Floor2Map from "./components/Floor2Map";
import Floor3Map from "./components/Floor3Map";
import ShelfPanel from "./components/ShelfPanel";
import EditPanel from "./components/EditPanel";

const FLOORS = [1, 2, 3] as const;

const floorMeta: Record<number, { full: string; zones: string }> = {
  1: { full: "Primer piso",   zones: "Hall de biblioteca · Sala Oasis · Oficinas · Salas de estudio" },
  2: { full: "Segundo piso",  zones: "Literatura · Sala general · United Way · Salas de estudio · Zona de préstamo" },
  3: { full: "Tercer piso",   zones: "Salas de estudio · Salas de video · Sala de escucha · SEI" },
};

const STORAGE_KEY = "library-map-elements";
const MAP_API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-509cd806/library-map`;

type StoredMap = {
  shelves: Shelf[];
  updatedAt: number;
};

function loadSavedMap(): StoredMap {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { shelves: initialShelves, updatedAt: 0 };
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return { shelves: parsed, updatedAt: 1 };
    }
    if (Array.isArray(parsed?.shelves) && typeof parsed.updatedAt === "number") {
      return parsed;
    }
    return { shelves: initialShelves, updatedAt: 0 };
  } catch {
    return { shelves: initialShelves, updatedAt: 0 };
  }
}

function saveMapLocally(map: StoredMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Keep the current session usable if browser storage is unavailable.
  }
}

type RemoteMapResult = {
  available: boolean;
  map: StoredMap | null;
};

async function loadMapFromSupabase(): Promise<RemoteMapResult> {
  const response = await fetch(MAP_API_URL, {
    headers: { Authorization: `Bearer ${publicAnonKey}` },
  });
  if (response.status === 404) return { available: false, map: null };
  if (!response.ok) throw new Error(`Error ${response.status} al cargar el mapa`);
  const data = await response.json();
  return { available: true, map: data.map ?? null };
}

async function saveMapToSupabase(map: StoredMap): Promise<boolean> {
  const response = await fetch(MAP_API_URL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(map),
  });
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`Error ${response.status} al guardar el mapa`);
  return true;
}

export default function App() {
  const initialMapRef = useRef<StoredMap>(loadSavedMap());
  const currentMapRef = useRef<StoredMap>(initialMapRef.current);
  const lastUpdatedRef = useRef(initialMapRef.current.updatedAt);
  const pendingSaveRef = useRef<number | null>(null);
  const supabaseAvailableRef = useRef<boolean | null>(null);
  const [shelves, setShelves] = useState<Shelf[]>(initialMapRef.current.shelves);
  const [floorNames, setFloorNames] = useState<Record<number, string>>({
    1: floorMeta[1].full,
    2: floorMeta[2].full,
    3: floorMeta[3].full,
  });
  const [floorSubtitles, setFloorSubtitles] = useState<Record<number, string>>({
    1: floorMeta[1].zones,
    2: floorMeta[2].zones,
    3: floorMeta[3].zones,
  });
  const [activeFloor, setActiveFloor] = useState<number>(2);
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const [editMode, setEditMode] = useState(false);

  const syncMap = (map: StoredMap) => {
    if (supabaseAvailableRef.current === false) return;
    if (pendingSaveRef.current !== null) window.clearTimeout(pendingSaveRef.current);
    pendingSaveRef.current = window.setTimeout(() => {
      saveMapToSupabase(map)
        .then((available) => {
          supabaseAvailableRef.current = available;
        })
        .catch(() => {
          supabaseAvailableRef.current = false;
        });
    }, 250);
  };

  useEffect(() => {
    let active = true;
    loadMapFromSupabase()
      .then(({ available, map: remoteMap }) => {
        if (!active) return;
        supabaseAvailableRef.current = available;
        if (!available) return;
        const localMap = currentMapRef.current;
        if (remoteMap && remoteMap.updatedAt > localMap.updatedAt) {
          lastUpdatedRef.current = remoteMap.updatedAt;
          currentMapRef.current = remoteMap;
          setShelves(remoteMap.shelves);
          saveMapLocally(remoteMap);
        } else {
          syncMap(localMap);
        }
      })
      .catch(() => {
        supabaseAvailableRef.current = false;
      });
    return () => {
      active = false;
      if (pendingSaveRef.current !== null) window.clearTimeout(pendingSaveRef.current);
    };
  }, []);

  const updateShelves = (updater: (current: Shelf[]) => Shelf[]) => {
    setShelves((current) => {
      const nextShelves = updater(current);
      const map = { shelves: nextShelves, updatedAt: Date.now() };
      lastUpdatedRef.current = map.updatedAt;
      currentMapRef.current = map;
      saveMapLocally(map);
      syncMap(map);
      return nextShelves;
    });
  };

  /* ── handlers ── */
  const handleShelfClick = (shelf: Shelf) => {
    setSelectedShelf((prev) => (prev?.id === shelf.id ? null : shelf));
  };

  const handleShelfMove = (id: string, x: number, y: number) => {
    updateShelves((current) => current.map((shelf) => (shelf.id === id ? { ...shelf, x, y } : shelf)));
  };

  const handleMapClick = (x: number, y: number) => {
    const newShelf: Shelf = {
      id: `new-${crypto.randomUUID()}`,
      label: "T?",
      floor: activeFloor,
      x,
      y,
      deweyRanges: ["000 – 099.9"],
      categoryIds: ["000"],
      description: "Sin descripción aún. Edita este pin para agregar información.",
      zone: "Zona sin asignar",
      color: "#5454E9",
      kind: "shelf",
    };
    updateShelves((current) => [...current, newShelf]);
    setSelectedShelf(newShelf);
  };

  const handleSave = (updated: Shelf) => {
    updateShelves((current) => current.map((shelf) => (shelf.id === updated.id ? updated : shelf)));
    setSelectedShelf(updated);
  };

  const handleDelete = () => {
    if (!selectedShelf) return;
    updateShelves((current) => current.filter((shelf) => shelf.id !== selectedShelf.id));
    setSelectedShelf(null);
  };

  const handleClosePanel = () => setSelectedShelf(null);

  const toggleEditMode = () => {
    setEditMode((v) => !v);
    setSelectedShelf(null);
  };

  /* ── selected shelf (keep synced after save) ── */
  const liveSelected = selectedShelf
    ? (shelves.find((s) => s.id === selectedShelf.id) ?? null)
    : null;

  return (
    <div
      className="flex overflow-hidden"
      style={{
        height: "100dvh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        backgroundColor: "#F0F1F8",
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="w-60 shrink-0 flex flex-col gap-0 bg-white border-r border-gray-100"
        style={{ boxShadow: "2px 0 16px rgba(0,0,0,0.04)" }}
      >
        {/* Brand */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
                        <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">Mapa de Biblioteca</h1>
              </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mx-5" />

        {/* Floor selector */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Pisos</p>
          <div className="flex flex-col gap-1.5">
            {FLOORS.map((f) => {
              const active = activeFloor === f;
              return (
                <button
                  key={f}
                  onClick={() => { setActiveFloor(f); setSelectedShelf(null); }}
                  className="flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200"
                  style={
                    active
                      ? { backgroundColor: "#5454E9", boxShadow: "0 4px 14px #5454E944" }
                      : { backgroundColor: "#F5F6FA" }
                  }
                >
                  <span
                    className="w-7 h-7 flex items-center justify-center text-sm font-extrabold shrink-0"
                    style={
                      active
                        ? { backgroundColor: "rgba(255,255,255,0.2)", color: "white" }
                        : { color: "#5454E9" }
                    }
                  >
                    {f}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-tight truncate"
                       style={{ color: active ? "white" : "#374151" }}>
                      {floorMeta[f].full}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        <div className="h-px bg-gray-100 mx-5" />

        {/* Edit mode toggle */}
        <div className="px-4 py-4">
          <button
            onClick={toggleEditMode}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-all duration-200"
            style={
              editMode
                ? { backgroundColor: "#E9683B", color: "white", boxShadow: "0 4px 14px #E9683B44" }
                : {
                    backgroundColor: "rgb(0, 0, 0)",
                    color: "rgb(255, 255, 255)",
                    boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 14px 0px",
                  }
            }
          >
            {editMode ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 3L3 11M3 3l8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Salir de edición
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M9.5 2a1.5 1.5 0 0 1 2.121 2.121L5.121 10.62l-2.828.707.707-2.828L9.5 2Z"
                    stroke="rgb(255, 255, 255)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                Editar mapa
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 flex flex-col p-4 gap-3 relative overflow-hidden">
        {/* Floor header */}
        <div className="flex items-center justify-between shrink-0 px-1">
          <div className="min-w-0 flex-1">
            {editMode ? (
              <div className="flex max-w-2xl gap-2">
                <input
                  value={floorNames[activeFloor]}
                  onChange={(event) =>
                    setFloorNames((current) => ({
                      ...current,
                      [activeFloor]: event.target.value,
                    }))
                  }
                  aria-label="Título del piso"
                  placeholder="Título del piso"
                  className="w-52 border border-gray-300 bg-white px-3 py-1.5 text-sm font-extrabold leading-tight text-gray-900 outline-none focus:border-icesi-blue focus:ring-2 focus:ring-icesi-blue/15"
                />
                <input
                  value={floorSubtitles[activeFloor]}
                  onChange={(event) =>
                    setFloorSubtitles((current) => ({
                      ...current,
                      [activeFloor]: event.target.value,
                    }))
                  }
                  aria-label="Subtítulo del piso"
                  placeholder="Áreas o descripción del piso"
                  className="min-w-0 flex-1 border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-icesi-blue focus:ring-2 focus:ring-icesi-blue/15"
                />
              </div>
            ) : (
              <>
                <h2 className="text-lg font-extrabold text-gray-900 leading-tight">
                  {floorNames[activeFloor]}
                </h2>
                <p className="text-xs text-gray-400">{floorSubtitles[activeFloor]}</p>
              </>
            )}
          </div>
          {editMode && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: "#E9683B18", color: "#E9683B", border: "1px solid #E9683B33" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Modo edición activo
            </div>
          )}
        </div>

        {/* Map */}
        <div
          className="flex-1 min-h-0 overflow-hidden"
          style={{
            borderRadius: 0,
            backgroundColor: "white",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            border: editMode ? "2px solid #E9683B44" : "2px solid rgba(255,255,255,0.8)",
            transition: "border-color 0.3s",
          }}
        >
          {activeFloor === 1 ? (
            <Floor1Map
              shelves={shelves}
              editMode={editMode}
              onShelfClick={handleShelfClick}
              onShelfMove={handleShelfMove}
              onMapClick={handleMapClick}
              selectedShelf={liveSelected}
            />
          ) : activeFloor === 2 ? (
            <Floor2Map
              shelves={shelves}
              editMode={editMode}
              onShelfClick={handleShelfClick}
              onShelfMove={handleShelfMove}
              onMapClick={handleMapClick}
              selectedShelf={liveSelected}
            />
          ) : activeFloor === 3 ? (
            <Floor3Map
              shelves={shelves}
              editMode={editMode}
              onShelfClick={handleShelfClick}
              onShelfMove={handleShelfMove}
              onMapClick={handleMapClick}
              selectedShelf={liveSelected}
            />
          ) : (
            <FloorMap
              floor={activeFloor}
              shelves={shelves}
              editMode={editMode}
              onShelfClick={handleShelfClick}
              onShelfMove={handleShelfMove}
              onMapClick={handleMapClick}
              selectedShelf={liveSelected}
            />
          )}
        </div>

        {/* Bottom tip */}
        <p className="text-xs text-gray-400 text-center shrink-0">
          {editMode
            ? "Clic en el plano para agregar · Arrastra un pin para moverlo · Clic en pin para editar"
            : "Clic en un pin para consultar la estantería"}
        </p>

        {/* ── Floating panel ── */}
        {liveSelected && (
          <div
            className="absolute bottom-12 right-5 z-40"
            style={{ filter: "drop-shadow(0 8px 32px rgba(84,84,233,0.18)) drop-shadow(0 2px 8px rgba(0,0,0,0.12))" }}
          >
            {editMode ? (
              <EditPanel
                shelf={liveSelected}
                onSave={handleSave}
                onDelete={handleDelete}
                onClose={handleClosePanel}
              />
            ) : (
              <ShelfPanel shelf={liveSelected} onClose={handleClosePanel} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

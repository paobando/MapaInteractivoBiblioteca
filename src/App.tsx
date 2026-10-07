import { useCallback, useEffect, useRef, useState } from "react";
import { shelves as initialShelves, type Shelf } from "./data/libraryData";
import FloorMap from "./components/FloorMap";
import Floor1Map from "./components/Floor1Map";
import Floor2Map from "./components/Floor2Map";
import Floor3Map from "./components/Floor3Map";
import ShelfPanel from "./components/ShelfPanel";
import EditPanel from "./components/EditPanel";
import { fetchMapState, saveMapState, type MapState } from "./lib/mapStore";
import { uploadDataUrl } from "./lib/imageStore";

const FLOORS = [1, 2, 3] as const;

const floorMeta: Record<number, { full: string; zones: string }> = {
  1: { full: "Primer piso",   zones: "Hall de biblioteca · Sala Oasis · Oficinas · Salas de estudio" },
  2: { full: "Segundo piso",  zones: "Literatura · Sala general · United Way · Salas de estudio · Zona de préstamo" },
  3: { full: "Tercer piso",   zones: "Salas de estudio · Salas de video · Sala de escucha · SEI" },
};

const STORAGE_KEY = "mapa-biblioteca:v1";
/* Clave que usaba la versión anterior de Make (solo guardaba en el navegador). */
const LEGACY_STORAGE_KEY = "library-map-elements";
const REFRESH_MS = 30_000;

const defaultFloorNames: Record<number, string> = {
  1: floorMeta[1].full,
  2: floorMeta[2].full,
  3: floorMeta[3].full,
};
const defaultFloorSubtitles: Record<number, string> = {
  1: floorMeta[1].zones,
  2: floorMeta[2].zones,
  3: floorMeta[3].zones,
};

type SyncStatus = "loading" | "saving" | "saved" | "error";

function normalize(state: Partial<MapState> | null | undefined): MapState {
  return {
    shelves: Array.isArray(state?.shelves) ? state.shelves : (initialShelves ?? []),
    floorNames: { ...defaultFloorNames, ...state?.floorNames },
    floorSubtitles: { ...defaultFloorSubtitles, ...state?.floorSubtitles },
  };
}

/* Copia local para pintar rápido mientras llega la versión compartida. */
function loadCached(): Partial<MapState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Partial<MapState>;
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) ?? "null");
    if (Array.isArray(legacy)) return { shelves: legacy };
    if (Array.isArray(legacy?.shelves)) return { shelves: legacy.shelves };
    return null;
  } catch {
    return null;
  }
}

const cached = normalize(loadCached());

export default function App() {
  const [shelves, setShelves] = useState<Shelf[]>(cached.shelves);
  const hasHeavyImage = shelves.some(
    (s) => s.imageUrl && s.imageUrl.startsWith("data:image/") && s.imageUrl.length > 1 * 1024 * 1024
  );
  const [floorNames, setFloorNames] = useState<Record<number, string>>(cached.floorNames);
  const [floorSubtitles, setFloorSubtitles] = useState<Record<number, string>>(cached.floorSubtitles);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  /* true cuando ya se leyó la versión compartida y se puede escribir sobre ella */
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const lastSyncedRef = useRef("");
  const currentJsonRef = useRef("");
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());
  const editModeRef = useRef(false);

  const applyRemote = useCallback((remote: MapState) => {
    const state = normalize(remote);
    lastSyncedRef.current = JSON.stringify(state);
    setShelves(state.shelves);
    setFloorNames(state.floorNames);
    setFloorSubtitles(state.floorSubtitles);
  }, []);

  /* Trae los cambios de otras personas, salvo que haya ediciones locales pendientes. */
  const refresh = useCallback(async () => {
    try {
      const remote = await fetchMapState();
      if (!readyRef.current) {
        if (remote) applyRemote(remote);
        readyRef.current = true;
        setReady(true);
      } else if (
        remote &&
        !editModeRef.current &&
        currentJsonRef.current === lastSyncedRef.current &&
        JSON.stringify(normalize(remote)) !== lastSyncedRef.current
      ) {
        applyRemote(remote);
      }
      if (currentJsonRef.current !== lastSyncedRef.current) {
        /* quedó un guardado pendiente (p. ej. falló sin conexión): reintentar */
        setRetryCount((count) => count + 1);
      } else {
        setSyncStatus("saved");
      }
    } catch {
      setSyncStatus("error");
    }
  }, [applyRemote]);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, REFRESH_MS);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  /* Guarda en Supabase (con una pequeña espera para agrupar cambios seguidos). */
  useEffect(() => {
    const state: MapState = { shelves, floorNames, floorSubtitles };
    const json = JSON.stringify(state);
    currentJsonRef.current = json;
    try {
      localStorage.setItem(STORAGE_KEY, json);
    } catch {
      /* almacenamiento local no disponible */
    }
    if (!ready || json === lastSyncedRef.current) return;

    setSyncStatus("saving");
    const timeout = window.setTimeout(() => {
      saveChainRef.current = saveChainRef.current
        .then(() => saveMapState(state))
        .then(() => {
          lastSyncedRef.current = json;
          if (currentJsonRef.current === json) setSyncStatus("saved");
        })
        .catch(() => setSyncStatus("error"));
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [ready, retryCount, shelves, floorNames, floorSubtitles]);

  /* Fotos antiguas guardadas como texto (data:...): se suben a Storage y se
     reemplazan por su enlace, para que el mapa vuelva a pesar poco. */
  const migratingRef = useRef(new Set<string>());
  useEffect(() => {
    if (!ready) return;
    for (const shelf of shelves) {
      const dataUrl = shelf.imageUrl;
      if (!dataUrl?.startsWith("data:") || migratingRef.current.has(dataUrl)) continue;
      migratingRef.current.add(dataUrl);
      uploadDataUrl(dataUrl, shelf.label)
        .then((url) =>
          setShelves((current) =>
            current.map((s) => (s.imageUrl === dataUrl ? { ...s, imageUrl: url } : s)),
          ),
        )
        .catch(() => migratingRef.current.delete(dataUrl));
    }
  }, [ready, shelves]);

  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const [editMode, setEditMode] = useState(false);
  editModeRef.current = editMode;

  /* ── handlers ── */
  const handleShelfClick = (shelf: Shelf) => {
    setSelectedShelf((prev) => (prev?.id === shelf.id ? null : shelf));
  };

  const handleShelfMove = (id: string, x: number, y: number) => {
    setShelves((current) => current.map((shelf) => (shelf.id === id ? { ...shelf, x, y } : shelf)));
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
    setShelves((current) => [...current, newShelf]);
    setSelectedShelf(newShelf);
  };

  const handleSave = (updated: Shelf) => {
    setShelves((current) => current.map((shelf) => (shelf.id === updated.id ? updated : shelf)));
    setSelectedShelf(updated);
  };

  const handleDelete = () => {
    if (!selectedShelf) return;
    setShelves((current) => current.filter((shelf) => shelf.id !== selectedShelf.id));
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
                      {defaultFloorNames[f]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Convenciones */}
        <div className="px-4 py-3.5 bg-gray-50 border border-gray-100 mx-4 mb-4">
          <p className="text-xs font-normal text-gray-400 tracking-wider mb-2.5">
            Convenciones del mapa
          </p>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-2 bg-[#C4C4C4] shrink-0" />
              <span className="text-xs font-semibold text-gray-700">
                Estanterías físicas (líneas grises)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-2 bg-icesi-blue shrink-0" />
              <span className="text-xs font-semibold text-gray-700">
                Puestos de estudio (líneas azules)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-2 bg-icesi-orange shrink-0" />
              <span className="text-xs font-semibold text-gray-700">
                Entradas y salidas (líneas naranjas)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-1 shrink-0">
                <span className="w-3 h-3 bg-icesi-blue border border-white inline-block" />
                <span className="w-3 h-3 bg-icesi-orange border border-white inline-block" />
                <span className="w-3 h-3 bg-icesi-green border border-white inline-block" />
              </div>
              <span className="text-xs font-semibold text-gray-700">
                Pines de referencia
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mx-5" />

        {/* Edit mode toggle */}
        <div className="px-4 py-4">
          <p
            className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold"
            style={{ color: syncStatus === "error" ? "#E9683B" : "#9CA3AF" }}
            aria-live="polite"
          >
            <span
              className="size-1.5 rounded-full"
              style={{
                backgroundColor:
                  syncStatus === "error" ? "#E9683B" : syncStatus === "saved" ? "#4CB979" : "#E4EB60",
              }}
            />
            {syncStatus === "loading" && "Cargando cambios…"}
            {syncStatus === "saving" && "Guardando…"}
            {syncStatus === "saved" && "Cambios guardados"}
            {syncStatus === "error" && (hasHeavyImage ? "Foto muy pesada · no se guardó" : "Sin conexión · no se guardó")}
          </p>
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
            className={`absolute z-40 max-sm:inset-x-0 max-sm:bottom-0 sm:bottom-12 ${
              liveSelected.x > 55 ? "sm:left-5 sm:right-auto" : "sm:right-5 sm:left-auto"
            }`}
            style={{ filter: "drop-shadow(0 8px 32px rgba(84,84,233,0.18)) drop-shadow(0 2px 8px rgba(0,0,0,0.12))" }}
          >
            {editMode ? (
              <EditPanel
                key={liveSelected.id}
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

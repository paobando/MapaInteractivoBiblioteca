import type { Shelf } from "../data/libraryData";

/* Proyecto Supabase "Mapa interactivo biblioteca". La clave publicable es
   pública por diseño; los permisos los controla RLS en la tabla map_state. */
const SUPABASE_URL = "https://fdeozrbidffrzaeyqlim.supabase.co";
const SUPABASE_KEY = "sb_publishable_EKV4PWq6z698witMmfhGWA__IbrroBK";
const ENDPOINT = `${SUPABASE_URL}/rest/v1/map_state`;
const ROW_ID = "main";

export type MapState = {
  shelves: Shelf[];
  floorNames: Record<number, string>;
  floorSubtitles: Record<number, string>;
};

const headers = {
  apikey: SUPABASE_KEY,
  "Content-Type": "application/json",
};

/* Devuelve el estado compartido, o null si todavía no se ha guardado nada. */
export async function fetchMapState(): Promise<MapState | null> {
  const response = await fetch(`${ENDPOINT}?id=eq.${ROW_ID}&select=data`, { headers });
  if (!response.ok) throw new Error(`Error ${response.status} al cargar el mapa`);
  const rows = (await response.json()) as { data: MapState }[];
  return rows[0]?.data ?? null;
}

export async function saveMapState(state: MapState): Promise<void> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ id: ROW_ID, data: state, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error(`Error ${response.status} al guardar el mapa`);
}

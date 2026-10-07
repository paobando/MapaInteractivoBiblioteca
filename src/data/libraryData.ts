export type DeweyCategory = {
  id: string;
  range: string;
  label: string;
  color: string;
};

export const deweyCategories: DeweyCategory[] = [
  { id: "000", range: "000–099", label: "Generalidades e Informática", color: "#5454E9" },
  { id: "100", range: "100–199", label: "Filosofía y Psicología", color: "#865CF0" },
  { id: "200", range: "200–299", label: "Religión", color: "#E9683B" },
  { id: "300", range: "300–399", label: "Ciencias Sociales", color: "#4CB979" },
  { id: "400", range: "400–499", label: "Lenguas y Lingüística", color: "#E4EB60" },
  { id: "500", range: "500–599", label: "Ciencias Naturales", color: "#5454E9" },
  { id: "600", range: "600–699", label: "Tecnología Aplicada", color: "#E9683B" },
  { id: "700", range: "700–799", label: "Arte y Recreación", color: "#865CF0" },
  { id: "800", range: "800–899", label: "Literatura", color: "#4CB979" },
  { id: "900", range: "900–999", label: "Historia y Geografía", color: "#E4EB60" },
];

export type Shelf = {
  id: string;
  label: string;
  floor: number;
  x: number;
  y: number;
  deweyRanges: string[];
  categoryIds: string[];
  description: string;
  zone?: string;
  color?: string;
  kind?: "shelf" | "area";
  imageUrl?: string;
};

// Floor 1 - No shelves (administrative + access hall)
// Floor 2 shelves - left and right wings
// Floor 3 shelves - left and right wings

export const shelves: Shelf[] = [
  // ── PISO 2 – Áreas de servicio editables ──
  {
    id: "p2-area-profesores",
    label: "Salas de profesores",
    floor: 2,
    x: 15.9,
    y: 25.8,
    deweyRanges: [],
    categoryIds: ["300"],
    description: "Área de trabajo y encuentro para profesores equipada con mesas de estudio, pizarra y luz natural.",
    zone: "Salas de profesores",
    color: "#4CB979",
    kind: "area",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "p2-area-united-way",
    label: "United Way",
    floor: 2,
    x: 85,
    y: 25.8,
    deweyRanges: [],
    categoryIds: ["300"],
    description: "Área de servicio, consulta e innovación United Way para reuniones grupales colaborativas.",
    zone: "United Way",
    color: "#4CB979",
    kind: "area",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "p2-area-general",
    label: "Sala general",
    floor: 2,
    x: 33.5,
    y: 84.5,
    deweyRanges: [],
    categoryIds: ["300"],
    description: "Sala general de lectura, préstamo de libros de colección general y consulta silenciosa.",
    zone: "Sala general",
    color: "#4CB979",
    kind: "area",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80",
  },

  // ── PISO 2 – Zona Literatura (barras naranjas) ──
  {
    id: "p2-t1a",
    label: "T1",
    floor: 2,
    x: 29,
    y: 16,
    deweyRanges: ["000.1 – 030.9"],
    categoryIds: ["000"],
    description: "Generalidades: Enciclopedias, Bibliografías, Obras de referencia general",
    zone: "Literatura",
  },
  {
    id: "p2-t2a",
    label: "T2",
    floor: 2,
    x: 29,
    y: 30,
    deweyRanges: ["031 – 099.9"],
    categoryIds: ["000"],
    description: "Generalidades: Publicaciones en serie, Museos, Colecciones generales",
    zone: "Literatura",
  },
  {
    id: "p2-t9",
    label: "T9",
    floor: 2,
    x: 36,
    y: 11,
    deweyRanges: ["100 – 149.9"],
    categoryIds: ["100"],
    description: "Filosofía general, Metafísica, Epistemología",
    zone: "Literatura",
  },
  {
    id: "p2-t10",
    label: "T10",
    floor: 2,
    x: 40,
    y: 31,
    deweyRanges: ["150 – 159.9"],
    categoryIds: ["100"],
    description: "Psicología general",
    zone: "Literatura",
  },
  {
    id: "p2-t11",
    label: "T11",
    floor: 2,
    x: 36,
    y: 9,
    deweyRanges: ["160 – 199.9"],
    categoryIds: ["100"],
    description: "Lógica, Filosofías específicas",
    zone: "Literatura",
  },
  {
    id: "p2-t12",
    label: "T12",
    floor: 2,
    x: 70,
    y: 28,
    deweyRanges: ["200 – 299.9"],
    categoryIds: ["200"],
    description: "Religión comparada, Teología, Biblia, Iglesias",
    zone: "Circulación y préstamo",
  },

  // ── PISO 2 – Zona derecha (barras amarillas) ──
  {
    id: "p2-t1b",
    label: "T1",
    floor: 2,
    x: 83,
    y: 65,
    deweyRanges: ["300 – 330.9"],
    categoryIds: ["300"],
    description: "Ciencias Sociales: Estadística, Ciencias Políticas",
    zone: "Colección general",
  },
  {
    id: "p2-t2b",
    label: "T2",
    floor: 2,
    x: 78,
    y: 75,
    deweyRanges: ["331 – 370.9"],
    categoryIds: ["300"],
    description: "Economía del trabajo, Finanzas, Educación",
    zone: "Colección general",
  },
  {
    id: "p2-t3",
    label: "T3",
    floor: 2,
    x: 94,
    y: 73,
    deweyRanges: ["371 – 399.9"],
    categoryIds: ["300"],
    description: "Escuelas y educación, Comercio, Derecho, Gobierno",
    zone: "Colección general",
  },
  {
    id: "p2-t4",
    label: "T4",
    floor: 2,
    x: 94,
    y: 83,
    deweyRanges: ["400 – 499.9"],
    categoryIds: ["400"],
    description: "Lingüística, Gramática, Lenguas específicas",
    zone: "Colección general",
  },
  {
    id: "p2-t8",
    label: "T8",
    floor: 2,
    x: 89,
    y: 83,
    deweyRanges: ["500 – 549.9"],
    categoryIds: ["500"],
    description: "Matemáticas, Astronomía, Física, Química",
    zone: "Colección general",
  },

  // ── PISO 3 – Ala izquierda ──
  {
    id: "p3-t1a",
    label: "T1",
    floor: 3,
    x: 22,
    y: 16,
    deweyRanges: ["550 – 599.9"],
    categoryIds: ["500"],
    description: "Ciencias de la Tierra, Biología, Botánica, Zoología",
    zone: "Sala de lectura",
  },
  {
    id: "p3-t2a",
    label: "T2",
    floor: 3,
    x: 28,
    y: 24,
    deweyRanges: ["600 – 629.9"],
    categoryIds: ["600"],
    description: "Tecnología: Medicina, Ingeniería, Electrónica",
    zone: "Sala de lectura",
  },
  {
    id: "p3-t3a",
    label: "T3",
    floor: 3,
    x: 22,
    y: 32,
    deweyRanges: ["630 – 660.9"],
    categoryIds: ["600"],
    description: "Agricultura, Biotecnología Industrial, Química Industrial",
    zone: "Sala de lectura",
  },
  {
    id: "p3-t4a",
    label: "T4",
    floor: 3,
    x: 18,
    y: 14,
    deweyRanges: ["661 – 699.9"],
    categoryIds: ["600"],
    description: "Tecnología química, Manufactura, Construcción",
    zone: "Sala de lectura",
  },
  {
    id: "p3-t5",
    label: "T5",
    floor: 3,
    x: 32,
    y: 16,
    deweyRanges: ["700 – 749.9"],
    categoryIds: ["700"],
    description: "Arte, Arquitectura, Diseño, Fotografía",
    zone: "Sala de lectura",
  },
  {
    id: "p3-t7a",
    label: "T7",
    floor: 3,
    x: 16,
    y: 42,
    deweyRanges: ["750 – 799.9"],
    categoryIds: ["700"],
    description: "Pintura, Artes gráficas, Música, Deportes",
    zone: "Sala de lectura",
  },

  // ── PISO 3 – Ala derecha ──
  {
    id: "p3-t1b",
    label: "T1",
    floor: 3,
    x: 66,
    y: 16,
    deweyRanges: ["800 – 829.9"],
    categoryIds: ["800"],
    description: "Literatura: Teoría literaria, Literatura americana en inglés",
    zone: "Sala de lectura",
  },
  {
    id: "p3-t2b",
    label: "T2",
    floor: 3,
    x: 72,
    y: 24,
    deweyRanges: ["830 – 869.9"],
    categoryIds: ["800"],
    description: "Literaturas germánicas, Francesa, Italiana, Española",
    zone: "Sala de lectura",
  },
  {
    id: "p3-t3b",
    label: "T3",
    floor: 3,
    x: 77,
    y: 32,
    deweyRanges: ["870 – 899.9"],
    categoryIds: ["800"],
    description: "Literatura latina, Griega, Otras literaturas",
    zone: "Sala de lectura",
  },
  {
    id: "p3-t4b",
    label: "T4",
    floor: 3,
    x: 77,
    y: 16,
    deweyRanges: ["900 – 939.9"],
    categoryIds: ["900"],
    description: "Historia: Historia general, Europa antigua",
    zone: "Sala de lectura",
  },
  {
    id: "p3-t6",
    label: "T6",
    floor: 3,
    x: 66,
    y: 10,
    deweyRanges: ["940 – 979.9"],
    categoryIds: ["900"],
    description: "Historia de Europa moderna, Historia de América",
    zone: "Sala de lectura",
  },
  {
    id: "p3-t7b",
    label: "T7",
    floor: 3,
    x: 72,
    y: 10,
    deweyRanges: ["980 – 999.9"],
    categoryIds: ["900"],
    description: "Historia de América del Sur, Historia universal",
    zone: "Sala de lectura",
  },
];

export const floorAreas: Record<number, { label: string; zones: string[] }> = {
  1: {
    label: "Primer Piso",
    zones: ["Hall de Acceso", "Jefatura de Biblioteca", "Oficinas CIEP", "Salas de Estudio", "Colección Periódicos", "Sala Oasis", "Videoconferencias"],
  },
  2: {
    label: "Segundo Piso",
    zones: ["Literatura", "La idea", "United Way", "Sala general", "Salas de estudio 202B–208B", "Coordinación de servicios"],
  },
  3: {
    label: "Tercer Piso",
    zones: ["Sala de Lectura", "Sala de Escucha", "Estanterías T1–T7"],
  },
};

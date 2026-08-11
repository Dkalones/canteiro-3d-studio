/**
 * Dados espaciais extraídos do desenho "layout canteiro.pdf".
 *
 * As coordenadas abaixo são lidas diretamente do desenho (em pixels da prancha)
 * e convertidas proporcionalmente para metros. O desenho está SEM ESCALA, por
 * isso NÃO há dimensões reais inventadas: apenas a proporção e a posição
 * relativa dos elementos são preservadas.
 */

// Limites do terreno no desenho (px)
const SITE = { x0: 368, y0: 320, x1: 1650, y1: 1175 };

/** Fator proporcional px -> unidade de maquete (aprox. metros). */
export const K = 0.072;

export const SITE_W = (SITE.x1 - SITE.x0) * K;
export const SITE_D = (SITE.y1 - SITE.y0) * K;

/** Converte um retângulo em px do desenho para centro/tamanho na maquete. */
export function rect(x1: number, y1: number, x2: number, y2: number) {
  const w = (x2 - x1) * K;
  const d = (y2 - y1) * K;
  const cx = (x1 + x2) / 2 - (SITE.x0 + SITE.x1) / 2;
  const cz = (y1 + y2) / 2 - (SITE.y0 + SITE.y1) / 2;
  return { w, d, x: cx * K, z: cz * K };
}

export type Category =
  | "vivencia"
  | "armazenamento"
  | "apoio"
  | "circulacao"
  | "eletrica"
  | "construcao";

export type SiteElement = {
  id: string;
  label: string;
  category: Category;
  kind: "building" | "stock" | "area" | "road" | "point";
  height: number;
  geom: ReturnType<typeof rect>;
  nrs: string[];
  note?: string;
};

export const CATEGORY_INFO: Record<
  Category,
  { label: string; color: string; description: string }
> = {
  vivencia: {
    label: "Áreas de vivência",
    color: "#d8cbb4",
    description: "Refeitório, vestiário, sanitários, lavanderias, dormitórios e lazer.",
  },
  apoio: {
    label: "Apoio e administração",
    color: "#b9c6cf",
    description: "Escritório, almoxarifado e reservatório de água.",
  },
  armazenamento: {
    label: "Armazenamento de materiais",
    color: "#c9a06a",
    description: "Baias de brita, cal, cimento, areia e estoque de aço.",
  },
  circulacao: {
    label: "Circulação",
    color: "#9a9a94",
    description: "Via interna de circulação de veículos e pedestres do canteiro.",
  },
  eletrica: {
    label: "Instalações elétricas",
    color: "#e0b93a",
    description: "Fonte de energia elétrica do canteiro.",
  },
  construcao: {
    label: "Área de construção",
    color: "#8f8b80",
    description: "Área destinada à edificação da UBS.",
  },
};

export const SITE_ELEMENTS: SiteElement[] = [
  // ---- Áreas de vivência (faixa oeste do canteiro) ----
  {
    id: "refeitorio",
    label: "Refeitório + Cozinha",
    category: "vivencia",
    kind: "building",
    height: 3,
    geom: rect(410, 383, 583, 600),
    nrs: ["NR-1", "NR-5", "NR-18", "NR-23", "NR-24"],
  },
  {
    id: "vestiario",
    label: "Vestiário",
    category: "vivencia",
    kind: "building",
    height: 3,
    geom: rect(405, 600, 583, 760),
    nrs: ["NR-1", "NR-5", "NR-18", "NR-23", "NR-24"],
  },
  {
    id: "sanitarias",
    label: "Instalações Sanitárias",
    category: "vivencia",
    kind: "building",
    height: 3,
    geom: rect(405, 760, 490, 822),
    nrs: ["NR-1", "NR-5", "NR-18", "NR-23", "NR-24"],
  },
  {
    id: "lavanderias",
    label: "Lavanderias",
    category: "vivencia",
    kind: "building",
    height: 3,
    geom: rect(490, 760, 583, 822),
    nrs: ["NR-1", "NR-5", "NR-18", "NR-23", "NR-24"],
  },
  {
    id: "dorm1",
    label: "Dormitório 1",
    category: "vivencia",
    kind: "building",
    height: 3,
    geom: rect(410, 822, 495, 990),
    nrs: ["NR-1", "NR-5", "NR-18", "NR-23", "NR-24"],
  },
  {
    id: "dorm2",
    label: "Dormitório 2",
    category: "vivencia",
    kind: "building",
    height: 3,
    geom: rect(495, 822, 583, 990),
    nrs: ["NR-1", "NR-5", "NR-18", "NR-23", "NR-24"],
  },
  {
    id: "reunioes",
    label: "Sala de Reuniões + Lazer",
    category: "vivencia",
    kind: "building",
    height: 3,
    geom: rect(405, 1025, 583, 1145),
    nrs: ["NR-1", "NR-5", "NR-18", "NR-23", "NR-24"],
  },

  // ---- Apoio / administração (faixa leste) ----
  {
    id: "escritorio",
    label: "Escritório",
    category: "apoio",
    kind: "building",
    height: 3.2,
    geom: rect(1580, 340, 1648, 492),
    nrs: ["NR-1", "NR-4", "NR-5", "NR-18", "NR-23"],
  },
  {
    id: "agua",
    label: "Água (reservatório)",
    category: "apoio",
    kind: "building",
    height: 3.6,
    geom: rect(1602, 518, 1650, 605),
    nrs: ["NR-1", "NR-18", "NR-23", "NR-24"],
  },
  {
    id: "almoxarifado",
    label: "Almoxarifado",
    category: "apoio",
    kind: "building",
    height: 3.2,
    geom: rect(1575, 1025, 1645, 1148),
    nrs: ["NR-1", "NR-6", "NR-18", "NR-23"],
  },

  // ---- Armazenamento ----
  {
    id: "aco",
    label: "Aço",
    category: "armazenamento",
    kind: "stock",
    height: 1.2,
    geom: rect(1580, 632, 1648, 855),
    nrs: ["NR-1", "NR-6", "NR-12", "NR-18"],
  },
  {
    id: "brita",
    label: "Brita",
    category: "armazenamento",
    kind: "stock",
    height: 1.4,
    geom: rect(620, 1050, 835, 1140),
    nrs: ["NR-1", "NR-6", "NR-18", "NR-23"],
  },
  {
    id: "cal",
    label: "Cal",
    category: "armazenamento",
    kind: "stock",
    height: 1.4,
    geom: rect(845, 1050, 1063, 1140),
    nrs: ["NR-1", "NR-6", "NR-18", "NR-23"],
  },
  {
    id: "cimento",
    label: "Cimento",
    category: "armazenamento",
    kind: "stock",
    height: 1.4,
    geom: rect(1070, 1050, 1290, 1140),
    nrs: ["NR-1", "NR-6", "NR-18", "NR-23"],
  },
  {
    id: "areia",
    label: "Areia",
    category: "armazenamento",
    kind: "stock",
    height: 1.4,
    geom: rect(1297, 1050, 1515, 1140),
    nrs: ["NR-1", "NR-6", "NR-18", "NR-23"],
  },

  // ---- Circulação ----
  {
    id: "circulacao",
    label: "Circulação",
    category: "circulacao",
    kind: "road",
    height: 0.06,
    geom: rect(620, 863, 1650, 995),
    nrs: ["NR-1", "NR-12", "NR-18", "NR-23"],
  },

  // ---- Elétrica ----
  {
    id: "energia",
    label: "Fonte de Energia Elétrica",
    category: "eletrica",
    kind: "point",
    height: 2.4,
    geom: rect(1528, 1140, 1552, 1164),
    nrs: ["NR-1", "NR-10", "NR-12", "NR-18"],
  },

  // ---- Área de construção ----
  {
    id: "area-construcao",
    label: "Área de Construção",
    category: "construcao",
    kind: "area",
    height: 0.1,
    geom: rect(665, 380, 1500, 818),
    nrs: ["NR-1", "NR-6", "NR-12", "NR-18", "NR-35"],
  },
];

export const CONSTRUCTION_AREA = SITE_ELEMENTS.find((e) => e.id === "area-construcao")!.geom;

/** Betoneiras e carrinhos indicados no desenho, entre a via e as baias. */
export const EQUIPMENT = [
  { id: "betoneira-1", label: "Betoneira", x: rect(1030, 1005, 1058, 1045).x, z: rect(1030, 1005, 1058, 1045).z },
  { id: "betoneira-2", label: "Betoneira", x: rect(1075, 1005, 1103, 1045).x, z: rect(1075, 1005, 1103, 1045).z },
];

export const NR_LAYERS = [
  {
    id: "NR-1",
    label: "NR-1 — Disposições gerais e GRO",
    description:
      "Gerenciamento de riscos ocupacionais, ordem de serviço, treinamentos e organização geral do canteiro. Aplica-se a todas as áreas.",
    categories: [
      "vivencia",
      "apoio",
      "armazenamento",
      "circulacao",
      "eletrica",
      "construcao",
    ] as Category[],
  },
  {
    id: "NR-4",
    label: "NR-4 — SESMT",
    description:
      "Dimensionamento dos serviços especializados em segurança e medicina do trabalho, com base administrativa no escritório da obra.",
    categories: ["apoio"] as Category[],
  },
  {
    id: "NR-5",
    label: "NR-5 — CIPA",
    description:
      "Comissão interna de prevenção de acidentes: reuniões, quadro de avisos e ações educativas nas áreas de vivência e administração.",
    categories: ["vivencia", "apoio"] as Category[],
  },
  {
    id: "NR-6",
    label: "NR-6 — EPI",
    description:
      "Fornecimento, guarda e uso de equipamentos de proteção individual (capacete, botina, luvas, protetor auricular) na frente de serviço e no manuseio de materiais.",
    categories: ["construcao", "armazenamento", "apoio"] as Category[],
  },
  {
    id: "NR-10",
    label: "NR-10 — Instalações elétricas",
    description:
      "Fonte de energia, quadros provisórios e distribuição elétrica do canteiro, com proteção contra choques e aterramento.",
    categories: ["eletrica"] as Category[],
  },
  {
    id: "NR-12",
    label: "NR-12 — Máquinas e equipamentos",
    description:
      "Betoneiras, serras, equipamentos de movimentação e circulação de veículos: proteções fixas, dispositivos de partida e sinalização.",
    categories: ["armazenamento", "circulacao", "construcao", "eletrica"] as Category[],
  },
  {
    id: "NR-18",
    label: "NR-18 — Canteiro de obras",
    description:
      "Organização do canteiro: áreas de vivência, armazenamento, circulação, tapume, portão de acesso e frente de serviço.",
    categories: [
      "vivencia",
      "apoio",
      "armazenamento",
      "circulacao",
      "construcao",
    ] as Category[],
  },
  {
    id: "NR-23",
    label: "NR-23 — Proteção contra incêndios",
    description:
      "Extintores, sinalização, rotas de fuga e saída pelo portão de acesso; cuidados no armazenamento de materiais e nas áreas de vivência.",
    categories: ["vivencia", "apoio", "armazenamento", "circulacao", "construcao"] as Category[],
  },
  {
    id: "NR-24",
    label: "NR-24 — Condições de higiene e conforto",
    description:
      "Instalações sanitárias, vestiário, refeitório, dormitórios, lavanderias e água potável.",
    categories: ["vivencia", "apoio"] as Category[],
  },
  {
    id: "NR-35",
    label: "NR-35 — Trabalho em altura",
    description:
      "Frente de serviço da UBS: andaimes com guarda-corpo e rodapé, ancoragem e atividades acima de 2,00 m.",
    categories: ["construcao"] as Category[],
  },
];

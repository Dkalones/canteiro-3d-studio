/**
 * Volumetria simplificada da UBS Porte II, extraída da prancha
 * "Planta Baixa Layout" (PROPOSTA UBS 2-7 03-04).
 *
 * As coordenadas são lidas em pixels da prancha e normalizadas: a UBS é
 * inserida dentro da "Área de Construção" do layout do canteiro mantendo a
 * proporção e a posição relativa dos ambientes. A prancha está sem escala,
 * portanto nenhuma dimensão real é inventada.
 */

import { CONSTRUCTION_AREA } from "./site-data";

// Envoltória da edificação na prancha (px)
const P = { x0: 130, y0: 145, x1: 1790, y1: 1340 };

const PW = P.x1 - P.x0;
const PD = P.y1 - P.y0;

// A UBS ocupa praticamente toda a área de construção.
// fitZ limita pela profundidade; no eixo X é permitido um leve alongamento
// (até 1,3x) para que a edificação não fique pequena dentro da área.
const MARGIN = 1.2;
const fitZ = (CONSTRUCTION_AREA.d - MARGIN * 2) / PD;
const fitXmax = (CONSTRUCTION_AREA.w - MARGIN * 2) / PW;
const fitX = Math.min(fitXmax, fitZ * 1.3);

export const UBS_SCALE = fitZ;
export const UBS_W = PW * fitX;
export const UBS_D = PD * fitZ;
export const UBS_ORIGIN = { x: CONSTRUCTION_AREA.x, z: CONSTRUCTION_AREA.z };

export function urect(x1: number, y1: number, x2: number, y2: number) {
  const w = (x2 - x1) * fitX;
  const d = (y2 - y1) * fitZ;
  const cx = ((x1 + x2) / 2 - (P.x0 + P.x1) / 2) * fitX + UBS_ORIGIN.x;
  const cz = ((y1 + y2) / 2 - (P.y0 + P.y1) / 2) * fitZ + UBS_ORIGIN.z;
  return { w, d, x: cx, z: cz };
}


export type UbsZone =
  | "atendimento"
  | "odontologia"
  | "apoio"
  | "publico"
  | "servico"
  | "externo";

export type UbsRoom = {
  id: string;
  label: string;
  zone: UbsZone;
  geom: ReturnType<typeof urect>;
  /** altura das paredes na maquete (a obra está em execução) */
  wall: number;
  roof?: boolean;
};

export const UBS_ZONE_INFO: Record<UbsZone, { label: string; color: string }> = {
  atendimento: { label: "Consultórios e atendimento", color: "#cfd8dc" },
  odontologia: { label: "Odontologia", color: "#c3d4c8" },
  apoio: { label: "Apoio técnico", color: "#d5cfc2" },
  publico: { label: "Recepção e espera", color: "#e0d6c3" },
  servico: { label: "Serviços e utilidades", color: "#c8c3bb" },
  externo: { label: "Áreas externas", color: "#a8b39f" },
};

/** Ambientes da UBS (px da prancha) — nomes conforme a planta baixa. */
export const UBS_ROOMS: UbsRoom[] = [
  // Bloco norte — serviços / administração
  { id: "dep-contam", label: "Dep. Resíduos Contaminados", zone: "servico", geom: urect(790, 200, 880, 265), wall: 3, roof: true },
  { id: "dep-recic", label: "Dep. Resíduos Recicláveis", zone: "servico", geom: urect(790, 265, 880, 325), wall: 3, roof: true },
  { id: "almox", label: "Almoxarifado", zone: "servico", geom: urect(880, 200, 1020, 325), wall: 3, roof: true },
  { id: "expurgo", label: "Expurgo", zone: "servico", geom: urect(800, 325, 1020, 430), wall: 3, roof: true },
  { id: "esteril", label: "Esterilização e Guarda de Mat.", zone: "servico", geom: urect(800, 430, 1020, 520), wall: 3, roof: true },
  { id: "admin", label: "Administração e Gerência", zone: "apoio", geom: urect(800, 520, 1020, 620), wall: 3, roof: true },
  { id: "dml", label: "DML", zone: "servico", geom: urect(1045, 200, 1220, 285), wall: 3, roof: true },
  { id: "wc-fem", label: "Banheiro Funcionário Fem.", zone: "servico", geom: urect(1045, 300, 1220, 385), wall: 3, roof: true },
  { id: "wc-masc", label: "Banheiro Funcionário Masc.", zone: "servico", geom: urect(1045, 385, 1220, 470), wall: 3, roof: true },
  { id: "copa", label: "Copa", zone: "servico", geom: urect(1045, 490, 1220, 570), wall: 3, roof: true },
  { id: "dep-comuns", label: "Dep. Resíduos Comuns", zone: "servico", geom: urect(1195, 150, 1290, 205), wall: 2.6, roof: true },
  { id: "cisterna", label: "Cisterna / Reservatório", zone: "externo", geom: urect(1235, 215, 1465, 465), wall: 1.2 },

  // Área coberta para atividades (oeste do bloco norte)
  { id: "area-coberta", label: "Área Coberta para Atividades", zone: "externo", geom: urect(447, 405, 775, 620), wall: 0.15, roof: true },

  // Ala oeste superior
  { id: "wc-pcd-1", label: "Banheiro PCD", zone: "atendimento", geom: urect(160, 630, 265, 855), wall: 3, roof: true },
  { id: "observacao", label: "Sala de Observação / Coleta", zone: "atendimento", geom: urect(265, 630, 440, 855), wall: 3, roof: true },
  { id: "coletivas", label: "Sala de Atividades Coletivas / ACS", zone: "atendimento", geom: urect(440, 630, 760, 855), wall: 3, roof: true },
  { id: "medicamentos", label: "Estocagem / Dispensação de Medicamentos", zone: "apoio", geom: urect(760, 630, 1020, 855), wall: 3, roof: true },

  // Ala leste superior
  { id: "inalacao", label: "Sala de Inalação Coletiva", zone: "atendimento", geom: urect(1040, 630, 1165, 855), wall: 3, roof: true },
  { id: "cons-1", label: "Consultório Indiferenciado 01", zone: "atendimento", geom: urect(1165, 630, 1320, 855), wall: 3, roof: true },
  { id: "cons-2", label: "Consultório Indiferenciado 02", zone: "atendimento", geom: urect(1320, 630, 1465, 855), wall: 3, roof: true },
  { id: "cons-3", label: "Consultório Indiferenciado 03", zone: "atendimento", geom: urect(1465, 630, 1610, 855), wall: 3, roof: true },
  { id: "curativos", label: "Sala de Curativos", zone: "atendimento", geom: urect(1610, 630, 1755, 855), wall: 3, roof: true },

  // Circulação central
  { id: "circulacao", label: "Circulação", zone: "publico", geom: urect(150, 860, 1760, 965), wall: 0.2 },

  // Ala oeste inferior
  { id: "odonto-1", label: "Consultório Odontológico", zone: "odontologia", geom: urect(165, 968, 480, 1180), wall: 3, roof: true },
  { id: "odonto-2", label: "Consultório Odontológico", zone: "odontologia", geom: urect(480, 968, 800, 1180), wall: 3, roof: true },

  // Ala leste inferior
  { id: "vacinas", label: "Sala de Vacinas", zone: "atendimento", geom: urect(1100, 968, 1330, 1180), wall: 3, roof: true },
  { id: "cons-sa-1", label: "Consultório c/ Sanit. Anexo 01", zone: "atendimento", geom: urect(1330, 968, 1510, 1180), wall: 3, roof: true },
  { id: "cons-sa-2", label: "Consultório c/ Sanit. Anexo 02", zone: "atendimento", geom: urect(1510, 968, 1780, 1180), wall: 3, roof: true },

  // Recepção e espera (bloco central sul)
  { id: "recepcao", label: "Sala de Recepção e Espera (30 cadeiras)", zone: "publico", geom: urect(805, 965, 1230, 1290), wall: 3, roof: true },
  { id: "wc-pcd-fem", label: "Sanitário PCD Fem.", zone: "publico", geom: urect(715, 1205, 812, 1300), wall: 3, roof: true },
  { id: "wc-pcd-masc", label: "Sanitário PCD Masc.", zone: "publico", geom: urect(1220, 1205, 1318, 1300), wall: 3, roof: true },

  // Implantação externa
  { id: "estacionamento", label: "Estacionamento Descoberto", zone: "externo", geom: urect(1290, 600, 1780, 620), wall: 0.05 },
  { id: "embarque", label: "Área de Embarque / Desembarque de Ambulância", zone: "externo", geom: urect(880, 1300, 1160, 1400), wall: 0.05 },
];

/** Blocos-guia da volumetria (lajes/estrutura em execução). */
export const UBS_MASSES = [
  { id: "bloco-norte", geom: urect(790, 150, 1230, 620), h: 3.6 },
  { id: "ala-oeste-sup", geom: urect(150, 620, 1020, 860), h: 3.6 },
  { id: "ala-leste-sup", geom: urect(1040, 620, 1760, 860), h: 3.6 },
  { id: "ala-oeste-inf", geom: urect(155, 965, 800, 1185), h: 3.6 },
  { id: "ala-leste-inf", geom: urect(1090, 965, 1785, 1185), h: 3.6 },
  { id: "recepcao", geom: urect(800, 860, 1235, 1300), h: 4.2 },
];

/**
 * engineer-data.ts
 *
 * Posições dos engenheiros/trabalhadores no canteiro de obras.
 * Coordenadas em metros (mesma escala do site-data.ts).
 *
 * Dica: para descobrir boas posições, abra o modo "walk" na cena e
 * anote a posição da câmera — depois coloque o engenheiro ~2 m à frente.
 */

export type EngineerInstance = {
  id: string;
  /** 1 = figura esbelda, 2 = figura com EPI/capacete */
  model: 1 | 2;
  position: [number, number, number];
  /** Rotação em Y (radianos). 0 = olha para +Z, Math.PI = olha para -Z */
  rotationY: number;
  label?: string;
};

export const ENGINEERS: EngineerInstance[] = [
  // ── Frente da obra (área de construção, próximo ao andaime) ──
  {
    id: "eng-1",
    model: 2,           // com EPI
    position: [-0.94, 0, -6.94],
    rotationY: Math.PI * 0.25,   // olhando ~45° para o canteiro
    label: "Engenheiro de campo",
  },

  // ── Circulação principal (via interna) ──
  {
    id: "eng-2",
    model: 1,
    position: [6, 0, 4],
    rotationY: -Math.PI * 0.5,   // olhando para o lado
    label: "Técnico de segurança",
  },

  // ── Área de vivência / barracão ──
  {
    id: "eng-3",
    model: 2,           // com EPI
    position: [-14, 0, 12],
    rotationY: Math.PI,
    label: "Encarregado de obra",
  },

  // ── Almoxarifado / estoque ──
  {
    id: "eng-4",
    model: 1,
    position: [19.06, 0, -6.06],
    rotationY: Math.PI * 0.75,
    label: "Almoxarife",
  },
];

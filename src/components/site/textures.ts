/**
 * textures.ts
 * Texturas procedurais (canvas) para os materiais do canteiro.
 *
 * Correções aplicadas:
 * - colorSpace=SRGBColorSpace em todas as texturas de cor (diffuse)
 * - repeat reduzido no ground: 60→12 (evita visual pixelado/bugado)
 * - anisotropy aumentado para reduzir borramento em ângulos rasantes
 * - needsUpdate=true explícito após draw
 */
import * as THREE from "three";

function makeCanvas(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  return { c, ctx };
}

function finish(c: HTMLCanvasElement, repeat: number) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function noise(
  ctx: CanvasRenderingContext2D,
  size: number,
  count: number,
  colors: string[],
  min = 1,
  max = 3,
) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)] ?? "#888";
    const r = min + Math.random() * (max - min);
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Terreno natural do canteiro: grama
export function makeGroundTexture(repeat = 24) {
  const size = 512;
  const { c, ctx } = makeCanvas(size);
  ctx.fillStyle = "#4e7a3a";
  ctx.fillRect(0, 0, size, size);
  // manchas de tonalidade
  for (let i = 0; i < 60; i++) {
    const g = ctx.createRadialGradient(
      Math.random() * size,
      Math.random() * size,
      2,
      Math.random() * size,
      Math.random() * size,
      30 + Math.random() * 60,
    );
    g.addColorStop(0, `rgba(${90 + Math.random() * 40 | 0},${130 + Math.random() * 40 | 0},60,0.18)`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  // fios de grama
  const blades = ["#3f6a2e", "#5c8c42", "#6f9c4e", "#375f2a", "#7ba85a"];
  for (let i = 0; i < 9000; i++) {
    ctx.strokeStyle = blades[Math.floor(Math.random() * blades.length)] ?? "#4e7a3a";
    ctx.lineWidth = 0.7 + Math.random() * 0.9;
    const x = Math.random() * size;
    const y = Math.random() * size;
    const h = 3 + Math.random() * 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, y - h);
    ctx.stroke();
  }
  noise(ctx, size, 900, ["#8fae6a", "#2f5324"], 0.4, 1.2);
  return finish(c, repeat);
}


export function makeConcreteTexture(repeat = 4) {
  const size = 256;
  const { c, ctx } = makeCanvas(size);
  ctx.fillStyle = "#cfcabf";
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, 3500, ["#c4bfb3", "#d8d3c8", "#bab5a9"], 0.5, 2);
  return finish(c, repeat);
}

export function makeAsphaltTexture(repeat = 24) {
  const size = 256;
  const { c, ctx } = makeCanvas(size);
  ctx.fillStyle = "#4c4a47";
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, 6000, ["#413f3d", "#595653", "#666360"], 0.5, 2);
  return finish(c, repeat);
}

export function makeSandTexture(repeat = 3) {
  const size = 256;
  const { c, ctx } = makeCanvas(size);
  ctx.fillStyle = "#c9a86a";
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, 6000, ["#bd9d61", "#d6b678", "#b08e57"], 0.5, 1.8);
  return finish(c, repeat);
}

export function makeGravelTexture(repeat = 3) {
  const size = 256;
  const { c, ctx } = makeCanvas(size);
  ctx.fillStyle = "#8d8d8a";
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, 2600, ["#6f6f6d", "#a3a3a0", "#5d5d5b", "#b5b5b1"], 1.5, 4.5);
  return finish(c, repeat);
}

export function makeWoodTexture(repeat = 2) {
  const size = 256;
  const { c, ctx } = makeCanvas(size);
  ctx.fillStyle = "#9a6a3c";
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 4) {
    ctx.fillStyle = `rgba(80,48,22,${0.08 + Math.random() * 0.14})`;
    ctx.fillRect(0, y, size, 2 + Math.random() * 2);
  }
  noise(ctx, size, 1200, ["#8a5c33", "#ac7a49"], 0.4, 1.4);
  return finish(c, repeat);
}

export function makeMetalTexture(repeat = 2) {
  const size = 256;
  const { c, ctx } = makeCanvas(size);
  ctx.fillStyle = "#9fa6ab";
  ctx.fillRect(0, 0, size, size);
  for (let x = 0; x < size; x += 8) {
    ctx.fillStyle = `rgba(120,128,134,${0.25 + Math.random() * 0.2})`;
    ctx.fillRect(x, 0, 3, size);
  }
  return finish(c, repeat);
}

export function makeRoofTexture(repeat = 6) {
  const size = 256;
  const { c, ctx } = makeCanvas(size);
  ctx.fillStyle = "#b9bcbe";
  ctx.fillRect(0, 0, size, size);
  for (let x = 0; x < size; x += 16) {
    ctx.fillStyle = "rgba(140,144,148,0.55)";
    ctx.fillRect(x, 0, 7, size);
  }
  return finish(c, repeat);
}

export function makeTileTexture(repeat = 8) {
  const size = 256;
  const { c, ctx } = makeCanvas(size);
  ctx.fillStyle = "#d9d4c9";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(150,145,135,0.7)";
  ctx.lineWidth = 3;
  for (let i = 0; i <= size; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  noise(ctx, size, 800, ["#cfc9bd", "#e2ddd2"], 0.5, 1.5);
  return finish(c, repeat);
}


/**
 * Scene.tsx — maquete 3D do canteiro de obras + UBS Porte II.
 *
 * Unidades: metros (1 unidade = 1 m). A prancha de referência é apresentada
 * na escala 1:50, ou seja, 1 cm impresso = 0,50 m na maquete.
 * Portas (0,90 x 2,10 m) e janelas (1,20 m de peitoril 1,00 m) seguem
 * dimensões usuais de projeto.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Sky } from "@react-three/drei";
import * as THREE from "three";

import {
  CATEGORY_INFO,
  EQUIPMENT,
  SITE_D,
  SITE_ELEMENTS,
  SITE_W,
  type Category,
  type SiteElement,
} from "@/lib/site-data";
import { UBS_MASSES, UBS_ROOMS, UBS_ZONE_INFO, type UbsRoom } from "@/lib/ubs-data";
import { ENGINEERS } from "@/lib/engineer-data";
import Engineer from "@/components/site/Engineer";
import {
  makeAsphaltTexture,
  makeConcreteTexture,
  makeGravelTexture,
  makeGroundTexture,
  makeMetalTexture,
  makeRoofTexture,
  makeSandTexture,
  makeTileTexture,
  makeWoodTexture,
} from "@/components/site/textures";

export type SceneProps = {
  mode: "orbit" | "walk";
  visibleCategories: Record<Category, boolean>;
  showUbsRooms: boolean;
  showRoofs: boolean;
  showEngineers: boolean;
  highlightNr: string | null;
  focus: { x: number; z: number; label: string } | null;
  onSelect: (v: { id: string; label: string; detail: string } | null) => void;
};

/* --------------------------------------------------------------- texturas */

function useSiteTextures() {
  return useMemo(
    () => ({
      ground: makeGroundTexture(12),
      concrete: makeConcreteTexture(3),
      asphalt: makeAsphaltTexture(20),
      sand: makeSandTexture(2),
      gravel: makeGravelTexture(2),
      wood: makeWoodTexture(2),
      metal: makeMetalTexture(2),
      roof: makeRoofTexture(6),
      tile: makeTileTexture(6),
    }),
    [],
  );
}

type Tex = ReturnType<typeof useSiteTextures>;

const DOOR_W = 0.9;
const DOOR_H = 2.1;
const SILL_H = 1.0;
const HEAD_H = 2.1;

/* ------------------------------------------------- parede com vãos (esquadrias) */

/**
 * Parede reta ao longo do eixo X local, com opção de porta central e/ou
 * faixa de janelas. Os vãos são construídos por segmentos (sem CSG).
 */
function Wall({
  len,
  h,
  t = 0.15,
  door = false,
  windows = 0,
  color = "#d7d1c4",
  map,
}: {
  len: number;
  h: number;
  t?: number;
  door?: boolean | undefined;
  windows?: number | undefined;
  color?: string | undefined;
  map?: THREE.Texture | undefined;
}) {
  const mat = (
    <meshStandardMaterial color={color} map={map ?? null} roughness={0.92} metalness={0.02} />
  );

  if (door && len > DOOR_W + 0.6) {
    const side = (len - DOOR_W) / 2;
    return (
      <group>
        <mesh position={[-(DOOR_W / 2 + side / 2), h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[side, h, t]} />
          {mat}
        </mesh>
        <mesh position={[DOOR_W / 2 + side / 2, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[side, h, t]} />
          {mat}
        </mesh>
        {h > DOOR_H && (
          <mesh position={[0, DOOR_H + (h - DOOR_H) / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[DOOR_W, h - DOOR_H, t]} />
            {mat}
          </mesh>
        )}
        {/* folha da porta */}
        <mesh position={[0, DOOR_H / 2, t * 0.2]} castShadow>
          <boxGeometry args={[DOOR_W - 0.06, DOOR_H - 0.05, 0.05]} />
          <meshStandardMaterial color="#8a5a30" roughness={0.7} />
        </mesh>
        <mesh position={[DOOR_W / 2 - 0.18, DOOR_H / 2, t * 0.2 + 0.05]}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshStandardMaterial color="#c9b06a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* soleira */}
        <mesh position={[0, 0.03, t * 0.4]} receiveShadow>
          <boxGeometry args={[DOOR_W + 0.2, 0.06, 0.5]} />
          <meshStandardMaterial color="#b8b2a4" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  if (windows > 0 && h > HEAD_H + 0.15 && len > 1.4) {
    const pier = 0.45;
    const free = Math.max(len - pier * (windows + 1), 0.6);
    const win = free / windows;
    const piers = Array.from({ length: windows + 1 }).map(
      (_, i) => -len / 2 + pier / 2 + i * (pier + win),
    );
    const wins = Array.from({ length: windows }).map(
      (_, i) => -len / 2 + pier + win / 2 + i * (pier + win),
    );
    return (
      <group>
        {/* peitoril */}
        <mesh position={[0, SILL_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[len, SILL_H, t]} />
          {mat}
        </mesh>
        {/* verga */}
        <mesh position={[0, HEAD_H + (h - HEAD_H) / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[len, h - HEAD_H, t]} />
          {mat}
        </mesh>
        {piers.map((px, i) => (
          <mesh key={`p${i}`} position={[px, (SILL_H + HEAD_H) / 2, 0]} castShadow>
            <boxGeometry args={[pier, HEAD_H - SILL_H, t]} />
            {mat}
          </mesh>
        ))}
        {wins.map((px, i) => (
          <group key={`w${i}`} position={[px, (SILL_H + HEAD_H) / 2, 0]}>
            <mesh>
              <boxGeometry args={[win, HEAD_H - SILL_H, 0.03]} />
              <meshPhysicalMaterial
                color="#a8c8d8"
                transparent
                opacity={0.42}
                roughness={0.08}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[0.05, HEAD_H - SILL_H, 0.05]} />
              <meshStandardMaterial color="#8d949a" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  return (
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[len, h, t]} />
      {mat}
    </mesh>
  );
}

/** Caixa de 4 paredes com porta na face sul e janelas nas demais. */
function WalledBox({
  w,
  d,
  h,
  t = 0.15,
  color,
  map,
  doorSide = "south",
  windows = true,
}: {
  w: number;
  d: number;
  h: number;
  t?: number | undefined;
  color?: string | undefined;
  map?: THREE.Texture | undefined;
  doorSide?: "south" | "north";
  windows?: boolean;
}) {
  const nWin = (l: number) => (windows ? Math.max(1, Math.min(4, Math.floor(l / 3))) : 0);
  return (
    <group>
      <group position={[0, 0, d / 2]}>
        <Wall
          len={w}
          h={h}
          t={t}
          color={color}
          map={map}
          door={doorSide === "south"}
          windows={doorSide === "south" ? 0 : nWin(w)}
        />
      </group>
      <group position={[0, 0, -d / 2]}>
        <Wall
          len={w}
          h={h}
          t={t}
          color={color}
          map={map}
          door={doorSide === "north"}
          windows={doorSide === "north" ? 0 : nWin(w)}
        />
      </group>
      <group position={[-w / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Wall len={d} h={h} t={t} color={color} map={map} windows={nWin(d)} />
      </group>
      <group position={[w / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Wall len={d} h={h} t={t} color={color} map={map} windows={nWin(d)} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ terreno */

function Terrain({ tex }: { tex: Tex }) {
  const pad = 16;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[SITE_W + pad * 2, SITE_D + pad * 2]} />
        <meshStandardMaterial color="#7d8a63" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[SITE_W, SITE_D]} />
        <meshStandardMaterial map={tex.ground} roughness={1} />
      </mesh>
    </group>
  );
}

/** Tapume metálico do canteiro com portão de entrada/saída ao sul. */
function FenceWithGate({ tex, onPick }: { tex: Tex; onPick: () => void }) {
  const h = 2.2;
  const gateW = 8;
  const hw = SITE_W / 2;
  const hd = SITE_D / 2;
  const panelSide = (SITE_W - gateW) / 2;

  const Panel = ({
    len,
    pos,
    rotY = 0,
  }: {
    len: number;
    pos: [number, number, number];
    rotY?: number;
  }) => (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[len, h, 0.08]} />
        <meshStandardMaterial map={tex.metal} color="#93a1aa" metalness={0.35} roughness={0.6} />
      </mesh>
      {Array.from({ length: Math.max(2, Math.floor(len / 3)) }).map((_, i, arr) => (
        <mesh key={i} position={[-len / 2 + (i * len) / (arr.length - 1 || 1), h / 2, 0.08]}>
          <boxGeometry args={[0.12, h + 0.15, 0.12]} />
          <meshStandardMaterial color="#5d666d" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );

  return (
    <group>
      <Panel len={SITE_W} pos={[0, 0, -hd]} />
      <Panel len={SITE_D} pos={[-hw, 0, 0]} rotY={Math.PI / 2} />
      <Panel len={SITE_D} pos={[hw, 0, 0]} rotY={Math.PI / 2} />
      <Panel len={panelSide} pos={[-hw + panelSide / 2, 0, hd]} />
      <Panel len={panelSide} pos={[hw - panelSide / 2, 0, hd]} />

      {/* Portão de entrada e saída (duas folhas de correr, semiabertas) */}
      <group
        position={[0, 0, hd]}
        onClick={(e) => {
          e.stopPropagation();
          onPick();
        }}
      >
        {([-1, 1] as const).map((s) => (
          <group key={s} position={[(s * gateW) / 4, 0, 0]} rotation={[0, s * -0.55, 0]}>
            <mesh position={[(s * gateW) / 4, h / 2, 0]} castShadow>
              <boxGeometry args={[gateW / 2, h, 0.1]} />
              <meshStandardMaterial
                map={tex.metal}
                color="#c8a63c"
                metalness={0.45}
                roughness={0.5}
              />
            </mesh>
          </group>
        ))}
        {/* pilaretes e travessa superior */}
        {([-gateW / 2, gateW / 2] as const).map((px) => (
          <mesh key={px} position={[px, (h + 0.8) / 2, 0]} castShadow>
            <boxGeometry args={[0.28, h + 0.8, 0.28]} />
            <meshStandardMaterial map={tex.concrete} color="#b9b3a6" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, h + 0.7, 0]} castShadow>
          <boxGeometry args={[gateW + 0.3, 0.5, 0.2]} />
          <meshStandardMaterial color="#e0b93a" roughness={0.6} />
        </mesh>
        {/* faixa de acesso pavimentada */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 4]} receiveShadow>
          <planeGeometry args={[gateW, 10]} />
          <meshStandardMaterial map={tex.asphalt} roughness={0.95} />
        </mesh>
        <Html center position={[0, h + 1.8, 0]} zIndexRange={[20, 0]}>
          <span className="pointer-events-none select-none whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow">
            Portão de entrada e saída
          </span>
        </Html>
      </group>
    </group>
  );
}

/* --------------------------------------------------- elementos do canteiro */

function Barrack({
  el,
  dim,
  tex,
  onPick,
}: {
  el: SiteElement;
  dim: boolean;
  tex: Tex;
  onPick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const { w, d, x, z } = el.geom;
  const color = CATEGORY_INFO[el.category].color;

  return (
    <group
      position={[x, 0, z]}
      visible={!dim || true}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
    >
      {/* base / contrapiso */}
      <mesh position={[0, 0.09, 0]} receiveShadow>
        <boxGeometry args={[w + 0.6, 0.18, d + 0.6]} />
        <meshStandardMaterial map={tex.concrete} color="#c2bcae" roughness={0.95} />
      </mesh>
      <group position={[0, 0.18, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial map={tex.tile} color="#e6e1d6" roughness={0.7} />
        </mesh>
        <WalledBox w={w} d={d} h={el.height} color={hover ? "#f2d675" : color} map={tex.concrete} />
        {/* cobertura metálica com beiral */}
        <mesh position={[0, el.height + 0.14, 0]} castShadow>
          <boxGeometry args={[w + 0.7, 0.22, d + 0.7]} />
          <meshStandardMaterial map={tex.roof} color="#aeb3b7" metalness={0.3} roughness={0.6} />
        </mesh>
      </group>
      {(hover || !dim) && (
        <Html center position={[0, el.height + 1.6, 0]} zIndexRange={[20, 0]}>
          <span className="pointer-events-none select-none whitespace-nowrap rounded bg-card/85 px-1.5 py-0.5 text-[10px] font-medium text-card-foreground shadow">
            {el.label}
          </span>
        </Html>
      )}
      {dim && (
        <mesh position={[0, el.height / 2, 0]}>
          <boxGeometry args={[w + 0.8, el.height + 0.6, d + 0.8]} />
          <meshBasicMaterial color="#2b2b28" transparent opacity={0.45} />
        </mesh>
      )}
    </group>
  );
}

/** Baia de material a granel: paredes de madeira + monte do material. */
function StockBay({
  el,
  dim,
  tex,
  onPick,
}: {
  el: SiteElement;
  dim: boolean;
  tex: Tex;
  onPick: () => void;
}) {
  const { w, d, x, z } = el.geom;
  const [hover, setHover] = useState(false);
  const wallH = 1.1;
  const t = 0.16;

  const heapTex =
    el.id === "areia" ? tex.sand : el.id === "brita" ? tex.gravel : tex.concrete;
  const heapColor =
    el.id === "areia" ? "#d3ad6b" : el.id === "brita" ? "#8f8f8c" : el.id === "cal" ? "#e6e3dc" : "#b9b3a8";

  return (
    <group
      position={[x, 0, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[w + 0.6, d + 0.6]} />
        <meshStandardMaterial map={tex.concrete} color="#b5afa2" roughness={1} />
      </mesh>
      {[
        { p: [0, wallH / 2, -d / 2] as [number, number, number], s: [w, wallH, t] as [number, number, number] },
        { p: [-w / 2, wallH / 2, 0] as [number, number, number], s: [t, wallH, d] as [number, number, number] },
        { p: [w / 2, wallH / 2, 0] as [number, number, number], s: [t, wallH, d] as [number, number, number] },
      ].map((b, i) => (
        <mesh key={i} position={b.p} castShadow receiveShadow>
          <boxGeometry args={b.s} />
          <meshStandardMaterial map={tex.wood} color="#9a6f45" roughness={0.9} />
        </mesh>
      ))}

      {el.id === "cimento" ? (
        // sacos de cimento empilhados sobre estrado
        <group>
          <mesh position={[0, 0.1, 0]} receiveShadow>
            <boxGeometry args={[w - 1, 0.2, d - 0.8]} />
            <meshStandardMaterial map={tex.wood} color="#9a6f45" />
          </mesh>
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 3 }).map((_, col) => (
              <mesh
                key={`${row}-${col}`}
                position={[
                  -w / 2 + 1.4 + row * ((w - 2.4) / 3),
                  0.28 + col * 0.26,
                  (col % 2 === 0 ? 0.15 : -0.15),
                ]}
                rotation={[0, col * 0.15, 0]}
                castShadow
              >
                <boxGeometry args={[1.1, 0.24, 0.75]} />
                <meshStandardMaterial color={hover ? "#f2d675" : "#cdc6b4"} roughness={1} />
              </mesh>
            )),
          )}
        </group>
      ) : (
        // monte cônico de material a granel
        <group>
          {[-0.28, 0.28].map((f, i) => (
            <mesh key={i} position={[f * w * 0.5, 0.02, 0]} castShadow receiveShadow>
              <coneGeometry args={[Math.min(d, w * 0.35) / 1.7, 1.5, 22]} />
              <meshStandardMaterial
                map={heapTex}
                color={hover ? "#f2d675" : heapColor}
                roughness={1}
              />
            </mesh>
          ))}
        </group>
      )}

      <Html center position={[0, 2.2, 0]} zIndexRange={[20, 0]}>
        <span className="pointer-events-none select-none whitespace-nowrap rounded bg-card/85 px-1.5 py-0.5 text-[10px] font-medium text-card-foreground shadow">
          {el.label}
        </span>
      </Html>
      {dim && (
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[w + 0.8, 2.4, d + 0.8]} />
          <meshBasicMaterial color="#2b2b28" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

/** Estoque de aço (vergalhões sobre cavaletes). */
function SteelStock({
  el,
  tex,
  onPick,
}: {
  el: SiteElement;
  tex: Tex;
  onPick: () => void;
}) {
  const { w, d, x, z } = el.geom;
  return (
    <group
      position={[x, 0, z]}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={tex.concrete} color="#b5afa2" />
      </mesh>
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={i} position={[0, 0, -d / 2 + 1.5 + (i * (d - 3)) / 3]}>
          {[-w / 4, w / 4].map((px) => (
            <mesh key={px} position={[px, 0.25, 0]} castShadow>
              <boxGeometry args={[0.15, 0.5, 0.15]} />
              <meshStandardMaterial map={tex.wood} color="#8a6338" />
            </mesh>
          ))}
          {Array.from({ length: 6 }).map((_, j) => (
            <mesh
              key={j}
              position={[0, 0.55 + Math.floor(j / 3) * 0.12, -0.2 + (j % 3) * 0.2]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.05, 0.05, w * 0.8, 8]} />
              <meshStandardMaterial color="#8a6a4a" metalness={0.6} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      <Html center position={[0, 2, 0]} zIndexRange={[20, 0]}>
        <span className="pointer-events-none select-none whitespace-nowrap rounded bg-card/85 px-1.5 py-0.5 text-[10px] font-medium text-card-foreground shadow">
          {el.label}
        </span>
      </Html>
    </group>
  );
}

function RoadArea({
  el,
  dim,
  tex,
  onPick,
}: {
  el: SiteElement;
  dim: boolean;
  tex: Tex;
  onPick: () => void;
}) {
  const { w, d, x, z } = el.geom;
  return (
    <group
      position={[x, 0, z]}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={tex.asphalt} roughness={0.95} transparent opacity={dim ? 0.3 : 1} />
      </mesh>
      {/* meio-fio */}
      {([-d / 2, d / 2] as const).map((pz) => (
        <mesh key={pz} position={[0, 0.09, pz]} receiveShadow>
          <boxGeometry args={[w, 0.18, 0.25]} />
          <meshStandardMaterial map={tex.concrete} color="#c6c0b3" />
        </mesh>
      ))}
      {/* faixa central tracejada */}
      {Array.from({ length: Math.floor(w / 4) }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-w / 2 + 2 + i * 4, 0.07, 0]}>
          <planeGeometry args={[1.8, 0.2]} />
          <meshBasicMaterial color="#efe6cf" transparent opacity={dim ? 0.2 : 0.9} />
        </mesh>
      ))}
      {/* faixa de pedestres junto ao acesso */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={`p${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[w / 2 - 5 + i * 0.7, 0.07, 0]}
        >
          <planeGeometry args={[0.35, d - 0.8]} />
          <meshBasicMaterial color="#f3ecd9" transparent opacity={dim ? 0.15 : 0.75} />
        </mesh>
      ))}
      {/* cones de sinalização */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={`c${i}`} position={[-w / 2 + 6 + i * (w / 6), 0.06, d / 2 - 0.6]}>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.4, 0.05, 0.4]} />
            <meshStandardMaterial color="#2f2f2c" />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <coneGeometry args={[0.17, 0.6, 12]} />
            <meshStandardMaterial color="#e2622a" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ConstructionArea({ el, dim, tex }: { el: SiteElement; dim: boolean; tex: Tex }) {
  const { w, d, x, z } = el.geom;
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={tex.gravel} color="#9a958b" transparent opacity={dim ? 0.3 : 1} />
      </mesh>
      {/* cerca de isolamento da frente de serviço (NR-18) */}
      {Array.from({ length: Math.floor(w / 4) }).map((_, i) => (
        <mesh key={`n${i}`} position={[-w / 2 + 2 + i * 4, 0.55, -d / 2]} castShadow>
          <boxGeometry args={[0.08, 1.1, 0.08]} />
          <meshStandardMaterial color="#d8d2c4" />
        </mesh>
      ))}
      {([-d / 2, d / 2] as const).map((pz) => (
        <mesh key={pz} position={[0, 0.95, pz]}>
          <boxGeometry args={[w, 0.12, 0.05]} />
          <meshStandardMaterial color="#e0b93a" transparent opacity={dim ? 0.25 : 0.95} />
        </mesh>
      ))}
      {([-w / 2, w / 2] as const).map((px) => (
        <mesh key={px} position={[px, 0.95, 0]}>
          <boxGeometry args={[0.05, 0.12, d]} />
          <meshStandardMaterial color="#e0b93a" transparent opacity={dim ? 0.25 : 0.95} />
        </mesh>
      ))}
    </group>
  );
}

function PowerSource({
  el,
  dim,
  tex,
  onPick,
}: {
  el: SiteElement;
  dim: boolean;
  tex: Tex;
  onPick: () => void;
}) {
  const { x, z } = el.geom;
  return (
    <group
      position={[x, 0, z]}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
    >
      <mesh position={[0, el.height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, el.height, 12]} />
        <meshStandardMaterial map={tex.wood} color="#6d5b45" roughness={0.95} />
      </mesh>
      <mesh position={[0, el.height - 0.5, 0.35]} castShadow>
        <boxGeometry args={[0.9, 1.2, 0.5]} />
        <meshStandardMaterial map={tex.metal} color="#e0b93a" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, el.height + 0.25, 0]}>
        <boxGeometry args={[1.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#5d666d" metalness={0.5} />
      </mesh>
      <Html center position={[0, el.height + 1.1, 0]} zIndexRange={[20, 0]}>
        <span className="pointer-events-none select-none whitespace-nowrap rounded bg-card/85 px-1.5 py-0.5 text-[10px] font-medium text-card-foreground shadow">
          {el.label} {dim ? "" : ""}
        </span>
      </Html>
    </group>
  );
}

function Mixer({ x, z, tex }: { x: number; z: number; tex: Tex }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.38, 1, 10]} />
        <meshStandardMaterial map={tex.metal} color="#5a5a55" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.15, 0]} rotation={[0.4, 0, 0]} castShadow>
        <sphereGeometry args={[0.6, 18, 14]} />
        <meshStandardMaterial color="#c95f2c" metalness={0.25} roughness={0.55} />
      </mesh>
      {[-0.55, 0.55].map((px) => (
        <mesh key={px} position={[px, 0.22, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.1, 14]} />
          <meshStandardMaterial color="#33322f" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------------- UBS */

function UbsRoomMesh({
  room,
  showRoof,
  tex,
  onPick,
}: {
  room: UbsRoom;
  showRoof: boolean;
  tex: Tex;
  onPick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const { w, d, x, z } = room.geom;
  const h = room.wall;
  const color = UBS_ZONE_INFO[room.zone].color;

  return (
    <group
      position={[x, 0, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.17, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          map={tex.tile}
          color={hover ? "#f2d675" : color}
          roughness={0.6}
        />
      </mesh>
      {h > 0.6 && (
        <group position={[0, 0.16, 0]}>
          <WalledBox
            w={w}
            d={d}
            h={h}
            t={0.15}
            color="#ded7c8"
            map={tex.concrete}
            doorSide="south"
            windows
          />
        </group>
      )}
      {showRoof && room.roof && (
        <mesh position={[0, h + 0.28, 0]} castShadow>
          <boxGeometry args={[w + 0.2, 0.24, d + 0.2]} />
          <meshStandardMaterial map={tex.roof} color="#a5abb0" roughness={0.7} />
        </mesh>
      )}
      {hover && (
        <Html center position={[0, h + 1.6, 0]} zIndexRange={[30, 0]}>
          <span className="pointer-events-none select-none whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow">
            {room.label}
          </span>
        </Html>
      )}
    </group>
  );
}

function Ubs({
  showRooms,
  showRoofs,
  dim,
  tex,
  onPick,
}: {
  showRooms: boolean;
  showRoofs: boolean;
  dim: boolean;
  tex: Tex;
  onPick: (r: { id: string; label: string; detail: string }) => void;
}) {
  return (
    <group>
      {UBS_MASSES.map((m) => (
        <mesh key={m.id} position={[m.geom.x, 0.08, m.geom.z]} receiveShadow>
          <boxGeometry args={[m.geom.w, 0.16, m.geom.d]} />
          <meshStandardMaterial
            map={tex.concrete}
            color="#bdb7a9"
            transparent={dim}
            opacity={dim ? 0.35 : 1}
          />
        </mesh>
      ))}
      {showRooms &&
        UBS_ROOMS.map((r) => (
          <UbsRoomMesh
            key={r.id}
            room={r}
            showRoof={showRoofs}
            tex={tex}
            onPick={() =>
              onPick({
                id: r.id,
                label: r.label,
                detail: `UBS Porte II — ${UBS_ZONE_INFO[r.zone].label}. Esquadrias representadas em dimensões usuais (porta 0,90 × 2,10 m; janela com peitoril de 1,00 m). Prancha apresentada em escala 1:50.`,
              })
            }
          />
        ))}
      <Scaffolding tex={tex} />
    </group>
  );
}

function Scaffolding({ tex }: { tex: Tex }) {
  const mass = UBS_MASSES[1]!;
  const bays = 8;
  return (
    <group position={[mass.geom.x, 0, mass.geom.z - mass.geom.d / 2 - 1.2]}>
      {Array.from({ length: bays }).map((_, i) => {
        const px = -mass.geom.w / 2 + (i * mass.geom.w) / (bays - 1);
        return (
          <group key={i} position={[px, 0, 0]}>
            {[0, 0.9].map((pz) => (
              <mesh key={pz} position={[0, 2, pz]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
                <meshStandardMaterial
                  map={tex.metal}
                  color="#e0b93a"
                  metalness={0.4}
                  roughness={0.5}
                />
              </mesh>
            ))}
          </group>
        );
      })}
      {[1.2, 2.6, 3.9].map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0.45]} castShadow>
            <boxGeometry args={[mass.geom.w, 0.05, 0.9]} />
            <meshStandardMaterial map={tex.wood} color="#a97c4c" roughness={0.95} />
          </mesh>
          {/* guarda-corpo e rodapé (NR-18 / NR-35) */}
          <mesh position={[0, y + 1, 0.95]}>
            <boxGeometry args={[mass.geom.w, 0.05, 0.05]} />
            <meshStandardMaterial color="#e0b93a" metalness={0.3} />
          </mesh>
          <mesh position={[0, y + 0.1, 0.95]}>
            <boxGeometry args={[mass.geom.w, 0.2, 0.04]} />
            <meshStandardMaterial map={tex.wood} color="#8a6338" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ controles */

function WalkControls() {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const locked = useRef(false);

  useEffect(() => {
    camera.position.set(0, 1.7, SITE_D / 2 - 6);
    euler.current.set(0, Math.PI, 0);
    camera.quaternion.setFromEuler(euler.current);
  }, [camera]);

  useEffect(() => {
    const el = gl.domElement;
    const down = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    const click = () => el.requestPointerLock?.();
    const lockChange = () => (locked.current = document.pointerLockElement === el);
    const move = (e: MouseEvent) => {
      if (!locked.current) return;
      euler.current.y -= e.movementX * 0.0022;
      euler.current.x = THREE.MathUtils.clamp(euler.current.x - e.movementY * 0.0022, -1.2, 1.2);
      camera.quaternion.setFromEuler(euler.current);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    el.addEventListener("click", click);
    document.addEventListener("pointerlockchange", lockChange);
    document.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      el.removeEventListener("click", click);
      document.removeEventListener("pointerlockchange", lockChange);
      document.removeEventListener("mousemove", move);
      if (document.pointerLockElement === el) document.exitPointerLock?.();
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const speed = (keys.current["ShiftLeft"] ? 12 : 5) * delta;
    const dir = new THREE.Vector3();
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), fwd).negate();
    if (keys.current["KeyW"] || keys.current["ArrowUp"]) dir.add(fwd);
    if (keys.current["KeyS"] || keys.current["ArrowDown"]) dir.sub(fwd);
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) dir.add(right);
    if (keys.current["KeyA"] || keys.current["ArrowLeft"]) dir.sub(right);
    if (dir.lengthSq() > 0) camera.position.addScaledVector(dir.normalize(), speed);
    camera.position.y = 1.7;
    const lim = 8;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -SITE_W / 2 - lim, SITE_W / 2 + lim);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -SITE_D / 2 - lim, SITE_D / 2 + lim);
  });

  return null;
}

function OrbitRig({ focus }: { focus: SceneProps["focus"] }) {
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  useEffect(() => {
    if (!focus || !controls.current) return;
    const c = controls.current as unknown as {
      target: THREE.Vector3;
      object: THREE.Camera;
      update: () => void;
    };
    c.target.set(focus.x, 1, focus.z);
    c.object.position.set(focus.x + 16, 14, focus.z + 16);
    c.update();
  }, [focus]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2.15}
      minDistance={6}
      maxDistance={200}
      target={[0, 1, 0]}
    />
  );
}

/* --------------------------------------------------------------------- cena */

export default function Scene({
  mode,
  visibleCategories,
  showUbsRooms,
  showRoofs,
  showEngineers,
  highlightNr,
  focus,
  onSelect,
}: SceneProps) {
  const tex = useSiteTextures();
  const isDim = (el: SiteElement) => !!highlightNr && !el.nrs.includes(highlightNr);

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [8, 88, 112], fov: 42, far: 900 }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#cfd9e2"]} />
      <fog attach="fog" args={["#cfd9e2", 140, 360]} />
      <Sky sunPosition={[60, 40, -30]} turbidity={6} rayleigh={1.2} />
      <hemisphereLight args={["#eef4fa", "#8f8a72", 1.1]} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[48, 60, -24]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
      />

      <Terrain tex={tex} />
      <FenceWithGate
        tex={tex}
        onPick={() =>
          onSelect({
            id: "portao",
            label: "Portão de entrada e saída",
            detail:
              "Acesso único e controlado de veículos e pedestres ao canteiro, com tapume, portaria e sinalização. Normas relacionadas: NR-1, NR-12, NR-18.",
          })
        }
      />

      {SITE_ELEMENTS.filter((el) => visibleCategories[el.category]).map((el) => {
        const dim = isDim(el);
        const pick = () =>
          onSelect({
            id: el.id,
            label: el.label,
            detail: `${CATEGORY_INFO[el.category].label} — ${CATEGORY_INFO[el.category].description} Normas relacionadas: ${el.nrs.join(", ")}.`,
          });
        if (el.id === "aco") return <SteelStock key={el.id} el={el} tex={tex} onPick={pick} />;
        if (el.kind === "building")
          return <Barrack key={el.id} el={el} dim={dim} tex={tex} onPick={pick} />;
        if (el.kind === "stock")
          return <StockBay key={el.id} el={el} dim={dim} tex={tex} onPick={pick} />;
        if (el.kind === "road")
          return <RoadArea key={el.id} el={el} dim={dim} tex={tex} onPick={pick} />;
        if (el.kind === "point")
          return <PowerSource key={el.id} el={el} dim={dim} tex={tex} onPick={pick} />;
        return <ConstructionArea key={el.id} el={el} dim={dim} tex={tex} />;
      })}

      {visibleCategories.armazenamento &&
        EQUIPMENT.map((e) => <Mixer key={e.id} x={e.x} z={e.z} tex={tex} />)}

      {visibleCategories.construcao && (
        <Ubs
          showRooms={showUbsRooms}
          showRoofs={showRoofs}
          dim={!!highlightNr && !["NR-18", "NR-35", "NR-6", "NR-35"].includes(highlightNr)}
          tex={tex}
          onPick={onSelect}
        />
      )}

      {showEngineers && (
        <Suspense fallback={null}>
          {ENGINEERS.map((eng) => (
            <Engineer
              key={eng.id}
              model={eng.model}
              position={eng.position}
              rotationY={eng.rotationY}
            />
          ))}
        </Suspense>
      )}

      {mode === "orbit" ? <OrbitRig focus={focus} /> : <WalkControls />}
    </Canvas>
  );
}


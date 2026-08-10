import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Sky, Grid } from "@react-three/drei";
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

export type SceneProps = {
  mode: "orbit" | "walk";
  visibleCategories: Record<Category, boolean>;
  showUbsRooms: boolean;
  showRoofs: boolean;
  highlightNr: string | null;
  focus: { x: number; z: number; label: string } | null;
  onSelect: (v: { id: string; label: string; detail: string } | null) => void;
};

/* ------------------------------------------------------------------ terreno */

function Terrain() {
  const pad = 14;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[SITE_W + pad * 2, SITE_D + pad * 2]} />
        <meshStandardMaterial color="#8a9174" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[SITE_W, SITE_D]} />
        <meshStandardMaterial color="#a09781" />
      </mesh>
      <Grid
        position={[0, 0.02, 0]}
        args={[SITE_W, SITE_D]}
        cellSize={2}
        cellColor="#8d8471"
        sectionSize={10}
        sectionColor="#7b7361"
        fadeDistance={160}
        infiniteGrid={false}
      />
      <Fence />
    </group>
  );
}

function Fence() {
  const h = 2.2;
  const t = 0.18;
  const segs = [
    { x: 0, z: -SITE_D / 2, w: SITE_W, d: t },
    { x: 0, z: SITE_D / 2, w: SITE_W, d: t },
    { x: -SITE_W / 2, z: 0, w: t, d: SITE_D },
    { x: SITE_W / 2, z: 0, w: t, d: SITE_D },
  ];
  return (
    <group>
      {segs.map((s, i) => (
        <mesh key={i} position={[s.x, h / 2, s.z]} castShadow>
          <boxGeometry args={[s.w, h, s.d]} />
          <meshStandardMaterial color="#6f7d86" metalness={0.2} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/* --------------------------------------------------------- elementos canteiro */

function Barrack({
  el,
  dim,
  onPick,
}: {
  el: SiteElement;
  dim: boolean;
  onPick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const { w, d, x, z } = el.geom;
  const color = CATEGORY_INFO[el.category].color;
  const roofH = 0.35;

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
      <mesh position={[0, el.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, el.height, d]} />
        <meshStandardMaterial
          color={hover ? "#f2d675" : color}
          roughness={0.75}
          transparent={dim}
          opacity={dim ? 0.25 : 1}
        />
      </mesh>
      <mesh position={[0, el.height + roofH / 2, 0]} castShadow>
        <boxGeometry args={[w + 0.5, roofH, d + 0.5]} />
        <meshStandardMaterial
          color="#5d6570"
          transparent={dim}
          opacity={dim ? 0.25 : 1}
        />
      </mesh>
      {(hover || !dim) && (
        <Html center position={[0, el.height + 1.4, 0]} zIndexRange={[20, 0]}>
          <span className="pointer-events-none select-none whitespace-nowrap rounded bg-card/85 px-1.5 py-0.5 text-[10px] font-medium text-card-foreground shadow">
            {el.label}
          </span>
        </Html>
      )}
    </group>
  );
}

function StockBay({ el, dim, onPick }: { el: SiteElement; dim: boolean; onPick: () => void }) {
  const { w, d, x, z } = el.geom;
  const [hover, setHover] = useState(false);
  const wallH = 0.9;
  const t = 0.25;
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
      {[
        { p: [0, wallH / 2, -d / 2] as const, s: [w, wallH, t] as const },
        { p: [-w / 2, wallH / 2, 0] as const, s: [t, wallH, d] as const },
        { p: [w / 2, wallH / 2, 0] as const, s: [t, wallH, d] as const },
      ].map((b, i) => (
        <mesh key={i} position={b.p as unknown as [number, number, number]} castShadow>
          <boxGeometry args={b.s as unknown as [number, number, number]} />
          <meshStandardMaterial color="#7a5a3a" transparent={dim} opacity={dim ? 0.25 : 1} />
        </mesh>
      ))}
      <mesh position={[0, el.height / 2.6, 0]} castShadow>
        <boxGeometry args={[w - 0.8, el.height / 1.3, d - 0.8]} />
        <meshStandardMaterial
          color={hover ? "#f2d675" : CATEGORY_INFO[el.category].color}
          roughness={1}
          transparent={dim}
          opacity={dim ? 0.25 : 1}
        />
      </mesh>
      <Html center position={[0, el.height + 1.1, 0]} zIndexRange={[20, 0]}>
        <span className="pointer-events-none select-none whitespace-nowrap rounded bg-card/85 px-1.5 py-0.5 text-[10px] font-medium text-card-foreground shadow">
          {el.label}
        </span>
      </Html>
    </group>
  );
}

function RoadArea({ el, dim, onPick }: { el: SiteElement; dim: boolean; onPick: () => void }) {
  const { w, d, x, z } = el.geom;
  return (
    <group position={[x, 0, z]} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          color={CATEGORY_INFO[el.category].color}
          transparent
          opacity={dim ? 0.2 : 0.95}
        />
      </mesh>
      {/* eixo tracejado da via */}
      {Array.from({ length: Math.floor(w / 3) }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-w / 2 + 1.5 + i * 3, 0.06, 0]}
        >
          <planeGeometry args={[1.4, 0.22]} />
          <meshBasicMaterial color="#efe6cf" transparent opacity={dim ? 0.15 : 0.9} />
        </mesh>
      ))}
    </group>
  );
}

function ConstructionArea({ el, dim }: { el: SiteElement; dim: boolean }) {
  const { w, d, x, z } = el.geom;
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#8f8b80" transparent opacity={dim ? 0.2 : 1} />
      </mesh>
      {/* delimitação da frente de serviço */}
      {[
        [0, -d / 2],
        [0, d / 2],
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.5, pz]}>
          <boxGeometry args={[w, 1, 0.12]} />
          <meshStandardMaterial color="#e0b93a" transparent opacity={dim ? 0.2 : 0.9} />
        </mesh>
      ))}
      {[
        [-w / 2, 0],
        [w / 2, 0],
      ].map(([px, pz], i) => (
        <mesh key={`s${i}`} position={[px, 0.5, pz]}>
          <boxGeometry args={[0.12, 1, d]} />
          <meshStandardMaterial color="#e0b93a" transparent opacity={dim ? 0.2 : 0.9} />
        </mesh>
      ))}
    </group>
  );
}

function PowerSource({ el, dim, onPick }: { el: SiteElement; dim: boolean; onPick: () => void }) {
  const { x, z } = el.geom;
  return (
    <group position={[x, 0, z]} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh position={[0, el.height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, el.height, 10]} />
        <meshStandardMaterial color="#4b4b46" transparent={dim} opacity={dim ? 0.25 : 1} />
      </mesh>
      <mesh position={[0, el.height - 0.4, 0.35]} castShadow>
        <boxGeometry args={[0.9, 1.1, 0.5]} />
        <meshStandardMaterial color="#e0b93a" transparent={dim} opacity={dim ? 0.25 : 1} />
      </mesh>
      <Html center position={[0, el.height + 1, 0]} zIndexRange={[20, 0]}>
        <span className="pointer-events-none select-none whitespace-nowrap rounded bg-card/85 px-1.5 py-0.5 text-[10px] font-medium text-card-foreground shadow">
          {el.label}
        </span>
      </Html>
    </group>
  );
}

function Mixer({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.35, 1, 8]} />
        <meshStandardMaterial color="#5a5a55" />
      </mesh>
      <mesh position={[0, 1.1, 0]} rotation={[0.4, 0, 0]} castShadow>
        <sphereGeometry args={[0.55, 14, 12]} />
        <meshStandardMaterial color="#d0713a" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------------- UBS */

function UbsRoomMesh({
  room,
  showRoof,
  onPick,
}: {
  room: UbsRoom;
  showRoof: boolean;
  onPick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const { w, d, x, z } = room.geom;
  const t = 0.2;
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
      {/* piso / contrapiso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={hover ? "#f2d675" : color} />
      </mesh>
      {h > 0.6 && (
        <>
          {[
            { p: [0, h / 2, -d / 2] as [number, number, number], s: [w, h, t] as [number, number, number] },
            { p: [0, h / 2, d / 2] as [number, number, number], s: [w, h, t] as [number, number, number] },
            { p: [-w / 2, h / 2, 0] as [number, number, number], s: [t, h, d] as [number, number, number] },
            { p: [w / 2, h / 2, 0] as [number, number, number], s: [t, h, d] as [number, number, number] },
          ].map((b, i) => (
            <mesh key={i} position={b.p} castShadow receiveShadow>
              <boxGeometry args={b.s} />
              <meshStandardMaterial color="#cfc6b6" roughness={0.9} />
            </mesh>
          ))}
        </>
      )}
      {showRoof && room.roof && (
        <mesh position={[0, h + 0.12, 0]} castShadow>
          <boxGeometry args={[w + 0.1, 0.24, d + 0.1]} />
          <meshStandardMaterial color="#9aa0a6" roughness={0.8} />
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
  onPick,
}: {
  showRooms: boolean;
  showRoofs: boolean;
  dim: boolean;
  onPick: (r: { id: string; label: string; detail: string }) => void;
}) {
  return (
    <group>
      {/* radier / laje da edificação */}
      {UBS_MASSES.map((m) => (
        <mesh key={m.id} position={[m.geom.x, 0.08, m.geom.z]} receiveShadow>
          <boxGeometry args={[m.geom.w, 0.16, m.geom.d]} />
          <meshStandardMaterial color="#b8b2a5" transparent={dim} opacity={dim ? 0.3 : 1} />
        </mesh>
      ))}
      {showRooms &&
        UBS_ROOMS.map((r) => (
          <UbsRoomMesh
            key={r.id}
            room={r}
            showRoof={showRoofs}
            onPick={() =>
              onPick({
                id: r.id,
                label: r.label,
                detail: `UBS — ${UBS_ZONE_INFO[r.zone].label}. Ambiente conforme a planta baixa layout (prancha sem escala; proporção preservada).`,
              })
            }
          />
        ))}
      {/* estrutura em execução: pilares e andaimes na frente de serviço */}
      <Scaffolding />
    </group>
  );
}

function Scaffolding() {
  const mass = UBS_MASSES[1];
  const bays = 8;
  return (
    <group position={[mass.geom.x, 0, mass.geom.z - mass.geom.d / 2 - 1]}>
      {Array.from({ length: bays }).map((_, i) => {
        const px = -mass.geom.w / 2 + (i * mass.geom.w) / (bays - 1);
        return (
          <group key={i} position={[px, 0, 0]}>
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[0.08, 4, 0.08]} />
              <meshStandardMaterial color="#e0b93a" metalness={0.3} />
            </mesh>
            <mesh position={[0, 2, 0.9]}>
              <boxGeometry args={[0.08, 4, 0.08]} />
              <meshStandardMaterial color="#e0b93a" metalness={0.3} />
            </mesh>
          </group>
        );
      })}
      {[1.2, 2.6, 3.9].map((y) => (
        <mesh key={y} position={[0, y, 0.45]}>
          <boxGeometry args={[mass.geom.w, 0.06, 0.06]} />
          <meshStandardMaterial color="#e0b93a" metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ----------------------------------------------------------------- controles */

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
      euler.current.x = THREE.MathUtils.clamp(
        euler.current.x - e.movementY * 0.0022,
        -1.2,
        1.2,
      );
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
    const speed = (keys.current["ShiftLeft"] ? 14 : 6) * delta;
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
    const lim = 6;
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
      maxDistance={190}
      target={[0, 1, 0]}
    />
  );
}

/* -------------------------------------------------------------------- cena */

export default function Scene({
  mode,
  visibleCategories,
  showUbsRooms,
  showRoofs,
  highlightNr,
  focus,
  onSelect,
}: SceneProps) {
  const nrCats = useMemo(() => {
    if (!highlightNr) return null;
    return highlightNr;
  }, [highlightNr]);

  const isDim = (el: SiteElement) =>
    !!nrCats && !el.nrs.includes(nrCats);

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 62, 82], fov: 45, far: 800 }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#cfd9e2"]} />
      <fog attach="fog" args={["#cfd9e2", 130, 340]} />
      <Sky sunPosition={[60, 40, -30]} turbidity={6} rayleigh={1.2} />
      <hemisphereLight args={["#e6eef5", "#7e7a63", 0.85]} />
      <directionalLight
        position={[48, 60, -24]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
      />

      <Terrain />

      {SITE_ELEMENTS.filter((el) => visibleCategories[el.category]).map((el) => {
        const dim = isDim(el);
        const pick = () =>
          onSelect({
            id: el.id,
            label: el.label,
            detail: `${CATEGORY_INFO[el.category].label} — ${CATEGORY_INFO[el.category].description} Normas relacionadas: ${el.nrs.join(", ")}.`,
          });
        if (el.kind === "building") return <Barrack key={el.id} el={el} dim={dim} onPick={pick} />;
        if (el.kind === "stock") return <StockBay key={el.id} el={el} dim={dim} onPick={pick} />;
        if (el.kind === "road") return <RoadArea key={el.id} el={el} dim={dim} onPick={pick} />;
        if (el.kind === "point") return <PowerSource key={el.id} el={el} dim={dim} onPick={pick} />;
        return <ConstructionArea key={el.id} el={el} dim={dim} />;
      })}

      {visibleCategories.armazenamento &&
        EQUIPMENT.map((e) => <Mixer key={e.id} x={e.x} z={e.z} />)}

      {visibleCategories.construcao && (
        <Ubs
          showRooms={showUbsRooms}
          showRoofs={showRoofs}
          dim={!!nrCats && !["NR-18", "NR-35"].includes(nrCats)}
          onPick={onSelect}
        />
      )}

      {mode === "orbit" ? <OrbitRig focus={focus} /> : <WalkControls />}
    </Canvas>
  );
}

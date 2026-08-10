/**
 * Engineer.tsx
 * Figuras humanas 3D (engenheiros) carregadas via OBJ + texturas PBR.
 *
 * Os modelos já saem do exportador em escala realista (~1.9 m de altura),
 * então NÃO escalamos — só posicionamos no canteiro.
 *
 * Uso:
 *   <Engineer model={1} position={[x, 0, z]} rotationY={Math.PI} />
 *   <Engineer model={2} position={[x, 0, z]} rotationY={0} />
 */

import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

/* ----------------------------------------------------------------- tipos */

type EngineerProps = {
  /** 1 = engineer1 (esbelto), 2 = engineer2 (com EPI/capacete) */
  model?: 1 | 2;
  /** Posição world [x, y, z] — y=0 coloca o pé no chão */
  position?: [number, number, number];
  /** Rotação em Y (radianos) — girar o personagem */
  rotationY?: number;
};

/* ----------------------------------------------------------- sub-componente */

function EngineerMesh({
  model = 1,
  position = [0, 0, 0],
  rotationY = 0,
}: EngineerProps) {
  const base = `/models/engineer${model}`;

  // Carrega o OBJ (suspense via useLoader)
  const obj = useLoader(OBJLoader, `${base}/base.obj`);

  // Carrega as texturas PBR
  const [diffuse, normal, roughness, metallic] = useTexture([
    `${base}/texture_diffuse.png`,
    `${base}/texture_normal.png`,
    `${base}/texture_roughness.png`,
    `${base}/texture_metallic.png`,
  ]);

  // Clona o objeto para que múltiplas instâncias não compartilhem a mesma geometria
  const cloned = useMemo(() => obj.clone(true), [obj]);

  // Aplica o material PBR a todas as malhas do OBJ
  useEffect(() => {
    const mat = new THREE.MeshStandardMaterial();
    mat.map = diffuse ?? null;
    mat.normalMap = normal ?? null;
    mat.roughnessMap = roughness ?? null;
    mat.metalnessMap = metallic ?? null;
    mat.alphaTest = 0.05;

    // Configura as texturas uma vez (flip Y padrão do Three.js para OBJ)
    [diffuse, normal, roughness, metallic].forEach((tex) => {
      if (!tex) return;
      tex.flipY = false; // OBJ exportado do Blender usa coordenadas com Y invertido
      tex.needsUpdate = true;
    });

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = mat;
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    return () => mat.dispose();
  }, [cloned, diffuse, normal, roughness, metallic]);

  return (
    <primitive
      object={cloned}
      position={position}
      rotation={[0, rotationY, 0]}
    />
  );
}

/* ----------------------------------------------------------- export público */

/**
 * Wrapper com Suspense interno — se o modelo ainda estiver carregando,
 * renderiza um placeholder (cápsula simples na mesma posição).
 */
export default function Engineer(props: EngineerProps) {
  const pos = props.position ?? [0, 0, 0];
  return (
    <EngineerMesh {...props} position={pos} />
  );
}

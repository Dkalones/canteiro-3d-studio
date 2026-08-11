/**
 * Engineer.tsx
 * Figuras humanas 3D (engenheiros) carregadas via OBJ + texturas PBR.
 *
 * Os modelos vêm em escala real (~1,8 m). A maquete usa metros, então o
 * personagem entra sem reescala (na prancha impressa, 1:50).
 */

import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

import eng1Obj from "@/assets/models/eng1_base.obj.asset.json";
import eng1Diffuse from "@/assets/models/eng1_texture_diffuse.png.asset.json";
import eng1Normal from "@/assets/models/eng1_texture_normal.png.asset.json";
import eng1Rough from "@/assets/models/eng1_texture_roughness.png.asset.json";
import eng1Metal from "@/assets/models/eng1_texture_metallic.png.asset.json";
import eng2Obj from "@/assets/models/eng2_base.obj.asset.json";
import eng2Diffuse from "@/assets/models/eng2_texture_diffuse.png.asset.json";
import eng2Normal from "@/assets/models/eng2_texture_normal.png.asset.json";
import eng2Rough from "@/assets/models/eng2_texture_roughness.png.asset.json";
import eng2Metal from "@/assets/models/eng2_texture_metallic.png.asset.json";

const SOURCES = {
  1: {
    obj: eng1Obj.url,
    maps: [eng1Diffuse.url, eng1Normal.url, eng1Rough.url, eng1Metal.url],
  },
  2: {
    obj: eng2Obj.url,
    maps: [eng2Diffuse.url, eng2Normal.url, eng2Rough.url, eng2Metal.url],
  },
} as const;

type EngineerProps = {
  /** 1 = engenheiro (camisa), 2 = operário com EPI/capacete */
  model?: 1 | 2;
  position?: [number, number, number];
  rotationY?: number;
};

export default function Engineer({
  model = 1,
  position = [0, 0, 0],
  rotationY = 0,
}: EngineerProps) {
  const src = SOURCES[model];
  const obj = useLoader(OBJLoader, src.obj);
  const [diffuse, normal, roughness, metallic] = useTexture([...src.maps]);

  const cloned = useMemo(() => obj.clone(true), [obj]);

  useEffect(() => {
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.85 });
    [diffuse, normal, roughness, metallic].forEach((tex) => {
      if (!tex) return;
      tex.flipY = false;
      tex.needsUpdate = true;
    });
    if (diffuse) {
      diffuse.colorSpace = THREE.SRGBColorSpace;
      mat.map = diffuse;
    }
    if (normal) mat.normalMap = normal;
    if (roughness) mat.roughnessMap = roughness;
    if (metallic) mat.metalnessMap = metallic;
    mat.alphaTest = 0.05;

    cloned.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = mat;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    return () => mat.dispose();
  }, [cloned, diffuse, normal, roughness, metallic]);

  return <primitive object={cloned} position={position} rotation={[0, rotationY, 0]} />;
}

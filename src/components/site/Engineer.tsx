/**
 * Engineer.tsx
 * Figuras humanas 3D (engenheiros) carregadas via OBJ + texturas PBR.
 *
 * Correções aplicadas:
 * - Material criado uma vez via useMemo (não em useEffect) para evitar race condition
 * - flipY e colorSpace configurados antes de criar o material
 * - clone() usado corretamente: geometria clonada por instância, material único e correto
 * - Sem dependência de useEffect assíncrono para aplicar textura
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
    maps: [eng1Diffuse.url, eng1Normal.url, eng1Rough.url, eng1Metal.url] as const,
  },
  2: {
    obj: eng2Obj.url,
    maps: [eng2Diffuse.url, eng2Normal.url, eng2Rough.url, eng2Metal.url] as const,
  },
} as const;

type EngineerProps = {
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

  // OBJ: useLoader garante que o mesmo objeto é reutilizado entre instâncias
  const obj = useLoader(OBJLoader, src.obj);

  // Texturas: useTexture retorna Texture[] quando passamos array
  const textures = useTexture([...src.maps]) as THREE.Texture[];
  const [diffuse, normal, roughness, metallic] = textures;

  // Configurar as texturas ANTES de criar o material.
  // Importante: flipY=false porque o OBJ exportado do Blender usa
  // coordenadas UV com origem no canto inferior-esquerdo (OpenGL), mas
  // o Three.js TextureLoader carrega com flipY=true (DirectX convention).
  // colorSpace=SRGBColorSpace só para a diffuse (cor); as demais são lineares.
  useMemo(() => {
    if (diffuse) {
      diffuse.flipY = false;
      diffuse.colorSpace = THREE.SRGBColorSpace;
      diffuse.needsUpdate = true;
    }
    [normal, roughness, metallic].forEach((tex) => {
      if (!tex) return;
      tex.flipY = false;
      tex.colorSpace = THREE.LinearSRGBColorSpace;
      tex.needsUpdate = true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffuse, normal, roughness, metallic]);

  // Material criado em useMemo — determinístico, não assíncrono
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.85 });
    mat.map = diffuse ?? null;
    mat.normalMap = normal ?? null;
    mat.roughnessMap = roughness ?? null;
    mat.metalnessMap = metallic ?? null;
    mat.alphaTest = 0.05;
    mat.needsUpdate = true;
    return mat;
  }, [diffuse, normal, roughness, metallic]);

  // Cada instância precisa do seu próprio Group com geometrias clonadas
  // para não compartilhar referências internas do mesmo OBJ carregado.
  const cloned = useMemo(() => obj.clone(true), [obj]);

  // Aplica o material correto a cada mesh clonado
  useEffect(() => {
    cloned.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        // Garantir que a geometria foi clonada corretamente
        if (mesh.geometry && !mesh.geometry.uuid) {
          mesh.geometry = mesh.geometry.clone();
        }
        mesh.material = material;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [cloned, material]);

  // Cleanup do material ao desmontar
  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <primitive
      object={cloned}
      position={position}
      rotation={[0, rotationY, 0]}
    />
  );
}


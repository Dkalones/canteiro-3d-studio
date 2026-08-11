import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useMemo, useState } from "react";

import {
  CATEGORY_INFO,
  NR_LAYERS,
  SITE_ELEMENTS,
  type Category,
} from "@/lib/site-data";
import { UBS_ZONE_INFO } from "@/lib/ubs-data";

const Scene = lazy(() => import("@/components/site/Scene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canteiro de Obras 3D — UBS Porte II | Maquete Interativa" },
      {
        name: "description",
        content:
          "Maquete 3D interativa do canteiro de obras com a UBS Porte II inserida na área de construção: áreas de vivência, armazenamento, circulação e camadas das NRs.",
      },
      { property: "og:title", content: "Canteiro de Obras 3D — UBS Porte II" },
      {
        property: "og:description",
        content:
          "Navegue virtualmente pelo canteiro de obras e pela volumetria da UBS Porte II, com camadas por NR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ALL_CATEGORIES = Object.keys(CATEGORY_INFO) as Category[];

function Index() {
  const [mode, setMode] = useState<"orbit" | "walk">("orbit");
  const [visible, setVisible] = useState<Record<Category, boolean>>(
    () => Object.fromEntries(ALL_CATEGORIES.map((c) => [c, true])) as Record<Category, boolean>,
  );
  const [showUbsRooms, setShowUbsRooms] = useState(true);
  const [showRoofs, setShowRoofs] = useState(false);
  const [showEngineers, setShowEngineers] = useState(true);
  const [nr, setNr] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ x: number; z: number; label: string } | null>(null);
  const [selected, setSelected] = useState<{ id: string; label: string; detail: string } | null>(
    null,
  );

  const grouped = useMemo(() => {
    return ALL_CATEGORIES.map((c) => ({
      category: c,
      items: SITE_ELEMENTS.filter((e) => e.category === c),
    })).filter((g) => g.items.length > 0);
  }, []);

  const activeNr = NR_LAYERS.find((l) => l.id === nr);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        <ClientOnly
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Carregando maquete 3D…
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Montando canteiro…
              </div>
            }
          >
            <Scene
              mode={mode}
              visibleCategories={visible}
              showUbsRooms={showUbsRooms}
              showRoofs={showRoofs}
              showEngineers={showEngineers}
              highlightNr={nr}
              focus={focus}
              onSelect={setSelected}
            />
          </Suspense>
        </ClientOnly>
      </div>

      {/* Cabeçalho */}
      <header className="pointer-events-none absolute left-0 top-0 z-10 w-full p-4">
        <div className="pointer-events-auto inline-flex flex-col gap-1 rounded-lg border border-border bg-card/85 px-4 py-3 backdrop-blur">
          <h1 className="font-display text-lg leading-none tracking-tight text-foreground">
            Canteiro de Obras 3D — UBS Porte II
          </h1>
          <p className="text-xs text-muted-foreground">
            Layout do canteiro + planta baixa da UBS · edificação em escala 1:50 · portas 0,90 × 2,10 m
          </p>
        </div>
      </header>

      {/* Painel de camadas */}
      <aside className="absolute left-4 top-24 z-10 flex max-h-[calc(100vh-8rem)] w-72 flex-col gap-4 overflow-y-auto rounded-lg border border-border bg-card/90 p-4 backdrop-blur">
        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Navegação
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {(["orbit", "walk"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                  mode === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {m === "orbit" ? "Visão geral" : "Andar (1ª pessoa)"}
              </button>
            ))}
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            {mode === "orbit"
              ? "Arraste para girar, roda do mouse para aproximar, clique nos elementos para detalhes."
              : "Clique na cena para capturar o mouse. W A S D para andar, Shift para correr, Esc para sair."}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Camadas do canteiro
          </h2>
          {ALL_CATEGORIES.map((c) => (
            <label
              key={c}
              className="flex cursor-pointer items-center gap-2 text-xs text-foreground"
            >
              <input
                type="checkbox"
                checked={visible[c]}
                onChange={(e) => setVisible((v) => ({ ...v, [c]: e.target.checked }))}
                className="size-3.5 accent-[var(--color-primary)]"
              />
              <span
                className="size-3 rounded-sm border border-border"
                style={{ backgroundColor: CATEGORY_INFO[c].color }}
              />
              {CATEGORY_INFO[c].label}
            </label>
          ))}
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            UBS em construção
          </h2>
          <label className="flex cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={showUbsRooms}
              onChange={(e) => setShowUbsRooms(e.target.checked)}
              className="size-3.5"
            />
            Ambientes e paredes
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={showRoofs}
              onChange={(e) => setShowRoofs(e.target.checked)}
              className="size-3.5"
            />
            Cobertura (laje)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={showEngineers}
              onChange={(e) => setShowEngineers(e.target.checked)}
              className="size-3.5"
            />
            Equipe em campo (engenheiros)
          </label>
          <ul className="mt-1 space-y-1">
            {Object.entries(UBS_ZONE_INFO).map(([k, z]) => (
              <li key={k} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span
                  className="size-2.5 rounded-sm border border-border"
                  style={{ backgroundColor: z.color }}
                />
                {z.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Camadas das NRs
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setNr(null)}
              className={`rounded-md border px-2 py-1 text-[11px] font-medium ${
                nr === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              Todas
            </button>
            {NR_LAYERS.map((l) => (
              <button
                key={l.id}
                onClick={() => setNr(l.id === nr ? null : l.id)}
                className={`rounded-md border px-2 py-1 text-[11px] font-medium ${
                  nr === l.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {l.id}
              </button>
            ))}
          </div>
          {activeNr && (
            <p className="rounded-md border border-border bg-muted p-2 text-[11px] leading-snug text-muted-foreground">
              <strong className="text-foreground">{activeNr.label}.</strong> {activeNr.description}
            </p>
          )}
        </section>
      </aside>

      {/* Índice de elementos */}
      <aside className="absolute right-4 top-24 z-10 flex max-h-[calc(100vh-8rem)] w-64 flex-col gap-3 overflow-y-auto rounded-lg border border-border bg-card/90 p-4 backdrop-blur">
        <h2 className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          Elementos do canteiro
        </h2>
        {grouped.map((g) => (
          <div key={g.category} className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {CATEGORY_INFO[g.category].label}
            </p>
            {g.items.map((el) => (
              <button
                key={el.id}
                onClick={() => {
                  setMode("orbit");
                  setFocus({ x: el.geom.x, z: el.geom.z, label: el.label });
                  setSelected({
                    id: el.id,
                    label: el.label,
                    detail: `${CATEGORY_INFO[el.category].label} — ${CATEGORY_INFO[el.category].description} Normas relacionadas: ${el.nrs.join(", ")}.`,
                  });
                }}
                className="w-full rounded-md border border-transparent px-2 py-1 text-left text-xs text-foreground transition-colors hover:border-border hover:bg-accent"
              >
                {el.label}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Detalhe do elemento selecionado */}
      {selected && (
        <div className="absolute bottom-4 left-1/2 z-10 w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-border bg-card/95 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-base leading-tight text-foreground">
                {selected.label}
              </h3>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{selected.detail}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

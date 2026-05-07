import { useEffect, useState } from "react";
import { useAdminUsers } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import type { SiteTheme, LandingConfig, User } from "@/lib/types";
import { DEFAULT_THEME, DEFAULT_LANDING } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, Search, ChevronRight, ExternalLink, Palette, Type, Layout, Plus, Trash2 } from "lucide-react";

const FONTS    = ["inter", "playfair", "montserrat", "lato"] as const;
const STYLES   = ["gradient", "minimal", "image"] as const;
const RADII    = ["none", "sm", "md", "lg", "full"] as const;

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="h-9 w-12 rounded-md border cursor-pointer p-0.5" />
        <Input value={value} onChange={e => onChange(e.target.value)} className="font-mono text-xs flex-1" placeholder="#000000" />
      </div>
    </div>
  );
}

export default function SitioEditor() {
  const { data: allUsers, loading: loadingUsers } = useAdminUsers();
  const clients = allUsers.filter(u => u.role !== "admin");

  const [q, setQ]           = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [theme, setTheme]   = useState<SiteTheme>(DEFAULT_THEME);
  const [landing, setLanding] = useState<LandingConfig>(DEFAULT_LANDING);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]  = useState(false);
  const [tab, setTab]        = useState<"design" | "content">("design");

  const filtered = clients.filter(c =>
    `${c.businessName} ${c.email} ${c.name}`.toLowerCase().includes(q.toLowerCase())
  );

  const selectClient = async (client: User) => {
    setSelected(client);
    setLoading(true);
    const { data } = await supabase.from("perfiles").select("theme, landing_config").eq("id", client.id).single();
    setTheme({ ...DEFAULT_THEME, ...(data?.theme ?? {}) });
    setLanding({ ...DEFAULT_LANDING, ...(data?.landing_config ?? {}) });
    setLoading(false);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from("perfiles")
      .update({ theme, landing_config: landing })
      .eq("id", selected.id);
    setSaving(false);
    if (error) toast({ title: "Error al guardar", variant: "destructive" });
    else toast({ title: `Sitio de ${selected.businessName} actualizado ✓` });
  };

  const setT = <K extends keyof SiteTheme>(k: K, v: SiteTheme[K]) => setTheme(p => ({ ...p, [k]: v }));
  const setL = <K extends keyof LandingConfig>(k: K, v: LandingConfig[K]) => setLanding(p => ({ ...p, [k]: v }));

  const publicUrl = selected ? `${window.location.origin}/s/${selected.id}` : "";

  return (
    <>
      <PageHeader title="Editor de Sitios" description="Personaliza el diseño y contenido del sitio web de cada cliente." />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">

        {/* Client list */}
        <div className="surface-card overflow-hidden sticky top-6">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar cliente…" className="pl-8 h-9" />
            </div>
          </div>
          {loadingUsers ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Sin clientes</div>
          ) : (
            <ul className="divide-y max-h-[60vh] overflow-y-auto">
              {filtered.map(c => (
                <li key={c.id}>
                  <button onClick={() => selectClient(c)}
                    className={cn("w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors",
                      selected?.id === c.id && "bg-primary/5 border-r-2 border-primary")}>
                    <div className="size-8 rounded-full bg-primary/10 text-primary text-xs font-semibold grid place-items-center shrink-0">
                      {c.businessName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.businessName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{c.email}</div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Editor */}
        {!selected ? (
          <div className="surface-card p-16 text-center text-muted-foreground">
            <Palette className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Selecciona un cliente</p>
            <p className="text-xs mt-1">Elige una clienta para editar su sitio web.</p>
          </div>
        ) : loading ? (
          <div className="surface-card p-16 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selected.businessName}</h2>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                  {publicUrl.replace("https://", "")} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar cambios
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b">
              {([["design", "Diseño", Palette], ["content", "Contenido", Layout]] as const).map(([key, label, Icon]) => (
                <button key={key} onClick={() => setTab(key as any)}
                  className={cn("flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                    tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>

            {/* DESIGN TAB */}
            {tab === "design" && (
              <div className="surface-card p-6 space-y-6">

                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4"><Palette className="h-4 w-4" /> Colores</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <ColorPicker label="Color principal" value={theme.primaryColor} onChange={v => setT("primaryColor", v)} />
                    <ColorPicker label="Fondo" value={theme.bgColor} onChange={v => setT("bgColor", v)} />
                    <ColorPicker label="Fondo tarjetas" value={theme.cardBg} onChange={v => setT("cardBg", v)} />
                    <ColorPicker label="Texto" value={theme.textColor} onChange={v => setT("textColor", v)} />
                    <ColorPicker label="Acento / bordes" value={theme.accentColor} onChange={v => setT("accentColor", v)} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4"><Type className="h-4 w-4" /> Tipografía y forma</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Fuente</Label>
                      <div className="flex flex-wrap gap-2">
                        {FONTS.map(f => (
                          <button key={f} onClick={() => setT("font", f)}
                            className={cn("px-3 py-1.5 text-xs rounded-md border transition-colors capitalize",
                              theme.font === f ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}>
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Bordes</Label>
                      <div className="flex flex-wrap gap-2">
                        {RADII.map(r => (
                          <button key={r} onClick={() => setT("borderRadius", r)}
                            className={cn("px-3 py-1.5 text-xs rounded-md border transition-colors",
                              theme.borderRadius === r ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4"><Layout className="h-4 w-4" /> Estilo del hero</h3>
                  <div className="flex gap-3">
                    {STYLES.map(s => (
                      <button key={s} onClick={() => setT("heroStyle", s)}
                        className={cn("flex-1 py-3 text-xs rounded-lg border font-medium capitalize transition-colors",
                          theme.heroStyle === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}>
                        {s === "gradient" ? "Gradiente" : s === "minimal" ? "Minimalista" : "Con imagen"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONTENT TAB */}
            {tab === "content" && (
              <div className="surface-card p-6 space-y-6">

                <div>
                  <h3 className="text-sm font-semibold mb-4">Hero</h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Título principal</Label>
                      <Input value={landing.heroTitle} onChange={e => setL("heroTitle", e.target.value)} placeholder={selected.businessName} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Subtítulo</Label>
                      <Textarea rows={2} value={landing.heroSubtitle} onChange={e => setL("heroSubtitle", e.target.value)} placeholder="Tu especialidad y propuesta de valor..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Texto del botón CTA</Label>
                      <Input value={landing.ctaText} onChange={e => setL("ctaText", e.target.value)} placeholder="Agendar consulta" />
                    </div>
                    {theme.heroStyle === "image" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">URL imagen de fondo</Label>
                        <Input value={landing.heroImageUrl} onChange={e => setL("heroImageUrl", e.target.value)} placeholder="https://..." />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Sobre mí</h3>
                    <Switch checked={landing.showAbout} onCheckedChange={v => setL("showAbout", v)} />
                  </div>
                  {landing.showAbout && (
                    <Textarea rows={4} value={landing.aboutText} onChange={e => setL("aboutText", e.target.value)}
                      placeholder="Cuéntale a tus clientes sobre ti, tu experiencia y tu enfoque..." />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Instagram</h3>
                    <Switch checked={landing.showInstagram} onCheckedChange={v => setL("showInstagram", v)} />
                  </div>
                  {landing.showInstagram && (
                    <Input value={landing.instagram} onChange={e => setL("instagram", e.target.value)} placeholder="@tunegocio" />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Secciones personalizadas</h3>
                    <Button size="sm" variant="outline" onClick={() => setL("customSections", [...(landing.customSections ?? []), { id: Date.now().toString(), title: "", body: "" }])}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {(landing.customSections ?? []).map((sec, i) => (
                      <div key={sec.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input value={sec.title} placeholder="Título de la sección"
                            onChange={e => setL("customSections", landing.customSections.map((s, j) => j === i ? { ...s, title: e.target.value } : s))} />
                          <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-destructive"
                            onClick={() => setL("customSections", landing.customSections.filter((_, j) => j !== i))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea rows={2} value={sec.body} placeholder="Contenido..."
                          onChange={e => setL("customSections", landing.customSections.map((s, j) => j === i ? { ...s, body: e.target.value } : s))} />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={save} disabled={saving} size="lg">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar sitio de {selected.businessName}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

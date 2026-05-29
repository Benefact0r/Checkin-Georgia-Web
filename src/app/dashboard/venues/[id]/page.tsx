"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getAdminVenue,
  getResources,
  getServices,
  updateVenue,
  createResource,
  updateResource,
  deleteResource,
  createService,
  updateService,
  deleteService,
  type AdminVenueDetail,
  type AdminResource,
  type AdminService,
} from "@/lib/admin-api";
import type { Vertical } from "@/lib/api";
import { VERTICAL_CONFIG, AREA_OPTIONS, type AttrField } from "@/lib/verticals";
import { useAuth } from "../../auth-provider";
import { Uploader } from "../../uploader";

const input =
  "mt-1 block w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const btnPrimary =
  "rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-50";
const btnGhost =
  "rounded-lg border border-ink-200 px-3 py-1.5 text-sm text-ink-600 hover:border-brand hover:text-brand";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

export default function VenueEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [venue, setVenue] = useState<AdminVenueDetail | null>(null);
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    try {
      const t = await token();
      const [v, r, s] = await Promise.all([
        getAdminVenue(t, id),
        getResources(t, id),
        getServices(t, id),
      ]);
      setVenue(v);
      setResources(r.items);
      setServices(s.items);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "error");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p className="text-sm text-ink-400">იტვირთება…</p>;
  if (err && !venue)
    return <p className="rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700">{err}</p>;
  if (!venue) return null;

  const cfg = VERTICAL_CONFIG[venue.vertical as Vertical];

  return (
    <div className="space-y-6">
      <header>
        <Link href="/dashboard/venues" className="text-sm text-brand hover:underline">
          ← ადგილები
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink-900">
          <span className="mr-2">{cfg?.icon}</span>
          {venue.name}
          <span className="ml-2 text-sm font-normal text-ink-400">{cfg?.label}</span>
        </h1>
      </header>

      {err && <p className="rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700">{err}</p>}

      <BasicsSection venue={venue} onSave={reload} />
      {cfg && <AttributesSection venue={venue} cfg={cfg} onSave={reload} />}
      <ServicesSection
        venueId={id}
        services={services}
        hasDuration={cfg?.staffLike ?? false}
        onChange={reload}
      />
      {cfg && (
        <ResourcesSection
          venueId={id}
          cfg={cfg}
          resources={resources}
          services={services}
          onChange={reload}
        />
      )}
      <MediaSection venue={venue} onSave={reload} />
    </div>
  );
}

// --- Basics ------------------------------------------------------------------
function BasicsSection({ venue, onSave }: { venue: AdminVenueDetail; onSave: () => void }) {
  const { token } = useAuth();
  const [f, setF] = useState({
    name: venue.name,
    description: venue.description ?? "",
    phone: venue.phone ?? "",
    email: venue.email ?? "",
    website: venue.website ?? "",
    district: venue.district ?? "",
    address: venue.address,
    status: venue.status,
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function save() {
    setBusy(true);
    try {
      await updateVenue(await token(), venue.id, {
        name: f.name,
        description: f.description || null,
        phone: f.phone || null,
        email: f.email || null,
        website: f.website || null,
        district: f.district || null,
        address: f.address,
        status: f.status,
      });
      onSave();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="ძირითადი">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-xs font-medium text-ink-600">სახელი
          <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label className="text-xs font-medium text-ink-600">სტატუსი
          <select className={input} value={f.status} onChange={(e) => set("status", e.target.value)}>
            <option value="active">active</option>
            <option value="pending">pending</option>
            <option value="paused">paused</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <label className="text-xs font-medium text-ink-600">უბანი
          <input className={input} value={f.district} onChange={(e) => set("district", e.target.value)} />
        </label>
        <label className="text-xs font-medium text-ink-600">მისამართი
          <input className={input} value={f.address} onChange={(e) => set("address", e.target.value)} />
        </label>
        <label className="text-xs font-medium text-ink-600">ტელეფონი
          <input className={input} value={f.phone} onChange={(e) => set("phone", e.target.value)} />
        </label>
        <label className="text-xs font-medium text-ink-600">ვებსაიტი
          <input className={input} value={f.website} onChange={(e) => set("website", e.target.value)} />
        </label>
        <label className="md:col-span-2 text-xs font-medium text-ink-600">აღწერა
          <textarea className={input} rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} />
        </label>
      </div>
      <div className="mt-4">
        <button className={btnPrimary} disabled={busy} onClick={save}>{busy ? "ინახება…" : "შენახვა"}</button>
      </div>
    </Card>
  );
}

// --- Vertical attributes -----------------------------------------------------
function AttributesSection({
  venue,
  cfg,
  onSave,
}: {
  venue: AdminVenueDetail;
  cfg: { label: string; attrFields: AttrField[] };
  onSave: () => void;
}) {
  const { token } = useAuth();
  const [attrs, setAttrs] = useState<Record<string, unknown>>(venue.attributes ?? {});
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: unknown) =>
    setAttrs((s) => {
      const n = { ...s };
      if (v === "" || v == null || (Array.isArray(v) && v.length === 0)) delete n[k];
      else n[k] = v;
      return n;
    });

  async function save() {
    setBusy(true);
    try {
      await updateVenue(await token(), venue.id, { attributes: attrs });
      onSave();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title={`დეტალები — ${cfg.label}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cfg.attrFields.map((field) => (
          <div key={field.key} className={field.type === "menu" ? "md:col-span-2" : ""}>
            <AttrInput field={field} value={attrs[field.key]} onChange={(v) => set(field.key, v)} />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button className={btnPrimary} disabled={busy} onClick={save}>{busy ? "ინახება…" : "შენახვა"}</button>
      </div>
    </Card>
  );
}

function AttrInput({
  field,
  value,
  onChange,
}: {
  field: AttrField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = <span className="text-xs font-medium text-ink-600">{field.label}</span>;
  if (field.type === "boolean")
    return (
      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  if (field.type === "select")
    return (
      <label>{label}
        <select className={input} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    );
  if (field.type === "number")
    return (
      <label>{label}
        <input type="number" className={input} value={(value as number) ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")} />
      </label>
    );
  if (field.type === "tags")
    return (
      <label>{label}
        <input className={input} placeholder={field.placeholder}
          value={Array.isArray(value) ? (value as string[]).join(", ") : ""}
          onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
      </label>
    );
  if (field.type === "music") return <MusicInput value={value} onChange={onChange} />;
  if (field.type === "menu") return <MenuInput value={value} onChange={onChange} />;
  return (
    <label>{label}
      <input className={input} placeholder={field.placeholder} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function MusicInput({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const m = (value as { type?: string; genres?: string[]; nights?: string[] }) ?? {};
  const upd = (patch: object) => onChange({ ...m, ...patch });
  return (
    <div className="rounded-lg border border-ink-200 p-3">
      <p className="mb-2 text-xs font-medium text-ink-600">მუსიკა</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <select className={input} value={m.type ?? ""} onChange={(e) => upd({ type: e.target.value || undefined })}>
          <option value="">—</option>
          <option value="none">არ არის</option>
          <option value="background">ფონური</option>
          <option value="live">ცოცხალი</option>
          <option value="dj">DJ</option>
        </select>
        <input className={input} placeholder="ჟანრები (jazz, house…)" value={(m.genres ?? []).join(", ")}
          onChange={(e) => upd({ genres: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
        <input className={input} placeholder="ღამეები (fri, sat…)" value={(m.nights ?? []).join(", ")}
          onChange={(e) => upd({ nights: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
      </div>
    </div>
  );
}

type MenuSection = { section: string; items: { name: string; price?: string; description?: string }[] };
function MenuInput({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const sections = (Array.isArray(value) ? value : []) as MenuSection[];
  const upd = (next: MenuSection[]) => onChange(next.length ? next : undefined);
  return (
    <div className="rounded-lg border border-ink-200 p-3">
      <p className="mb-2 text-xs font-medium text-ink-600">მენიუ</p>
      {sections.map((sec, si) => (
        <div key={si} className="mb-3 rounded-lg bg-ink-50 p-3">
          <div className="flex items-center gap-2">
            <input className={input} placeholder="სექცია (Starters…)" value={sec.section}
              onChange={(e) => { const n = [...sections]; n[si] = { ...sec, section: e.target.value }; upd(n); }} />
            <button className={btnGhost} onClick={() => upd(sections.filter((_, i) => i !== si))}>წაშლა</button>
          </div>
          {sec.items.map((it, ii) => (
            <div key={ii} className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              <input className={input} placeholder="კერძი" value={it.name}
                onChange={(e) => { const n = [...sections]; n[si].items[ii] = { ...it, name: e.target.value }; upd(n); }} />
              <input className={input} placeholder="ფასი (18 ₾)" value={it.price ?? ""}
                onChange={(e) => { const n = [...sections]; n[si].items[ii] = { ...it, price: e.target.value }; upd(n); }} />
              <input className={input} placeholder="აღწერა" value={it.description ?? ""}
                onChange={(e) => { const n = [...sections]; n[si].items[ii] = { ...it, description: e.target.value }; upd(n); }} />
            </div>
          ))}
          <button className="mt-2 text-xs text-brand hover:underline"
            onClick={() => { const n = [...sections]; n[si].items.push({ name: "" }); upd(n); }}>+ კერძი</button>
        </div>
      ))}
      <button className={btnGhost} onClick={() => upd([...sections, { section: "", items: [] }])}>+ სექცია</button>
    </div>
  );
}

// --- Services (menu / price list) -------------------------------------------
function ServicesSection({
  venueId,
  services,
  hasDuration,
  onChange,
}: {
  venueId: string;
  services: AdminService[];
  hasDuration: boolean;
  onChange: () => void;
}) {
  const { token } = useAuth();
  const [f, setF] = useState({ name: "", category: "", duration: "", priceGel: "", payment: "on_site" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function add() {
    if (!f.name) return;
    setBusy(true);
    try {
      await createService(await token(), venueId, {
        name: f.name,
        category: f.category || null,
        duration_minutes: hasDuration && f.duration ? Number(f.duration) : null,
        price_minor: f.priceGel ? Math.round(Number(f.priceGel) * 100) : null,
        payment_mode: f.payment,
      });
      setF({ name: "", category: "", duration: "", priceGel: "", payment: "on_site" });
      onChange();
    } finally {
      setBusy(false);
    }
  }
  async function remove(idv: string) {
    await deleteService(await token(), idv);
    onChange();
  }

  return (
    <Card title="სერვისები / მენიუ (დაჯავშნადი)">
      {services.length > 0 && (
        <ul className="mb-4 divide-y divide-ink-100">
          {services.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-ink-800">
                {s.name}
                {s.category ? <span className="text-ink-400"> · {s.category}</span> : null}
                {s.duration_minutes ? <span className="text-ink-400"> · {s.duration_minutes}წთ</span> : null}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-ink-600">{s.price_minor != null ? `${(s.price_minor / 100).toFixed(0)} ₾` : "—"}</span>
                <button className={btnGhost} onClick={() => remove(s.id)}>წაშლა</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
        <input className={input} placeholder="დასახელება" value={f.name} onChange={(e) => set("name", e.target.value)} />
        <input className={input} placeholder="კატეგორია" value={f.category} onChange={(e) => set("category", e.target.value)} />
        {hasDuration && <input className={input} type="number" placeholder="წთ" value={f.duration} onChange={(e) => set("duration", e.target.value)} />}
        <input className={input} type="number" placeholder="ფასი ₾" value={f.priceGel} onChange={(e) => set("priceGel", e.target.value)} />
        <button className={btnPrimary} disabled={busy} onClick={add}>+ დამატება</button>
      </div>
    </Card>
  );
}

// --- Resources (workers / tables / rooms) -----------------------------------
function ResourcesSection({
  venueId,
  cfg,
  resources,
  services,
  onChange,
}: {
  venueId: string;
  cfg: {
    resourceLabel: string;
    resourceLabelPlural: string;
    resourceKind: string;
    staffLike: boolean;
    tableLike: boolean;
  };
  resources: AdminResource[];
  services: AdminService[];
  onChange: () => void;
}) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: "",
    capacity: "1",
    role: "",
    serves: "",
    phone: "",
    area: "",
    serviceIds: [] as string[],
  });
  const set = (k: keyof typeof f, v: unknown) => setF((s) => ({ ...s, [k]: v }));

  async function add() {
    if (!f.name) return;
    setBusy(true);
    try {
      const attributes: Record<string, unknown> = {};
      if (cfg.staffLike) {
        if (f.role) attributes.role = f.role;
        if (f.serves) attributes.serves = f.serves;
        if (f.phone) attributes.phone = f.phone;
      }
      if (cfg.tableLike && f.area) attributes.area = f.area;
      await createResource(await token(), venueId, {
        name: f.name,
        kind: cfg.resourceKind,
        capacity: cfg.tableLike ? Number(f.capacity) || 1 : 1,
        attributes,
        service_ids: cfg.staffLike ? f.serviceIds : undefined,
      });
      setF({ name: "", capacity: "1", role: "", serves: "", phone: "", area: "", serviceIds: [] });
      onChange();
    } finally {
      setBusy(false);
    }
  }
  async function remove(idv: string) {
    await deleteResource(await token(), idv);
    onChange();
  }

  return (
    <Card title={cfg.resourceLabelPlural}>
      {resources.length > 0 && (
        <ul className="mb-4 divide-y divide-ink-100">
          {resources.map((r) => {
            const a = r.attributes as { role?: string; serves?: string; phone?: string; area?: string };
            return (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink-800">
                  {r.name}
                  {a.role ? <span className="text-ink-400"> · {a.role}</span> : null}
                  {a.serves ? <span className="text-ink-400"> · {a.serves}</span> : null}
                  {cfg.tableLike ? <span className="text-ink-400"> · {r.capacity} ადგ.{a.area ? ` · ${a.area}` : ""}</span> : null}
                  {a.phone ? <span className="text-ink-400"> · {a.phone}</span> : null}
                </span>
                <button className={btnGhost} onClick={() => remove(r.id)}>წაშლა</button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <input className={input} placeholder={cfg.resourceLabel} value={f.name} onChange={(e) => set("name", e.target.value)} />
        {cfg.staffLike && (
          <>
            <input className={input} placeholder="როლი (barber…)" value={f.role} onChange={(e) => set("role", e.target.value)} />
            <select className={input} value={f.serves} onChange={(e) => set("serves", e.target.value)}>
              <option value="">ვისთვის</option>
              <option value="unisex">უნისექს</option>
              <option value="men">მამაკაცი</option>
              <option value="women">ქალი</option>
            </select>
            <input className={input} placeholder="ტელეფონი" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
          </>
        )}
        {cfg.tableLike && (
          <>
            <input className={input} type="number" placeholder="ადგილები" value={f.capacity} onChange={(e) => set("capacity", e.target.value)} />
            <select className={input} value={f.area} onChange={(e) => set("area", e.target.value)}>
              <option value="">ზონა</option>
              {AREA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </>
        )}
      </div>

      {cfg.staffLike && services.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-ink-600">რა სერვისებს ასრულებს</p>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => {
              const on = f.serviceIds.includes(s.id);
              return (
                <button key={s.id} type="button"
                  onClick={() => set("serviceIds", on ? f.serviceIds.filter((x) => x !== s.id) : [...f.serviceIds, s.id])}
                  className={`rounded-full border px-3 py-1 text-xs transition ${on ? "border-brand bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600"}`}>
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4">
        <button className={btnPrimary} disabled={busy} onClick={add}>+ {cfg.resourceLabel}</button>
      </div>
    </Card>
  );
}

// --- Media (photos / videos) — Phase 3 adds direct upload alongside URLs -----
function MediaSection({ venue, onSave }: { venue: AdminVenueDetail; onSave: () => void }) {
  const { token } = useAuth();
  const [photos, setPhotos] = useState<string[]>(venue.photos ?? []);
  const [videos, setVideos] = useState<string[]>(venue.videos ?? []);
  const [cover, setCover] = useState(venue.cover_url ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await updateVenue(await token(), venue.id, {
        cover_url: cover || null,
        photos,
        videos,
      });
      onSave();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="მედია">
      <div className="flex items-end gap-3">
        <label className="flex-1 text-xs font-medium text-ink-600">ქავერ-სურათი
          <input className={input} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://… ან ატვირთე" />
        </label>
        <Uploader accept="image/*" label="📤 ქავერი" onUploaded={setCover} />
      </div>

      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="cover" className="mt-3 h-32 w-full rounded-lg object-cover" />
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-ink-600">სურათები</p>
          <Uploader accept="image/*" label="📤 სურათი" onUploaded={(u) => setPhotos((p) => [...p, u])} />
        </div>
        <UrlList label="" urls={photos} onChange={setPhotos} />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-ink-600">ვიდეოები</p>
          <Uploader accept="video/*" label="📤 ვიდეო" onUploaded={(u) => setVideos((v) => [...v, u])} />
        </div>
        <UrlList label="" urls={videos} onChange={setVideos} />
      </div>

      <div className="mt-4">
        <button className={btnPrimary} disabled={busy} onClick={save}>{busy ? "ინახება…" : "შენახვა"}</button>
      </div>
    </Card>
  );
}

function UrlList({ label, urls, onChange }: { label: string; urls: string[]; onChange: (u: string[]) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-ink-600">{label}</p>
      {urls.map((u, i) => (
        <div key={i} className="mt-1 flex items-center gap-2">
          <span className="flex-1 truncate text-xs text-ink-500">{u}</span>
          <button className={btnGhost} onClick={() => onChange(urls.filter((_, j) => j !== i))}>წაშლა</button>
        </div>
      ))}
      <div className="mt-1 flex gap-2">
        <input className={input} placeholder="https://…" value={v} onChange={(e) => setV(e.target.value)} />
        <button className={btnGhost} onClick={() => { if (v) { onChange([...urls, v]); setV(""); } }}>+ დამატება</button>
      </div>
    </div>
  );
}

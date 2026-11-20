import { useState, useEffect, useMemo } from "react";

const STAGES = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];
const DOT = ["bg-slate-400", "bg-blue-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500"];
const EMPTY = { company: "", role: "", stipend: "", link: "", notes: "", stage: 0 };

const SEED = [
  { id: 1, company: "Razorpay", role: "Frontend Intern", stipend: 25000, link: "", notes: "Referred by a senior", stage: 2, date: "2026-11-02" },
  { id: 2, company: "Zepto", role: "React Intern", stipend: 20000, link: "", notes: "", stage: 1, date: "2026-11-05" },
  { id: 3, company: "Meesho", role: "Web Intern", stipend: 22000, link: "", notes: "Apply by Dec 1", stage: 0, date: "2026-11-08" },
];

function useLocal(key, init) {
  const [v, setV] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

function Modal({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial);
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.company.trim()) er.company = "Enter the company name.";
    if (!f.role.trim()) er.role = "Enter the role.";
    if (f.stipend === "" || +f.stipend < 0) er.stipend = "Enter a stipend, 0 if unpaid.";
    if (f.link && !/^https?:\/\//.test(f.link)) er.link = "Link must start with http:// or https://";
    setErr(er);
    if (Object.keys(er).length === 0) onSave({ ...f, stipend: +f.stipend });
  };
  const field = (k, label, type = "text") => (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor={k}>{label}</label>
      <input id={k} type={type} value={f[k]} onChange={set(k)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
      <p className="min-h-4 text-xs text-rose-600">{err[k]}</p>
    </div>
  );
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-slate-900/50 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} noValidate
        className="w-full max-w-md space-y-2 rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-bold">{initial.id ? "Edit application" : "New application"}</h2>
        {field("company", "Company")}
        {field("role", "Role")}
        {field("stipend", "Stipend per month (₹)", "number")}
        {field("link", "Job link (optional)")}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="notes">Notes</label>
          <textarea id="notes" rows={2} value={f.notes} onChange={set("notes")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save application</button>
        </div>
      </form>
    </div>
  );
}

function Card({ job, onMove, onEdit, onDelete }) {
  return (
    <article draggable onDragStart={(e) => e.dataTransfer.setData("id", String(job.id))}
      className="mb-3 cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold leading-tight">{job.company}</h3>
          <p className="text-sm text-slate-600">{job.role}</p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold">₹{job.stipend.toLocaleString("en-IN")}</span>
      </div>
      {job.notes && <p className="mt-2 text-xs text-slate-500">{job.notes}</p>}
      <p className="mt-2 text-xs text-slate-400">Added {job.date}</p>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        {job.stage > 0 && <button onClick={() => onMove(job.id, -1)} aria-label="Move back" className="rounded border px-2 py-1">←</button>}
        {job.stage < STAGES.length - 1 && <button onClick={() => onMove(job.id, 1)} aria-label="Move forward" className="rounded border px-2 py-1">→</button>}
        {job.link && <a href={job.link} target="_blank" rel="noreferrer" className="rounded border px-2 py-1 text-blue-600">Open</a>}
        <button onClick={() => onEdit(job)} className="ml-auto rounded border px-2 py-1">Edit</button>
        <button onClick={() => onDelete(job.id)} className="rounded border px-2 py-1 text-rose-600">Delete</button>
      </div>
    </article>
  );
}

export default function HireTrack() {
  const [jobs, setJobs] = useLocal("hiretrack:jobs", SEED);
  const [modal, setModal] = useState(null);
  const [q, setQ] = useState("");
  const [over, setOver] = useState(-1);

  const shown = useMemo(
    () => jobs.filter((j) => (j.company + j.role).toLowerCase().includes(q.toLowerCase())),
    [jobs, q]
  );
  const applied = jobs.filter((j) => j.stage >= 1 && j.stage !== 4).length + jobs.filter((j) => j.stage === 4).length;
  const interviews = jobs.filter((j) => j.stage === 2 || j.stage === 3).length;
  const offers = jobs.filter((j) => j.stage === 3).length;
  const reply = applied ? Math.round((interviews / applied) * 100) : 0;

  const move = (id, d) => setJobs(jobs.map((j) => (j.id === id ? { ...j, stage: j.stage + d } : j)));
  const del = (id) => window.confirm("Delete this application?") && setJobs(jobs.filter((j) => j.id !== id));
  const save = (f) => {
    if (f.id) setJobs(jobs.map((j) => (j.id === f.id ? f : j)));
    else setJobs([...jobs, { ...f, id: Date.now(), date: new Date().toISOString().slice(0, 10) }]);
    setModal(null);
  };
  const drop = (e, stage) => {
    const id = +e.dataTransfer.getData("id");
    setJobs(jobs.map((j) => (j.id === id ? { ...j, stage } : j)));
    setOver(-1);
  };

  const kpis = [["Tracked", jobs.length], ["Applied", applied], ["Interviews", interviews], ["Offers", offers], ["Reply rate", reply + "%"]];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">HireTrack</h1>
            <p className="text-sm text-slate-500">Every application, one board.</p>
          </div>
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company or role" aria-label="Search"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={() => setModal(EMPTY)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Add application</button>
          </div>
        </header>

        <section className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {kpis.map(([l, v]) => (
            <div key={l} className="rounded-xl border border-slate-200 bg-white p-3">
              <b className="block text-2xl font-extrabold">{v}</b>
              <span className="text-sm text-slate-500">{l}</span>
            </div>
          ))}
        </section>

        <main className="grid auto-cols-[250px] grid-flow-col gap-3 overflow-x-auto pb-3 lg:auto-cols-fr">
          {STAGES.map((name, i) => {
            const list = shown.filter((j) => j.stage === i);
            return (
              <section key={name} onDragOver={(e) => { e.preventDefault(); setOver(i); }} onDragLeave={() => setOver(-1)} onDrop={(e) => drop(e, i)}
                className={"min-h-64 rounded-2xl border p-2 " + (over === i ? "border-dashed border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50")}>
                <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-bold">
                  <span className={"h-2.5 w-2.5 rounded-full " + DOT[i]} />{name}
                  <span className="ml-auto font-semibold text-slate-400">{list.length}</span>
                </h2>
                {list.map((j) => <Card key={j.id} job={j} onMove={move} onEdit={setModal} onDelete={del} />)}
                {list.length === 0 && <p className="px-1 text-sm text-slate-400">Nothing here yet. Drag a card in.</p>}
              </section>
            );
          })}
        </main>
      </div>
      {modal && <Modal initial={modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}

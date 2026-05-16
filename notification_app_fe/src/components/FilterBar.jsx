import { Log } from "../middleware/logger";

const TYPES = ["", "Placement", "Result", "Event"];

export default function FilterBar({ filterType, onFilterChange, topN, onTopNChange }) {
  const handleType = async (val) => {
    await Log("frontend", "info", "component",
      `Filter type changed to '${val || "all"}'`).catch(() => {});
    onFilterChange(val);
  };

  const handleTopN = async (e) => {
    const val = Number(e.target.value);
    await Log("frontend", "info", "component",
      `Top-N changed to ${val}`).catch(() => {});
    onTopNChange(val);
  };

  return (
    <div style={s.bar}>
      <div style={s.group}>
        <label style={s.label}>Show top</label>
        <select value={topN} onChange={handleTopN} style={s.select}>
          {[5, 10, 15, 20].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <label style={s.label}>notifications</label>
      </div>

      <div style={s.group}>
        <label style={s.label}>Type:</label>
        {TYPES.map(t => (
          <button
            key={t || "all"}
            onClick={() => handleType(t)}
            style={{ ...s.pill, ...(filterType === t ? s.pillOn : {}) }}
          >
            {t || "All"}
          </button>
        ))}
      </div>
    </div>
  );
}

const s = {
  bar:    { display:"flex", flexWrap:"wrap", gap:"16px", alignItems:"center",
            padding:"12px 16px", background:"#f0f2f5", borderRadius:"10px", marginBottom:"16px" },
  group:  { display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" },
  label:  { fontSize:"14px", color:"#555" },
  select: { padding:"6px 10px", borderRadius:"6px", border:"1px solid #ccc",
            fontSize:"14px", background:"#fff", cursor:"pointer" },
  pill:   { padding:"5px 16px", borderRadius:"20px", border:"1px solid #ccc",
            background:"#fff", fontSize:"13px", cursor:"pointer", transition:"all .15s" },
  pillOn: { background:"#1976d2", color:"#fff", border:"1px solid #1976d2" },
};

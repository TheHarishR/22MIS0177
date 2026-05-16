import { Log } from "../middleware/logger";

const COLORS = {
  Placement: { bg:"#e3f2fd", border:"#1976d2", text:"#0d47a1" },
  Result:    { bg:"#fff3e0", border:"#f57c00", text:"#e65100" },
  Event:     { bg:"#f3e5f5", border:"#7b1fa2", text:"#4a148c" },
};
const ICONS = { Placement:"💼", Result:"📊", Event:"📅" };

function fmt(ts) {
  try { return new Date(ts).toLocaleString(); } catch { return ts; }
}

export default function NotificationCard({ notification, isRead, onMarkRead, rank }) {
  const { ID, Type, Message, Timestamp } = notification;
  const c = COLORS[Type] || { bg:"#f5f5f5", border:"#9e9e9e", text:"#333" };

  const handleClick = async () => {
    if (isRead) return;
    await Log("frontend", "info", "component",
      `Notification read — id=${ID} type=${Type} rank=${rank}`).catch(() => {});
    onMarkRead(ID);
  };

  return (
    <div onClick={handleClick} style={{
      ...s.card,
      borderLeft: `4px solid ${c.border}`,
      background: isRead ? "#fafafa" : "#fff",
      opacity:    isRead ? 0.7 : 1,
      cursor:     isRead ? "default" : "pointer",
    }}>
      <div style={s.rank}>#{rank}</div>

      <div style={s.body}>
        <div style={s.header}>
          <span style={{ ...s.badge, background:c.bg, color:c.text, border:`1px solid ${c.border}` }}>
            {ICONS[Type]} {Type}
          </span>
          {!isRead
            ? <span style={s.dot} title="Unread" />
            : <span style={s.readTxt}>✓ Read</span>
          }
        </div>
        <p style={s.msg}>{Message}</p>
        <span style={s.time}>{fmt(Timestamp)}</span>
      </div>
    </div>
  );
}

const s = {
  card:    { display:"flex", alignItems:"flex-start", gap:"12px", padding:"14px 16px",
             borderRadius:"8px", boxShadow:"0 1px 4px rgba(0,0,0,0.09)",
             marginBottom:"10px", transition:"box-shadow .15s" },
  rank:    { minWidth:"30px", fontSize:"13px", fontWeight:"600", color:"#aaa", paddingTop:"2px" },
  body:    { flex:1 },
  header:  { display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" },
  badge:   { padding:"3px 12px", borderRadius:"12px", fontSize:"12px", fontWeight:"600" },
  dot:     { width:"8px", height:"8px", borderRadius:"50%", background:"#1976d2", display:"inline-block" },
  readTxt: { fontSize:"12px", color:"#aaa" },
  msg:     { margin:"0 0 4px", fontSize:"14px", color:"#222", fontWeight:"500" },
  time:    { fontSize:"12px", color:"#999" },
};

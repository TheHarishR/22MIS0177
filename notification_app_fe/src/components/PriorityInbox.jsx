import { useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import NotificationCard from "./NotificationCard";
import FilterBar from "./FilterBar";
import { Log } from "../middleware/logger";

export default function PriorityInbox() {
  const [topN, setTopN]           = useState(10);
  const [filterType, setFilterType] = useState("");

  const { priorityList, readIds, loading, error, refresh, markRead } =
    useNotifications({ topN, filterType });

  const handleRefresh = async () => {
    await Log("frontend", "info", "component",
      "User triggered manual refresh").catch(() => {});
    refresh();
  };

  const unreadCount = priorityList.filter(n => !readIds.has(n.ID)).length;

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>
            🔔 Priority Inbox
            {unreadCount > 0 &&
              <span style={s.badge}>{unreadCount}</span>
            }
          </h1>
          <p style={s.sub}>
            Top {topN} by priority: Placement &gt; Result &gt; Event, then newest first
          </p>
        </div>
        <button onClick={handleRefresh} style={s.btn} disabled={loading}>
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        filterType={filterType}
        onFilterChange={setFilterType}
        topN={topN}
        onTopNChange={setTopN}
      />

      {/* Legend */}
      <div style={s.legend}>
        <span style={s.lItem}><span style={{...s.dot, background:"#1976d2"}} /> Unread — click to mark read</span>
        <span style={s.lItem}><span style={{...s.dot, background:"#ccc"}} /> Read</span>
      </div>

      {/* States */}
      {error   && <div style={s.err}>⚠️ {error}</div>}
      {loading && !error && <div style={s.center}>Loading notifications…</div>}
      {!loading && !error && priorityList.length === 0 &&
        <div style={s.center}>No notifications found.</div>}

      {/* List */}
      {!loading && priorityList.map((n, i) => (
        <NotificationCard
          key={n.ID}
          notification={n}
          isRead={readIds.has(n.ID)}
          onMarkRead={markRead}
          rank={i + 1}
        />
      ))}

      {/* Footer */}
      {!loading && priorityList.length > 0 &&
        <p style={s.footer}>
          Showing {priorityList.length} notifications • {unreadCount} unread
        </p>
      }
    </div>
  );
}

const s = {
  wrap:   { maxWidth:"740px", margin:"0 auto", padding:"28px 16px", fontFamily:"sans-serif" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-start",
            marginBottom:"20px", flexWrap:"wrap", gap:"12px" },
  title:  { margin:"0 0 4px", fontSize:"26px", fontWeight:"700", color:"#1a1a2e", display:"flex", alignItems:"center", gap:"10px" },
  badge:  { display:"inline-flex", alignItems:"center", justifyContent:"center",
            background:"#1976d2", color:"#fff", borderRadius:"50%", width:"24px",
            height:"24px", fontSize:"13px", fontWeight:"700" },
  sub:    { margin:0, fontSize:"13px", color:"#666" },
  btn:    { padding:"9px 20px", background:"#1976d2", color:"#fff", border:"none",
            borderRadius:"7px", fontSize:"14px", cursor:"pointer", fontWeight:"600" },
  legend: { display:"flex", gap:"20px", marginBottom:"16px", fontSize:"12px", color:"#666" },
  lItem:  { display:"flex", alignItems:"center", gap:"6px" },
  dot:    { width:"8px", height:"8px", borderRadius:"50%", display:"inline-block" },
  err:    { padding:"12px 16px", background:"#ffebee", color:"#c62828",
            borderRadius:"6px", marginBottom:"12px", fontSize:"14px" },
  center: { textAlign:"center", padding:"48px", color:"#aaa", fontSize:"14px" },
  footer: { textAlign:"center", marginTop:"16px", fontSize:"12px", color:"#bbb" },
};

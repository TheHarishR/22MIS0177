import { useState, useEffect, useCallback } from "react";
import { fetchNotifications, getTopN } from "../api/notificationApi";
import { Log } from "../middleware/logger";

export function useNotifications({ topN = 10, filterType = "" }) {
  const [priorityList, setPriorityList] = useState([]);
  const [readIds, setReadIds]           = useState(new Set());
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Log("frontend", "info", "hook",
        `Loading notifications — topN=${topN}, filter='${filterType || "all"}'`);

      const params = {};
      if (filterType) params.notification_type = filterType;

      const all = await fetchNotifications(params);
      const top = getTopN(all, topN);
      setPriorityList(top);

      await Log("frontend", "info", "hook",
        `Priority inbox ready: showing ${top.length} of ${all.length} notifications`);
    } catch (err) {
      setError(err.message);
      await Log("frontend", "error", "hook",
        `Failed to load notifications: ${err.message}`).catch(() => {});
    } finally {
      setLoading(false);
    }
  }, [topN, filterType]);

  const markRead = useCallback(async (id) => {
    setReadIds(prev => new Set([...prev, id]));
    await Log("frontend", "info", "component",
      `Notification marked as read: id=${id}`).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  return { priorityList, readIds, loading, error, refresh: load, markRead };
}

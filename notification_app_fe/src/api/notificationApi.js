/**
 * notificationApi.js
 * Fetch notifications from the Affordmed evaluation server.
 */

import { Log, getAuthToken } from "../middleware/logger";

const NOTIF_ENDPOINT = "/api/notifications";

// Priority weights: Placement > Result > Event
const WEIGHT = { Placement: 3, Result: 2, Event: 1 };

/** Score a notification (higher = more important) */
export function priorityScore(n) {
  return (WEIGHT[n.Type] ?? 0) * 1e12 + new Date(n.Timestamp).getTime();
}

/** Return top-n notifications sorted by priority */
export function getTopN(notifications, n) {
  return [...notifications]
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, n);
}

/**
 * Fetch notifications from the server.
 * @param {{ limit?: number, page?: number, notification_type?: string }} params
 */
export async function fetchNotifications(params = {}) {
  const token = await getAuthToken();

  const query = new URLSearchParams();
    if (params.limit)             query.set("limit", params.limit);
    if (params.page)              query.set("page", params.page);
    if (params.notification_type) query.set("notification_type", params.notification_type);
    const queryStr = query.toString();
    const url = queryStr ? `${NOTIF_ENDPOINT}?${queryStr}` : NOTIF_ENDPOINT;
  await Log("frontend", "info", "api",
    `Fetching notifications — params: ${JSON.stringify(params)}`);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    await Log("frontend", "error", "api",
      `Notification API error: ${res.status}`);
    throw new Error(`Notification fetch failed: ${res.status}`);
  }

  const data = await res.json();
  const notifications = data.notifications || [];

  await Log("frontend", "info", "api",
    `Received ${notifications.length} notifications from server`);

  return notifications;
}
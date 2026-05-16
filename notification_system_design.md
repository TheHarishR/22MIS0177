# Notification System Design

## Stage 1 — Priority Inbox

### Problem
Students lose track of important campus notifications due to high volume. The product manager requested a **Priority Inbox** always showing the top *n* most important unread notifications first.

### Priority Score Formula

```
priorityScore = typeWeight × 10¹² + unixTimestampMs
```

| Type | Weight |
|------|--------|
| Placement | 3 (highest) |
| Result | 2 (middlest)|
| Event | 1 (lowest) |

Multiplying by 10¹² ensures type always dominates over recency. Within the same type, newer notifications rank higher (tiebreaker).

### Maintaining Top-N Efficiently

**Current implementation:** Sort all fetched notifications by score, slice top N — O(n log n), sufficient for typical API response sizes.

**For high-volume real-time streams:** Use a **min-heap of size N**:
- Push each incoming notification into a min-heap keyed by `priorityScore`
- If heap size exceeds N, pop the minimum (lowest-priority item removed)
- Result: always holds the top N items
- Time per insertion: O(log N) · Space: O(N)

```typescript
// Pseudocode
function getTopN(notifications: Notification[], n: number): Notification[] {
  const score = (x: Notification) =>
    WEIGHT[x.Type] * 1e12 + new Date(x.Timestamp).getTime();

  const heap = new MinHeap<Notification>((a, b) => score(a) - score(b));

  for (const notif of notifications) {
    heap.push(notif);
    if (heap.size > n) heap.pop(); // evict lowest
  }

  const result: Notification[] = [];
  while (heap.size > 0) result.unshift(heap.pop());
  return result;
}
```

### Frontend Architecture

```
App
└── PriorityInbox
    ├── FilterBar           ← type filter pills + top-N dropdown
    ├── useNotifications    ← custom hook (fetch, sort, read state)
    │   ├── fetchNotifications()  ← GET /notifications with auth
    │   └── getTopN()             ← in-memory priority sort
    └── NotificationCard × N     ← click-to-read, type badge, timestamp
```

### Logging Strategy

Every significant event emits a structured log via `Log(stack, level, package, message)`:

| Event | level | package |
|-------|-------|---------|
| Fetch starts | info | api |
| Fetch succeeds | info | api |
| Fetch fails | error | api |
| Priority list computed | info | hook |
| Filter changed | info | component |
| Notification read | info | component |
| Refresh triggered | info | component |

### Notes
- No database storage — data fetched live from the Affordmed test server
- No login UI — credentials handled via environment variables
- Styling: Vanilla CSS (Material UI also permitted per spec)
- Runs on `http://localhost:3000`

"use client";

import { useEffect, useState } from "react";

// A collapsible section (<details>) with a red notification badge in its
// header showing how many items the viewer hasn't seen yet. "Seen" state is
// remembered per-browser in localStorage; opening the section clears its badge.
//
// itemIds: stable ids for the current items in this section (post ids, or a
// per-week id for the live Weekly Preview). New ids the viewer hasn't opened
// before count as notifications.
export default function NotifySection({
  storageKey,
  itemIds = [],
  title,
  className,
  children,
}) {
  const [count, setCount] = useState(0);
  const key = `yeet-seen-${storageKey}`;
  const ids = itemIds.join("|");

  useEffect(() => {
    let seen = [];
    try {
      seen = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {}
    const seenSet = new Set(seen);
    setCount(itemIds.filter((id) => !seenSet.has(id)).length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ids]);

  function markSeen() {
    try {
      localStorage.setItem(key, JSON.stringify(itemIds));
    } catch {}
    setCount(0);
  }

  return (
    <details
      className={className}
      onToggle={(e) => {
        if (e.currentTarget.open) markSeen();
      }}
    >
      <summary>
        {title}
        {count > 0 && (
          <span className="notif-badge" aria-label={`${count} new`}>
            {count}
          </span>
        )}
      </summary>
      <div className="body">{children}</div>
    </details>
  );
}

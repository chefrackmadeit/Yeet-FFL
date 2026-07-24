import ReactionBar from "./ReactionBar";

// Renders a list of manual posts (from content/posts.js). Each post is a
// collapsible accordion: click the headline to expand the full article (with
// links + reactions). Used inside the Weekly Review / YEET News Network / etc.
// dropdowns, so the whole thing is a nested accordion for a clean, scannable UI.
//
// Links inside a post are supported two ways:
//   • In the body text: **bold**, [label](https://...), or a bare https://... URL.
//   • post.links — an array of { label, url } shown as buttons under the post.
// All links open in a new browser tab (great for PDFs, Google Docs, etc.).

function paragraphs(text) {
  return String(text || "")
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// Render a paragraph's inline formatting: **bold**, [label](url) markdown
// links, and bare URLs (all links open in a new tab).
function renderInline(text, keyBase) {
  const re =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)|\*\*([^*]+)\*\*/g;
  const nodes = [];
  let last = 0;
  let k = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[4] != null) {
      nodes.push(<strong key={`${keyBase}-${k++}`}>{m[4]}</strong>);
    } else {
      const label = m[1] || m[3];
      const url = m[2] || m[3];
      nodes.push(
        <a key={`${keyBase}-${k++}`} href={url} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function PostFeed({ posts, emptyText }) {
  if (!posts || posts.length === 0) {
    return <p className="post-empty">{emptyText || "Nothing posted yet."}</p>;
  }

  return (
    <div className="post-feed">
      {posts.map((post, i) => {
        const id = post.id || `post-${i}`;
        return (
          <details className="post" key={id}>
            <summary className="post-summary">
              <span className="post-summary-main">
                <span className="post-title">{post.title}</span>
                {post.date && <span className="post-date">{post.date}</span>}
              </span>
            </summary>
            <div className="post-content">
              {post.body && (
                <div className="post-body">
                  {paragraphs(post.body).map((p, j) => (
                    <p key={j}>{renderInline(p, `${id}-${j}`)}</p>
                  ))}
                </div>
              )}
              {Array.isArray(post.links) && post.links.length > 0 && (
                <div className="post-links">
                  {post.links.map((lnk, j) => (
                    <a
                      key={j}
                      className="post-link"
                      href={lnk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {lnk.label} ↗
                    </a>
                  ))}
                </div>
              )}
              <ReactionBar postId={id} />
            </div>
          </details>
        );
      })}
    </div>
  );
}

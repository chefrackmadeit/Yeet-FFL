import ReactionBar from "./ReactionBar";

// Renders a list of manual posts (from content/posts.js), each with its own
// reaction bar. Used inside the Weekly Review and YEET News Network dropdowns.
//
// Links are supported three ways:
//   • In the body text: [label](https://...) or a bare https://... URL.
//   • post.href — makes the whole title a clickable link.
//   • post.links — an array of { label, url } shown as buttons under the post.
// All links open in a new browser tab (great for PDFs, Google Docs, etc.).

function paragraphs(text) {
  return String(text || "")
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// Turn [label](url) and bare URLs inside a paragraph into clickable links.
function linkify(text, keyBase) {
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
  const nodes = [];
  let last = 0;
  let k = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const label = m[1] || m[3];
    const url = m[2] || m[3];
    nodes.push(
      <a key={`${keyBase}-${k++}`} href={url} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
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
        const titleNode = post.href ? (
          <a href={post.href} target="_blank" rel="noopener noreferrer">
            {post.title} ↗
          </a>
        ) : (
          post.title
        );

        return (
          <article className="post" key={id}>
            <div className="post-head">
              <h3 className="post-title">{titleNode}</h3>
              {post.date && <span className="post-date">{post.date}</span>}
            </div>
            {post.body && (
              <div className="post-body">
                {paragraphs(post.body).map((p, j) => (
                  <p key={j}>{linkify(p, `${id}-${j}`)}</p>
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
          </article>
        );
      })}
    </div>
  );
}

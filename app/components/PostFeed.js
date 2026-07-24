import ReactionBar from "./ReactionBar";

// Renders a list of manual posts (from content/posts.js), each with its own
// reaction bar. Used inside the Weekly Review and YEET News Network dropdowns.
function paragraphs(text) {
  return String(text || "")
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
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
          <article className="post" key={id}>
            <div className="post-head">
              <h3 className="post-title">{post.title}</h3>
              {post.date && <span className="post-date">{post.date}</span>}
            </div>
            <div className="post-body">
              {paragraphs(post.body).map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
            <ReactionBar postId={id} />
          </article>
        );
      })}
    </div>
  );
}

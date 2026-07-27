import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { weeklyReview, yeetNews } from "@/content/posts";
import { notifyEmail } from "@/content/notify";

// Commissioner-only endpoint: emails every manager that a new post is up, with
// a "View Now" link to the site. Verified two ways — the caller must present a
// valid Supabase session token AND that token must belong to the commissioner.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COMMISSIONER_EMAIL = "chefrackmadeit@gmail.com";

function dateKey(d) {
  const t = Date.parse(d);
  return Number.isNaN(t) ? -8.64e15 : t;
}

// Newest post across the two manual feeds (with its section label).
function newestPost() {
  const all = [
    ...(weeklyReview || []).map((p) => ({ ...p, section: "Weekly Review" })),
    ...(yeetNews || []).map((p) => ({ ...p, section: "YEET News Network" })),
  ];
  all.sort((a, b) => dateKey(b.date) - dateKey(a.date));
  return all[0] || null;
}

function fillTemplate(str, post) {
  return String(str || "")
    .split("{title}").join(post.title || "")
    .split("{section}").join(post.section || "");
}

function buildHtml({ heading, intro, buttonLabel, footer, title, siteUrl }) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#0f1020;padding:24px;color:#e8eafb">
  <div style="max-width:480px;margin:0 auto;background:#171a2e;border:1px solid #2a2d4a;border-radius:14px;padding:24px">
    <div style="font-size:22px;font-weight:bold;background:linear-gradient(90deg,#8b6dff,#ff5fa2,#ff9457);-webkit-background-clip:text;background-clip:text;color:#ff5fa2;margin-bottom:14px">YEET FFL</div>
    <h1 style="margin:0 0 6px;font-size:20px;color:#ff9457">${heading}</h1>
    <p style="margin:0 0 4px;color:#a9adc9">${intro}</p>
    <p style="margin:0 0 20px;font-size:18px;font-weight:bold;color:#e8eafb">${title}</p>
    <a href="${siteUrl}" style="display:inline-block;background:#ff9457;color:#1a1030;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">${buttonLabel} &rarr;</a>
    <p style="margin:22px 0 0;font-size:12px;color:#6f739a">${footer}</p>
  </div>
</div>`;
}

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!url || !anon) return Response.json({ error: "Supabase not configured" }, { status: 500 });
  if (!gmailUser || !gmailPass) return Response.json({ error: "Email not configured (GMAIL_USER / GMAIL_APP_PASSWORD)" }, { status: 500 });

  // 1) Verify the caller is the commissioner (valid session token + right email).
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ error: "Not signed in" }, { status: 401 });

  const supabase = createClient(url, anon);
  const { data: userData, error: uErr } = await supabase.auth.getUser(token);
  const email = (userData?.user?.email || "").toLowerCase();
  if (uErr || email !== COMMISSIONER_EMAIL) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  // Test mode = send only to yourself, so you can preview before blasting the league.
  let test = false;
  try {
    const body = await request.json();
    test = !!body?.test;
  } catch {}

  // 2) Which post to announce (newest).
  const post = newestPost();
  if (!post) return Response.json({ error: "There are no posts to announce yet." }, { status: 400 });

  // 3) Recipient list = every manager's email.
  const { data: managers, error: mErr } = await supabase.from("managers").select("email");
  if (mErr) return Response.json({ error: "Could not load the manager list." }, { status: 500 });
  const emails = (managers || []).map((m) => m.email).filter(Boolean);
  if (!test && emails.length === 0) return Response.json({ error: "No manager emails found." }, { status: 400 });

  // 4) Build + send (recipients BCC'd so nobody sees each other's address).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const subject = fillTemplate(notifyEmail.subject, post);
  const html = buildHtml({
    heading: fillTemplate(notifyEmail.heading, post),
    intro: fillTemplate(notifyEmail.intro, post),
    buttonLabel: notifyEmail.buttonLabel || "View Now",
    footer: fillTemplate(notifyEmail.footer, post),
    title: post.title,
    siteUrl,
  });
  const text = `${fillTemplate(notifyEmail.heading, post)}\n${fillTemplate(notifyEmail.intro, post)}\n${post.title}\n\n${notifyEmail.buttonLabel || "View Now"}: ${siteUrl}\n\n${fillTemplate(notifyEmail.footer, post)}`;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
  });

  try {
    if (test) {
      // Just you.
      await transporter.sendMail({
        from: `YEET FFL <${gmailUser}>`,
        to: email,
        subject: `[TEST] ${subject}`,
        text,
        html,
      });
    } else {
      // The whole league, BCC'd.
      await transporter.sendMail({
        from: `YEET FFL <${gmailUser}>`,
        to: gmailUser,
        bcc: emails,
        subject,
        text,
        html,
      });
    }
  } catch {
    return Response.json({ error: "Email failed to send." }, { status: 500 });
  }

  return Response.json({ ok: true, count: test ? 1 : emails.length, title: post.title, test });
}

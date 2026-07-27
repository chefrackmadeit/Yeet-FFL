// ===========================================================================
// "NOTIFY LEAGUE" EMAIL — the message sent to all managers when you press the
// "Notify League" button (visible only to you, the commissioner).
// ---------------------------------------------------------------------------
// Edit any of the text below, then Commit + Push. Two placeholders you can use
// anywhere in these strings:
//     {title}   → the post's headline (e.g. "Welcome to the Revolution")
//     {section} → which dropdown it's in ("Weekly Review" or "YEET News Network")
// The "View Now" button always links to the site homepage.
// ===========================================================================

export const notifyEmail = {
  // Email subject line.
  subject: "New post in YFFL!",

  // Big heading at the top of the email.
  heading: "This Just In",

  // Line above the post title.
  intro: "New post has been added to the YFFL site. Check it out.",

  // Text on the clickable button that opens the site.
  buttonLabel: "Read Post",

  // Small print at the bottom.
  footer: "You’re getting this because you’re in the YEET FFL league.",
};

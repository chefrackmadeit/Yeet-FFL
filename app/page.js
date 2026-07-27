import {
  getLeague,
  getReigningAwards,
  getCurrentLeagueId,
  getSeasonStandingsSets,
  getNflState,
} from "@/lib/sleeper";
import { attachTitleOdds } from "@/lib/odds";
import StandingsTabs from "./components/StandingsTabs";
import WeeklyPreview from "./components/WeeklyPreview";
import PostFeed from "./components/PostFeed";
import NotifySection from "./components/NotifySection";
import HeroSignIn from "./components/HeroSignIn";
import NotifyLeagueButton from "./components/NotifyLeagueButton";
import { weeklyReview, yeetNews } from "@/content/posts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const currentId = await getCurrentLeagueId();
  const [league, seasonSets, awards, state] = await Promise.all([
    getLeague(currentId),
    getSeasonStandingsSets(currentId),
    getReigningAwards(currentId),
    getNflState(),
  ]);

  // Attach for-fun league title odds to the current season's rows.
  const currentSet = seasonSets.find((s) => s.isCurrent);
  if (currentSet) attachTitleOdds(currentSet.rows);

  // Notification item-ids for each dropdown. Posts use their own ids; the live
  // Weekly Preview uses one id per NFL week, so a new week's preview shows "1".
  const week = Number(state.week) || 0;
  const previewInSeason =
    week > 0 && state.season_type !== "off" && league.status !== "complete";
  const reviewIds = weeklyReview.map((p, i) => p.id || `wr-${i}`);
  const newsIds = yeetNews.map((p, i) => p.id || `ynn-${i}`);
  const previewIds = previewInSeason ? [`wp-week-${week}`] : [];

  return (
    <>
      <section className="hero">
        <h1>{league.name}</h1>
        <p>
          {league.season} season · {league.total_rosters} teams · updated live
          from Sleeper
        </p>
        <div className="hero-actions">
          <a
            className="btn"
            href="https://docs.google.com/document/d/1iuEKRa91wx7Nz4L9vPwOgguym7tWBaDMGQwTvNIED1g/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            League Rules
          </a>
          <HeroSignIn />
          <NotifyLeagueButton />
        </div>
      </section>

      {/* Weekly Review — manual posts (content/posts.js), each with reactions */}
      <NotifySection
        className="section recap"
        storageKey="weekly-review"
        itemIds={reviewIds}
        title="📝 Weekly Review"
      >
        <PostFeed posts={weeklyReview} emptyText="No reviews posted yet." />
      </NotifySection>

      {/* Weekly Preview — matchup blurbs + for-fun odds (live from Sleeper) */}
      <NotifySection
        className="section ynn"
        storageKey="weekly-preview"
        itemIds={previewIds}
        title="🔮 Weekly Preview"
      >
        <WeeklyPreview />
      </NotifySection>

      {/* YEET News Network — manual posts (content/posts.js), each with reactions */}
      <NotifySection
        className="section news"
        storageKey="yeet-news"
        itemIds={newsIds}
        title="📡 YEET News Network"
      >
        <PostFeed posts={yeetNews} emptyText="No news posted yet." />
      </NotifySection>

      {/* Reigning champion + last place */}
      <div className="grid">
        <div className="card award-champion">
          <div className="label">
            Reigning Champion{awards.season ? ` — ${awards.season}` : ""}
          </div>
          <div className="value">
            <span className="award-emoji">🏆</span>{" "}
            {awards.champion ? awards.champion.team : "—"}
          </div>
          {awards.champion && (
            <div className="sub">{awards.champion.manager}</div>
          )}
        </div>
        <div className="card award-loser">
          <div className="label">
            Burger Bound{awards.season ? ` — ${awards.season}` : ""}
          </div>
          <div className="value">
            <span className="award-emoji">🍔</span>{" "}
            {awards.loser ? awards.loser.team : "—"}
          </div>
          {awards.loser && <div className="sub">{awards.loser.manager}</div>}
        </div>
      </div>

      <h2>Standings</h2>
      <StandingsTabs sets={seasonSets} />
    </>
  );
}

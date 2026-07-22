import { getCurrentLeagueId } from "@/lib/sleeper";
import { buildHeadToHeadData } from "@/lib/manager";
import HeadToHead from "@/app/components/HeadToHead";

export const dynamic = "force-dynamic";

export const metadata = { title: "Head to Head · YEET FFL" };

export default async function HeadToHeadPage() {
  const id = await getCurrentLeagueId();
  const { managers, stats } = await buildHeadToHeadData(id);

  return (
    <>
      <h2>Head to Head</h2>
      <p className="sub" style={{ marginTop: -6, marginBottom: 18 }}>
        Compare any two managers across regular-season or all-time stats.
      </p>
      <HeadToHead managers={managers} stats={stats} />
    </>
  );
}

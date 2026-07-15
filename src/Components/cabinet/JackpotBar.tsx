import type { JackpotValues } from "../../game/useJackpots";

const TIERS = [
  { key: "mini", label: "MINI" },
  { key: "minor", label: "MINOR" },
  { key: "major", label: "MAJOR" },
  { key: "grand", label: "GRAND" },
] as const;

interface Props { values: JackpotValues; }

export const JackpotBar = ({ values }: Props) => (
  <div className="jackpot-bar">
    {TIERS.map((t) => (
      <div key={t.key} className={`plaque jackpot ${t.key}`}>
        <div className="tier">{t.label}</div>
        <div className="value">KSh {Math.round(values[t.key]).toLocaleString("en-US")}</div>
      </div>
    ))}
  </div>
);

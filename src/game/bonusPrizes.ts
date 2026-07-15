// The Safari Bonus wheel's segments (8), read clockwise from the top pointer.
// "cash" prizes pay `mult × totalBet`; "free" prizes grant `value` free spins.
export interface BonusPrize {
  label: string;
  type: "cash" | "free";
  mult?: number;   // cash: multiple of the total bet
  value?: number;  // free: number of free spins
  weight: number;  // relative pick weight
  color: string;   // wheel segment fill
}

export const BONUS_PRIZES: BonusPrize[] = [
  { label: "5×",     type: "cash", mult: 5,   weight: 22, color: "#00af19" },
  { label: "+5 FS",  type: "free", value: 5,  weight: 14, color: "#bf00ff" },
  { label: "10×",    type: "cash", mult: 10,  weight: 22, color: "#eaaaff" },
  { label: "+10 FS", type: "free", value: 10, weight: 19,  color: "#00c6ff" },
  { label: "5×",     type: "cash", mult: 5,   weight: 22, color: "#f700ff" },
  { label: "20×",    type: "cash", mult: 20,  weight: 22,  color: "#ff1700" },
  { label: "10×",    type: "cash", mult: 10,  weight: 19, color: "#ffbc00" },
  { label: "50×",    type: "cash", mult: 50,  weight: 22,  color: "#ff7300" },
];

// Weighted pick → index into BONUS_PRIZES.
export function pickPrize(rng: () => number = Math.random): number {
  const total = BONUS_PRIZES.reduce((a, p) => a + p.weight, 0);
  let roll = rng() * total;
  for (let i = 0; i < BONUS_PRIZES.length; i++) {
    if (roll < BONUS_PRIZES[i].weight) return i;
    roll -= BONUS_PRIZES[i].weight;
  }
  return BONUS_PRIZES.length - 1;
}

// Cash payout for a cash prize at the current stake (0 for non-cash).
export function cashAmount(prize: BonusPrize, totalBet: number): number {
  return prize.type === "cash" ? (prize.mult ?? 0) * totalBet : 0;
}

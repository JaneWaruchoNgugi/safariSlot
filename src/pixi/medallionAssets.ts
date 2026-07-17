import Lion from "../assets/img/SlotItems/medallions/lion.webp";
import Tigre from "../assets/img/SlotItems/medallions/tiger.webp";
import Leopard from "../assets/img/SlotItems/medallions/leopard.webp";
import Elephant from "../assets/img/SlotItems/medallions/elephant.webp";
import Rhino from "../assets/img/SlotItems/medallions/rhino.webp";
import Hippo from "../assets/img/SlotItems/medallions/hippo.webp";
import Wild from "../assets/img/SlotItems/medallions/wild.webp";
import Scatter from "../assets/img/SlotItems/medallions/scatter.webp";
import Bonus from "../assets/img/SlotItems/medallions/bonus.webp";

// Complete gold-medallion art per symbol (includes the gold ring + backing +
// painted animal). Symbols not listed here fall back to a generated medallion
// + circular photo.
// Keyed by symbol name (animals + "Wild"/"Scatter" when their art arrives).
export const MEDALLION_ART: Record<string, string> = {
  Lion,
  Tigre,
  Leopard,
  Elephant,
  Rhino,
  Hippo,
  Wild,
  Scatter,
  Bonus,
};

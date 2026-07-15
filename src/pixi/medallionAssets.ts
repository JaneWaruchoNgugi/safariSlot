import Lion from "../assets/img/SlotItems/medallions/lion.png";
import Tigre from "../assets/img/SlotItems/medallions/tiger.png";
import Leopard from "../assets/img/SlotItems/medallions/leopard.png";
import Elephant from "../assets/img/SlotItems/medallions/elephant.png";
import Rhino from "../assets/img/SlotItems/medallions/rhino.png";
import Hippo from "../assets/img/SlotItems/medallions/hippo.png";
import Wild from "../assets/img/SlotItems/medallions/wild.png";
import Scatter from "../assets/img/SlotItems/medallions/scatter.png";
import Bonus from "../assets/img/SlotItems/medallions/bonus.png";

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

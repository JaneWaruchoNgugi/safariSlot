import { formatKsh } from "../../game/betDisplay";

interface Props {
  price: number;
  onBuy: () => void;
  disabled: boolean;
}

// Phase 4: a real button — buys a free-spins round for the current stake.
export const BuySpinsPanel = ({ price, onBuy, disabled }: Props) => (
  <div className="plaque side-panel left buy-spins">
    <div className="headline">BUY<br />FREE SPINS</div>
    <button className="cta" onClick={onBuy} disabled={disabled}>
      {formatKsh(price)}
    </button>
  </div>
);

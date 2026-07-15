interface Props { balance: number; }

export const BalancePanel = ({ balance }: Props) => (
  <div className="plaque balance-panel">
    <div className="label">Balance</div>
    <div className="value">KSh {balance.toLocaleString()}</div>
  </div>
);

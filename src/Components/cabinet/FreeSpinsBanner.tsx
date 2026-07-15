interface Props { remaining: number; }

// Top-center overlay shown while a free-spins round is live.
export const FreeSpinsBanner = ({ remaining }: Props) => {
  if (remaining <= 0) return null;
  return (
    <div className="free-spins-banner">
      <span className="fs-label">FREE SPINS</span>
      <span className="fs-count">× {remaining}</span>
    </div>
  );
};

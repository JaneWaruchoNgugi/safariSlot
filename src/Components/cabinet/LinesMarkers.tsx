import { LINES } from "../../game/betDisplay";

export const LinesMarkers = () => (
  <>
    <div className="lines-marker left"><div className="n">{LINES}</div><div className="t">LINES</div></div>
    <div className="lines-marker right"><div className="n">{LINES}</div><div className="t">LINES</div></div>
  </>
);

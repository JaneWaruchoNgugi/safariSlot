import "./App.css";
import { MainSlots } from "./Components/MainSlots.tsx";
import { Loader } from "./Components/Loader";
import { useState } from "react";

// 🎵 sounds
import ReelStopSnd from "./Hooks/UseSounds/SafariSlotSonds/reel_stop.mp3";
import WinSnd from "./Hooks/UseSounds/SafariSlotSonds/a-win-is-a-win.mp3";
import NiceOneSnd from "./Hooks/UseSounds/SafariSlotSonds/nice-one-snd.mp3";
import MassiveWinSnd from "./Hooks/UseSounds/SafariSlotSonds/thats-massive.mp3";
import RollingSnd from "./Hooks/UseSounds/SafariSlotSonds/rollin-snd.mp3";
import BackgroundSnd from "./Hooks/UseSounds/SafariSlotSonds/background-music.mp3";

// 🖼️ static images (UI, logos, backgrounds)
import SafariLoaderImg from "./assets/img/new/safari-fortunes-loader.png";
import gtLogo from "./assets/img/new/greatech_logo.png";
import SafariSlotLogo from "./assets/img/new/safarifortunes-logo.png";

// 🖼️ dynamic symbols (glob import)
const symbolModules = import.meta.glob(
    "./assets/img/symbols/*.{png,jpg,jpeg,webp}",
    { eager: true, import: "default" }
);

function App() {
    const [loaded, setLoaded] = useState(false);

    // flatten dynamic imports
    const symbols = Object.values(symbolModules) as string[];

    // full asset list (images + audio)
    const assets = [
        SafariLoaderImg,
        gtLogo,
        SafariSlotLogo,
        ...symbols,
        RollingSnd,
        ReelStopSnd,
        WinSnd,
        NiceOneSnd,
        MassiveWinSnd,
        BackgroundSnd,
    ];

    return (
        <>
            {!loaded ? (
                <Loader assets={assets} onComplete={() => setLoaded(true)} />
            ) : (
                <MainSlots />
            )}
        </>
    );
}

export default App;

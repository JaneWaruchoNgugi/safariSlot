import "./App.css";
import { MainSlots } from "./Components/MainSlots.tsx";
import { Loader } from "./Components/Loader";
import { LanguageSelect } from "./Components/LanguageSelect";
import { useState } from "react";

// 🎵 sounds
import ReelStopSnd from "./Hooks/UseSounds/SafariSlotSonds/reel_stop.mp3";
import WinSnd from "./Hooks/UseSounds/SafariSlotSonds/a-win-is-a-win.mp3";
import NiceOneSnd from "./Hooks/UseSounds/SafariSlotSonds/nice-one-snd.mp3";
import MassiveWinSnd from "./Hooks/UseSounds/SafariSlotSonds/thats-massive.mp3";
import RollingSnd from "./Hooks/UseSounds/SafariSlotSonds/rollin-snd.mp3";
import BackgroundSnd from "./Hooks/UseSounds/SafariSlotSonds/background-music.mp3";

// 🖼️ static images (UI, logos, backgrounds)
import SafariLoaderImg from "./assets/img/new/safari-fortunes-loader.webp";
import gtLogo from "./assets/img/new/greatech_logo.webp";
import SafariSlotLogo from "./assets/img/new/safarifortunes-logo.webp";

// 🖼️ all in-game art the Pixi canvas needs — preloaded here so the reels are
// ready the moment the game opens (medallions, backgrounds, control-bar sprites,
// scene textures) instead of streaming in after mount.
const gameArtModules = import.meta.glob(
    [
        "./assets/img/SlotItems/medallions/*.webp",
        "./assets/img/gamesprites/*.webp",
        "./assets/img/scene/*.webp",
    ],
    { eager: true, import: "default" }
);

function App() {
    const [loaded, setLoaded] = useState(false);
    const [langChosen, setLangChosen] = useState<boolean>(() => {
        try { return !!localStorage.getItem("lang"); } catch { return false; }
    });

    // flatten dynamic imports
    const gameArt = Object.values(gameArtModules) as string[];

    // full asset list (images + audio)
    const assets = [
        SafariLoaderImg,
        gtLogo,
        SafariSlotLogo,
        ...gameArt,
        RollingSnd,
        ReelStopSnd,
        WinSnd,
        NiceOneSnd,
        MassiveWinSnd,
        BackgroundSnd,
    ];

    if (!loaded) return <Loader assets={assets} onComplete={() => setLoaded(true)} />;
    if (!langChosen) return <LanguageSelect onChosen={() => setLangChosen(true)} />;
    return <MainSlots />;
}

export default App;

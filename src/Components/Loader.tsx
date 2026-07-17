// Components/Loader.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { preloadPixiAssets } from "../pixi/textures";
import LoaderLandscape from "../assets/img/new/safari-loader-landscape.webp";
import LoaderPortrait from "../assets/img/new/safari-loader-portrait.webp";
import gtLogo from "../assets/img/new/greatech_logo.webp";

type LoaderProps = {
    assets: string[];
    onComplete: () => void;
};

export const Loader = ({ assets, onComplete }: LoaderProps) => {
    const { t } = useTranslation();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Warm Pixi's own texture cache in parallel with the byte preload below,
        // so the reels canvas paints immediately when the game mounts.
        preloadPixiAssets();

        let loaded = 0;
        const total = assets.length;

        const handleAssetLoad = () => {
            loaded += 1;
            setProgress(Math.round((loaded / total) * 100));
            if (loaded === total) {
                setTimeout(onComplete, 500); // smooth fade-out
            }
        };

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        assets.forEach((src) => {
            if (!isIOS && src.match(/\.(mp3|wav|ogg)$/)) {
                // 🎵 Preload audio (non-iOS)
                const audio = new Audio();
                audio.src = src;
                audio.oncanplaythrough = handleAssetLoad;
                audio.onerror = handleAssetLoad;
            } else if (!src.match(/\.(mp3|wav|ogg)$/)) {
                // 🖼️ Preload images
                const img = new Image();
                img.src = src;
                img.onload = handleAssetLoad;
                img.onerror = handleAssetLoad;
            } else {
                // iOS audio preload skipped
                handleAssetLoad();
            }
        });
    }, [assets, onComplete]);

    return (
        <div className="loading-screen loader-image">
            <picture>
                <source media="(orientation: portrait)" srcSet={LoaderPortrait} />
                <img src={LoaderLandscape} alt="Safari Fortunes" className="safari-poster" />
            </picture>
            <div className="loading-container">
                <img src={gtLogo} alt="Logo" className="gt-logo"/>
                <div className="progress-bar">
                    <div className="progress-content" style={{width: `${progress}%`}}></div>
                </div>
                <p>{t("loader.loading")} {Math.round(progress)}%</p>
            </div>
        </div>
    );
};

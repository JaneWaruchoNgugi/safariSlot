import gameSndOff from "../assets/img/new/mute.webp";
import gameSndOn from "../assets/img/new/unmute.webp";
import gameInfor from "../assets/img/new/infor.webp";
import {type Dispatch, type FC, type SetStateAction, useEffect, useRef} from "react";
import {useTranslation} from "react-i18next";

interface MinesSettingsDialogProps {
    OnHelpOpen: Dispatch<SetStateAction<boolean>>;
    isMuted: boolean;
    onMuteToggle: Dispatch<SetStateAction<boolean>>;
    OnSettingsOpen: Dispatch<SetStateAction<boolean>>;

}

export const SafariFortuneDialog: FC<MinesSettingsDialogProps> = ({
                                                                         OnHelpOpen,
                                                                         isMuted,
                                                                         onMuteToggle,
                                                                         OnSettingsOpen,
                                                                     }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const {t} = useTranslation();

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                dialogRef.current &&
                !dialogRef.current.contains(event.target as Node) &&
                !(event.target as HTMLElement).closest('.game-info-snd-icon') &&
                !(event.target as HTMLElement).closest('.top-settings-icon') // ⛔ exclude close btn
            ) {
                OnSettingsOpen(false);
            }

        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [OnSettingsOpen]);

    return (
        <div ref={dialogRef} className="Mines-settings-dialog-overlay">
            <div className="settings-close-container">
                <div className="dialog-header">{t("dialog.gameSettings")}</div>
            </div>

            <div className="mines-Settings-dialog-controls">
                <div className="mines-Settings-snd-info-control" onClick={() => onMuteToggle((prev) => !prev)}>
                    <img className="game-info-snd-icon" src={isMuted ? gameSndOff : gameSndOn} alt="game-sound"/>
                    <div className="dialog-content">{t("dialog.sound")} {isMuted ? t("dialog.off") : t("dialog.on")}</div>
                </div>

                <div className="mines-Settings-snd-info-control" onClick={() => OnHelpOpen(true)}>
                    <img className="game-info-snd-icon" src={gameInfor} alt="game-info"/>
                    <div className="dialog-content">{t("dialog.howToPlay")}</div>
                </div>
            </div>
        </div>
    );
};

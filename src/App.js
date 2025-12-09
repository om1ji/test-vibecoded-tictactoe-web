import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TicTacToe } from "./components/TicTacToe";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { fallbackLocale, translations } from "./translations";
const decodePayload = () => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("payload");
    if (!encoded) {
        return null;
    }
    try {
        let normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
        const padding = normalized.length % 4;
        if (padding) {
            normalized = normalized.padEnd(normalized.length + (4 - padding), "=");
        }
        const decoded = atob(normalized);
        return JSON.parse(decoded);
    }
    catch {
        return null;
    }
};
const availableLocales = ["ru", "en"];
const themes = ["light", "dark"];
function App() {
    const user = useMemo(() => decodePayload(), []);
    const userKey = user?.telegram_id?.toString() ?? "guest";
    const [locale, setLocale] = useLocalStorage("ttt_locale", fallbackLocale);
    const [theme, setTheme] = useLocalStorage("ttt_theme", "light");
    const [lastMessage, setLastMessage] = useState("");
    const telegram = useMemo(() => window.Telegram?.WebApp, []);
    const copy = translations[locale] ?? translations[fallbackLocale];
    const gameCopy = useMemo(() => ({
        winPending: copy.winPending,
        loseText: copy.lose,
        drawText: copy.draw,
        actionPlayAgain: copy.actionPlayAgain,
        playerTurn: copy.playerTurn,
        botTurn: copy.botTurn
    }), [copy]);
    const userFullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "гость";
    useEffect(() => {
        document.body.dataset.theme = theme;
    }, [theme]);
    useEffect(() => {
        telegram?.ready();
    }, [telegram]);
    const requestPromoFromBot = useCallback(() => {
        if (!telegram) {
            setLastMessage(copy.botUnavailable);
            return;
        }
        try {
            telegram.sendData(JSON.stringify({
                event: "promo_request",
                userKey,
                timestamp: Date.now()
            }));
            telegram.HapticFeedback?.impactOccurred?.("soft");
            setLastMessage(copy.promoRequested);
        }
        catch {
            setLastMessage(copy.botUnavailable);
        }
    }, [telegram, copy, userKey]);
    const handleLose = useCallback(() => {
        setLastMessage(copy.lose);
    }, [copy]);
    const handleDraw = useCallback(() => {
        setLastMessage(copy.draw);
    }, [copy]);
    const themeClass = theme === "dark" ? "theme-dark" : "theme-light";
    return (_jsxs("div", {
        className: `page ${themeClass}`, children: [_jsxs("header",
            {
                className: "hero", children:
                    [_jsxs("div", {
                        children: [_jsx("h1", {
                            children: copy.title
                        }), lastMessage && _jsx("p", {
                            className: "muted",
                            children: lastMessage
                        })]
                    }), _jsxs("div", {
                        className: "controls",
                        children: [_jsxs("div", {
                            className: "control-block",
                            children: [_jsx("div", {
                                className: "segmented",
                                children: availableLocales.map((loc) => (_jsx("button", {
                                    className: locale === loc ? "active" : "",
                                    onClick: () => setLocale(loc),
                                    type: "button",
                                    children: loc.toUpperCase()
                                }, loc)))
                            })]
                        }), _jsxs("div", {
                            className: "control-block",
                            children: [_jsx("div", {
                                className: "segmented",
                                children: themes.map((value) => (_jsx("button", {
                                    className: theme === value ? "active" : "",
                                    onClick: () => setTheme(value),
                                    type: "button",
                                    children: value === "light" ? copy.lightTheme : copy.darkTheme
                                }, value)))
                            })]
                        })]
                    })]
            }), _jsxs("section", {
                className: "content",
                children: [_jsxs("div", {
                    className: "game-column",
                    children: [_jsx(TicTacToe, {
                        copy: gameCopy,
                        onWin: requestPromoFromBot,
                        onLose: handleLose,
                        onDraw: handleDraw
                    })]
                })]
            })]
    }));
}
export default App;

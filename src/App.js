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
const parseUserFromInitData = (initData) => {
    if (!initData) {
        return null;
    }
    try {
        const params = new URLSearchParams(initData);
        const raw = params.get("user");
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        return {
            telegram_id: parsed.id,
            username: parsed.username,
            first_name: parsed.first_name,
            last_name: parsed.last_name
        };
    }
    catch {
        return null;
    }
};
const availableLocales = ["ru", "en"];
const themes = ["light", "dark"];
function App() {
    const payloadUser = useMemo(() => decodePayload(), []);
    const [locale, setLocale] = useLocalStorage("ttt_locale", fallbackLocale);
    const [theme, setTheme] = useLocalStorage("ttt_theme", "dark");
    const [dialog, setDialog] = useState(null);
    const [toast, setToast] = useState("");
    const [gameKey, setGameKey] = useState(0);
    const telegram = useMemo(() => window.Telegram?.WebApp, []);
    const initData = useMemo(() => {
        if (telegram?.initData) {
            return telegram.initData;
        }
        const params = new URLSearchParams(window.location.search);
        return params.get("tgWebAppData") ?? "";
    }, [telegram]);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
    const copy = translations[locale] ?? translations[fallbackLocale];
    const gameCopy = useMemo(() => ({
        winPending: copy.winPending,
        loseText: copy.lose,
        drawText: copy.draw,
        actionPlayAgain: copy.actionPlayAgain,
        playerTurn: copy.playerTurn,
        botTurn: copy.botTurn
    }), [copy]);
    const initDataUser = useMemo(() => parseUserFromInitData(initData), [initData]);
    const user = payloadUser ?? initDataUser;
    const userFullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "player";
    useEffect(() => {
        document.body.dataset.theme = theme;
    }, [theme]);
    useEffect(() => {
        telegram?.ready();
    }, [telegram]);
    const restartGame = useCallback(() => {
        setGameKey((prev) => prev + 1);
        setDialog(null);
    }, []);
    const submitWin = useCallback(async (summary) => {
        if (!user?.telegram_id) {
            setDialog({ type: "error", message: copy.userUnknown });
            return;
        }
        if (!initData) {
            setDialog({ type: "error", message: copy.initDataMissing });
            return;
        }
        if (!apiBaseUrl) {
            setDialog({ type: "error", message: copy.apiUnavailable });
            return;
        }
        setDialog({ type: "win", promoCode: "", message: copy.winPending });
        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/promo/claim`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    init_data: initData,
                    player: {
                        telegram_id: user.telegram_id,
                        username: user.username,
                        first_name: user.first_name,
                        last_name: user.last_name
                    },
                    moves: summary.moves,
                    board_state: summary.board,
                    locale,
                    theme
                })
            });
            if (!response.ok) {
                throw new Error("API error");
            }
            const data = await response.json();
            setDialog({ type: "win", promoCode: data.promo_code, message: copy.winReady });
            telegram?.HapticFeedback?.notificationOccurred?.("success");
            if (navigator.clipboard && data.promo_code) {
                navigator.clipboard.writeText(data.promo_code).then(() => {
                    setToast(copy.copySuccess);
                    setTimeout(() => setToast(""), 1500);
                });
            }
        }
        catch (error) {
            console.error("Promo API error", error);
            setDialog({ type: "error", message: copy.promoError });
            telegram?.HapticFeedback?.notificationOccurred?.("error");
        }
    }, [user, initData, apiBaseUrl, copy, locale, theme, telegram]);
    const handleLose = useCallback(() => {
        setDialog({ type: "lose", message: copy.lose });
        telegram?.HapticFeedback?.notificationOccurred?.("warning");
    }, [copy, telegram]);
    const handleDraw = useCallback(() => {
        setDialog({ type: "draw", message: copy.draw });
        telegram?.HapticFeedback?.notificationOccurred?.("warning");
    }, [copy, telegram]);
    const themeClass = theme === "dark" ? "theme-dark" : "theme-light";
    return (_jsxs("div", { className: `page minimal ${themeClass}`, children: [_jsx("div", { className: "title-banner", children: _jsx("h1", { children: copy.title }) }), _jsxs("div", { className: "game-panel", children: [_jsx("div", { className: "panel-top", children: _jsxs("div", { className: "tiny-controls", children: [availableLocales.map((loc) => (_jsx("button", { className: locale === loc ? "active" : "", onClick: () => setLocale(loc), children: loc.toUpperCase() }, loc))), themes.map((value) => (_jsx("button", { className: theme === value ? "active" : "", onClick: () => setTheme(value), children: value === "light" ? "☀️" : "🌙" }, value)))] }) }), _jsx(TicTacToe, { copy: gameCopy, onWin: submitWin, onLose: handleLose, onDraw: handleDraw }, gameKey), !apiBaseUrl && _jsx("p", { className: "muted warning center", children: copy.apiUnavailable })] }), dialog && (_jsx("div", { className: "overlay", children: _jsxs("div", { className: "dialog-card", children: [_jsx("p", { children: dialog.message }), dialog.type === "win" && (_jsxs("div", { className: "promo-code", children: [_jsx("span", { children: dialog.promoCode || "" }), _jsx("button", { className: "copy-icon", disabled: !dialog.promoCode, onClick: () => {
                                        if (!dialog.promoCode)
                                            return;
                                        navigator.clipboard.writeText(dialog.promoCode);
                                        setToast(copy.copySuccess);
                                        setTimeout(() => setToast(""), 1500);
                                    }, children: dialog.promoCode ? "📋" : _jsx("div", { className: "spinner" }) })] })), _jsx("button", { className: "primary", onClick: restartGame, children: copy.actionPlayAgain })] }) })), toast && _jsx("div", { className: "toast", children: toast })] }));
}
export default App;

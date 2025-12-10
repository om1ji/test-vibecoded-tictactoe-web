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
        const userJson = params.get("user");
        if (!userJson) {
            return null;
        }
        const parsed = JSON.parse(userJson);
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
    const [theme, setTheme] = useLocalStorage("ttt_theme", "light");
    const [statusMessage, setStatusMessage] = useState("");
    const [promoCode, setPromoCode] = useState(null);
    const telegram = useMemo(() => window.Telegram?.WebApp, []);
    const initData = useMemo(() => {
        if (telegram?.initData) {
            return telegram.initData;
        }
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("tgWebAppData") ?? "";
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
    const userFullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "гость";
    useEffect(() => {
        document.body.dataset.theme = theme;
    }, [theme]);
    useEffect(() => {
        telegram?.ready();
        console.log(telegram?.initData);
    }, [telegram]);
    const submitWin = useCallback(async (summary) => {
        if (!user?.telegram_id) {
            setStatusMessage(copy.userUnknown);
            return;
        }
        if (!initData) {
            setStatusMessage(copy.initDataMissing);
            return;
        }
        if (!apiBaseUrl) {
            setStatusMessage(copy.apiUnavailable);
            return;
        }
        setStatusMessage(copy.winPending);
        setPromoCode(null);
        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/promo/claim`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
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
            setPromoCode(data.promo_code);
            setStatusMessage(copy.winSuccess(data.promo_code));
            telegram?.HapticFeedback?.notificationOccurred?.("success");
        }
        catch (error) {
            console.error("Promo API error", error);
            setStatusMessage(copy.promoError);
            telegram?.HapticFeedback?.notificationOccurred?.("error");
        }
        finally {
            //
        }
    }, [user, telegram, apiBaseUrl, copy, locale, theme]);
    const handleLose = useCallback(() => {
        setStatusMessage(copy.lose);
    }, [copy]);
    const handleDraw = useCallback(() => {
        setStatusMessage(copy.draw);
    }, [copy]);
    const themeClass = theme === "dark" ? "theme-dark" : "theme-light";
    return (_jsxs("div", { className: `page ${themeClass}`, children: [_jsxs("header", { className: "hero", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: copy.subtitle }), _jsx("h1", { children: copy.title }), _jsx("p", { className: "muted", children: copy.startHint }), statusMessage && _jsx("p", { className: "status-banner", children: statusMessage })] }), _jsxs("div", { className: "controls", children: [_jsxs("div", { className: "control-block", children: [_jsx("span", { children: copy.languageLabel }), _jsx("div", { className: "segmented", children: availableLocales.map((loc) => (_jsx("button", { className: locale === loc ? "active" : "", onClick: () => setLocale(loc), type: "button", children: loc.toUpperCase() }, loc))) })] }), _jsxs("div", { className: "control-block", children: [_jsx("span", { children: copy.themeLabel }), _jsx("div", { className: "segmented", children: themes.map((value) => (_jsx("button", { className: theme === value ? "active" : "", onClick: () => setTheme(value), type: "button", children: value === "light" ? copy.lightTheme : copy.darkTheme }, value))) })] })] })] }), _jsxs("section", { className: "content", children: [_jsxs("div", { className: "game-column", children: [_jsxs("div", { className: "user-chip", children: [_jsx("span", { className: "chip-label", children: "\u0418\u0433\u0440\u043E\u043A" }), _jsx("span", { className: "chip-value", children: userFullName })] }), _jsx(TicTacToe, { copy: gameCopy, onWin: submitWin, onLose: handleLose, onDraw: handleDraw })] }), _jsxs("div", { className: "promo-column", children: [_jsx("h2", { children: copy.promoTitle }), promoCode ? (_jsxs("div", { className: "promo-card", children: [_jsx("p", { className: "muted", children: copy.promoSuccess }), _jsx("div", { className: "promo-code", children: promoCode })] })) : (_jsx("p", { className: "muted", children: copy.promoInfo })), !apiBaseUrl && _jsx("p", { className: "muted warning", children: copy.apiUnavailable })] })] })] }));
}
export default App;

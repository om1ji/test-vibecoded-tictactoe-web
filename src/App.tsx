import { useCallback, useEffect, useMemo, useState } from "react";
import { TicTacToe } from "./components/TicTacToe";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { fallbackLocale, LocaleKey, translations } from "./translations";

type UserPayload = {
  telegram_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

const decodePayload = (): UserPayload | null => {
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
    return JSON.parse(decoded) as UserPayload;
  } catch {
    return null;
  }
};

const availableLocales: LocaleKey[] = ["ru", "en"];
const themes = ["light", "dark"] as const;
type Theme = (typeof themes)[number];

function App() {
  const user = useMemo(() => decodePayload(), []);
  const userKey = user?.telegram_id?.toString() ?? "guest";
  const [locale, setLocale] = useLocalStorage<LocaleKey>("ttt_locale", fallbackLocale);
  const [theme, setTheme] = useLocalStorage<Theme>("ttt_theme", "light");
  const [lastMessage, setLastMessage] = useState("");
  const telegram = useMemo(() => window.Telegram?.WebApp, []);

  const copy = translations[locale] ?? translations[fallbackLocale];
  const gameCopy = useMemo(
    () => ({
      winPending: copy.winPending,
      loseText: copy.lose,
      drawText: copy.draw,
      actionPlayAgain: copy.actionPlayAgain,
      playerTurn: copy.playerTurn,
      botTurn: copy.botTurn
    }),
    [copy]
  );
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
      console.log("Отправляю sendData");
      telegram.sendData(
        JSON.stringify({
          event: "promo_request",
          userKey,
          timestamp: Date.now()
        })
      );
      telegram.HapticFeedback?.impactOccurred?.("soft");
      setLastMessage(copy.promoRequested);
    } catch {
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

  return (
    <div className={`page ${themeClass}`}>
      <header className="hero">
        <div className="controls">
          <div className="control-block">
            <span>{copy.languageLabel}</span>
            <div className="segmented">
              {availableLocales.map((loc) => (
                <button
                  key={loc}
                  className={locale === loc ? "active" : ""}
                  onClick={() => setLocale(loc)}
                  type="button"
                >
                  {loc.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="control-block">
            <span>{copy.themeLabel}</span>
            <div className="segmented">
              {themes.map((value) => (
                <button
                  key={value}
                  className={theme === value ? "active" : ""}
                  onClick={() => setTheme(value)}
                  type="button"
                >
                  {value === "light" ? copy.lightTheme : copy.darkTheme}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="content">
        <div className="game-column">
          <div className="user-chip">
            <span className="chip-label">Игрок</span>
            <span className="chip-value">{userFullName}</span>
          </div>

          <TicTacToe copy={gameCopy} onWin={requestPromoFromBot} onLose={handleLose} onDraw={handleDraw} />
        </div>

        <div className="promo-column">
          <h2>{copy.promoTitle}</h2>
          <p className="muted">{copy.promoInfo}</p>
        </div>
      </section>
    </div>
  );
}

export default App;

import { useCallback, useEffect, useMemo, useState } from "react";
import { TicTacToe, WinSummary } from "./components/TicTacToe";
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
  const [locale, setLocale] = useLocalStorage<LocaleKey>("ttt_locale", fallbackLocale);
  const [theme, setTheme] = useLocalStorage<Theme>("ttt_theme", "light");
  const [statusMessage, setStatusMessage] = useState("");
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const telegram = useMemo(() => window.Telegram?.WebApp, []);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

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
    console.log(telegram?.initData)
  }, [telegram]);

  const submitWin = useCallback(
    async (summary: WinSummary) => {
      if (!user?.telegram_id) {
        setStatusMessage(copy.userUnknown);
        return;
      }
      if (!telegram?.initData) {
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
            init_data: telegram.initData,
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
      } catch (error) {
        console.error("Promo API error", error);
        setStatusMessage(copy.promoError);
        telegram?.HapticFeedback?.notificationOccurred?.("error");
      } finally {
        //
      }
    },
    [user, telegram, apiBaseUrl, copy, locale, theme]
  );

  const handleLose = useCallback(() => {
    setStatusMessage(copy.lose);
  }, [copy]);

  const handleDraw = useCallback(() => {
    setStatusMessage(copy.draw);
  }, [copy]);

  const themeClass = theme === "dark" ? "theme-dark" : "theme-light";

  return (
    <div className={`page ${themeClass}`}>
      <header className="hero">
        <div>
          <p className="eyebrow">{copy.subtitle}</p>
          <h1>{copy.title}</h1>
          <p className="muted">{copy.startHint}</p>
          {statusMessage && <p className="status-banner">{statusMessage}</p>}
        </div>
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

          <TicTacToe copy={gameCopy} onWin={submitWin} onLose={handleLose} onDraw={handleDraw} />
        </div>

        <div className="promo-column">
          <h2>{copy.promoTitle}</h2>
          {promoCode ? (
            <div className="promo-card">
              <p className="muted">{copy.promoSuccess}</p>
              <div className="promo-code">{promoCode}</div>
            </div>
          ) : (
            <p className="muted">{copy.promoInfo}</p>
          )}
          {!apiBaseUrl && <p className="muted warning">{copy.apiUnavailable}</p>}
        </div>
      </section>
    </div>
  );
}

export default App;

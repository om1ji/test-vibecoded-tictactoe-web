export type LocaleKey = "ru" | "en";

type TranslationShape = {
  title: string;
  subtitle: string;
  startHint: string;
  winPending: string;
  winSuccess: (code: string) => string;
  lose: string;
  draw: string;
  playerTurn: string;
  botTurn: string;
  actionPlayAgain: string;
  promoTitle: string;
  promoInfo: string;
  promoSuccess: string;
  promoError: string;
  apiUnavailable: string;
  userUnknown: string;
  initDataMissing: string;
  lightTheme: string;
  darkTheme: string;
  languageLabel: string;
  themeLabel: string;
};

export const translations: Record<LocaleKey, TranslationShape> = {
  ru: {
    title: "Тихий TikTacToe",
    subtitle: "Мини-приложение для Telegram. Легко, быстро и женственно оформлено.",
    startHint: "Сыграйте против лёгкого ИИ. Победа подарит промокод, а поражение — шанс попробовать снова.",
    winPending: "Победа! Запрашиваю промокод…",
    winSuccess: (code) => `Промокод готов: ${code}`,
    lose: "Проигрыш. Попробуйте ещё раз — я верю в вас!",
    draw: "Ничья. Возможно, в следующий раз удача улыбнётся!",
    playerTurn: "Ваш ход",
    botTurn: "Ход соперника",
    actionPlayAgain: "Играть ещё раз",
    promoTitle: "Ваш промокод появится здесь",
    promoInfo: "Победите в игре, и мы запросим код на сервере. Он мгновенно появится ниже и будет доступен в боте.",
    promoSuccess: "Можете делиться с подругами или сохранить для себя — код уже активен.",
    promoError: "Сервер сейчас недоступен. Попробуйте ещё раз чуть позже.",
    apiUnavailable: "API не настроен. Обратитесь к разработчику.",
    userUnknown: "Не удалось определить профиль Telegram. Откройте мини-приложение заново из чата с ботом.",
    initDataMissing: "Telegram не прислал initData. Перезагрузите мини-приложение.",
    lightTheme: "Светлая",
    darkTheme: "Тёмная",
    languageLabel: "Язык",
    themeLabel: "Тема"
  },
  en: {
    title: "Gentle TicTacToe",
    subtitle: "Telegram mini app — lightweight, quick, with a soft feminine vibe.",
    startHint: "Play a round versus a calm bot. Win to unlock a promo code, lose to try again.",
    winPending: "Victory! Requesting your promo code…",
    winSuccess: (code) => `Promo code unlocked: ${code}`,
    lose: "Defeat. Hit play again — you are getting close!",
    draw: "Draw. Shuffle the grid again for another chance!",
    playerTurn: "Your move",
    botTurn: "Bot is thinking",
    actionPlayAgain: "Play again",
    promoTitle: "Your promo code will show up here",
    promoInfo: "Win a round and we will ask the backend for your personal code. It appears instantly below and stays with the bot.",
    promoSuccess: "Share it or keep it private — the code is already active.",
    promoError: "Server unavailable. Please try again a little later.",
    apiUnavailable: "Promo API is not configured. Contact the developer.",
    userUnknown: "Could not determine your Telegram profile. Relaunch the app from the bot.",
    initDataMissing: "Telegram did not provide initData. Reload the mini app.",
    lightTheme: "Light",
    darkTheme: "Dark",
    languageLabel: "Language",
    themeLabel: "Theme"
  }
};

export const fallbackLocale: LocaleKey = "ru";

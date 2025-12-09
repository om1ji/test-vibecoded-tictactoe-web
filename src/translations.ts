export type LocaleKey = "ru" | "en";

type TranslationShape = {
  title: string;
  subtitle: string;
  startHint: string;
  winPending: string;
  lose: string;
  draw: string;
  playerTurn: string;
  botTurn: string;
  actionPlayAgain: string;
  promoTitle: string;
  promoInfo: string;
  promoRequested: string;
  botUnavailable: string;
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
    winPending: "Победа! Запрашиваю промокод у бота…",
    lose: "Проигрыш. Попробуйте ещё раз — я верю в вас!",
    draw: "Ничья. Возможно, в следующий раз удача улыбнётся!",
    playerTurn: "Ваш ход",
    botTurn: "Ход соперника",
    actionPlayAgain: "Играть ещё раз",
    promoTitle: "Промокоды придут от бота",
    promoInfo: "После победы отправим заявку боту. Он пришлёт код в этот чат и сохранит его у себя.",
    promoRequested: "Запрос отправили боту — проверьте чат, код уже прилетает ✨",
    botUnavailable: "Не удалось обратиться к боту. Попробуйте обновить мини-приложение.",
    lightTheme: "Светлая",
    darkTheme: "Тёмная",
    languageLabel: "Язык",
    themeLabel: "Тема"
  },
  en: {
    title: "Gentle TicTacToe",
    subtitle: "Telegram mini app — lightweight, quick, with a soft feminine vibe.",
    startHint: "Play a round versus a calm bot. Win to unlock a promo code, lose to try again.",
    winPending: "Victory! Asking the bot for your promo code…",
    lose: "Defeat. Hit play again — you are getting close!",
    draw: "Draw. Shuffle the grid again for another chance!",
    playerTurn: "Your move",
    botTurn: "Bot is thinking",
    actionPlayAgain: "Play again",
    promoTitle: "Promo codes arrive from the bot",
    promoInfo: "Each win sends a request to the bot. The code lands in your chat and stays on the server.",
    promoRequested: "Promo request sent — keep an eye on the chat, the code is on the way ✨",
    botUnavailable: "Could not reach the bot. Please reload the mini app and try again.",
    lightTheme: "Light",
    darkTheme: "Dark",
    languageLabel: "Language",
    themeLabel: "Theme"
  }
};

export const fallbackLocale: LocaleKey = "ru";

export {};

type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";

interface TelegramHapticFeedback {
  impactOccurred?: (style: ImpactStyle) => void;
  notificationOccurred?: (type: "error" | "success" | "warning") => void;
}

interface TelegramWebApp {
  ready(): void;
  sendData(data: string): void;
  HapticFeedback?: TelegramHapticFeedback;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

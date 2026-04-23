export type Platform = {
  id: string;
  name: string;
  url: string;
  partition: string;
  accent: string;
};

export const platforms: Platform[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com",
    partition: "persist:ai-desk-chatgpt",
    accent: "#126b4f"
  },
  {
    id: "gemini",
    name: "Gemini",
    url: "https://gemini.google.com",
    partition: "persist:ai-desk-gemini",
    accent: "#3b82f6"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    url: "https://chat.deepseek.com",
    partition: "persist:ai-desk-deepseek",
    accent: "#1f4ed8"
  },
  {
    id: "doubao",
    name: "豆包",
    url: "https://www.doubao.com/chat",
    partition: "persist:ai-desk-doubao",
    accent: "#f97316"
  },
  {
    id: "kimi",
    name: "Kimi",
    url: "https://www.kimi.com",
    partition: "persist:ai-desk-kimi",
    accent: "#7c3aed"
  },
  {
    id: "tongyi",
    name: "通义千问",
    url: "https://tongyi.aliyun.com/qianwen",
    partition: "persist:ai-desk-tongyi",
    accent: "#b45309"
  }
];

export const platformMap = Object.fromEntries(
  platforms.map((platform) => [platform.id, platform])
) as Record<string, Platform>;

export type PlatformGuide = {
  platformId: string;
  headline: string;
  strengths: string[];
  bestFor: string;
  caution: string;
  starter: string;
};

export type TaskGuide = {
  id: string;
  label: string;
  description: string;
  platformIds: string[];
};

export const platformGuides: PlatformGuide[] = [
  {
    platformId: "chatgpt",
    headline: "通用推理、代码与复杂任务拆解",
    strengths: ["任务规划", "代码解释", "多轮推理"],
    bestFor: "需要把模糊问题拆成步骤、生成可执行方案、重构代码或写长文案时优先使用。",
    caution: "涉及最新信息时仍需要用户自己核验来源。",
    starter: "先让 ChatGPT 拆解任务、列出约束，再把关键结果拿去其他平台交叉验证。"
  },
  {
    platformId: "gemini",
    headline: "长上下文、多模态与 Google 生态",
    strengths: ["长上下文", "图片理解", "Google 生态"],
    bestFor: "适合长材料梳理、图文混合问题、与 Google 服务相关的任务。",
    caution: "不同地区和账号权限会影响可用模型与功能。",
    starter: "把长材料先交给 Gemini 做结构化摘要，再回到主平台继续深挖。"
  },
  {
    platformId: "deepseek",
    headline: "代码、数学与低成本推理",
    strengths: ["代码生成", "数学推导", "中文技术问答"],
    bestFor: "适合代码片段分析、算法解释、公式推导和技术方案备选。",
    caution: "复杂产品决策建议再和 ChatGPT 或 Gemini 对照一次。",
    starter: "用 DeepSeek 生成第一版技术解法，再用其他平台做风险审查。"
  },
  {
    platformId: "doubao",
    headline: "中文内容、创意表达与本土场景",
    strengths: ["中文写作", "内容改写", "创意发散"],
    bestFor: "适合中文营销文案、短视频脚本、社媒内容和本土化表达。",
    caution: "严肃技术结论建议交叉验证。",
    starter: "先让豆包给出多个中文表达版本，再挑一个进入精修。"
  },
  {
    platformId: "kimi",
    headline: "中文长文档阅读与资料整理",
    strengths: ["长文档", "中文资料", "摘要提炼"],
    bestFor: "适合读 PDF、会议纪要、中文报告和长文本资料归纳。",
    caution: "引用原文时需要回到源文件核对页码和上下文。",
    starter: "把长文档交给 Kimi 提炼目录、结论和待确认问题。"
  },
  {
    platformId: "tongyi",
    headline: "中文办公、阿里生态与生产力任务",
    strengths: ["中文办公", "表格思路", "企业场景"],
    bestFor: "适合中文办公写作、流程文档、商业分析和阿里生态相关任务。",
    caution: "跨平台发布前检查语气和事实。",
    starter: "用通义生成办公版本，再用 ChatGPT 或 Kimi 调整结构和细节。"
  }
];

export const taskGuides: TaskGuide[] = [
  {
    id: "coding",
    label: "代码与调试",
    description: "先要可执行方案，再要风险审查。",
    platformIds: ["chatgpt", "deepseek"]
  },
  {
    id: "long-doc",
    label: "长文档阅读",
    description: "先做结构化摘要，再沉淀关键结论。",
    platformIds: ["kimi", "gemini"]
  },
  {
    id: "writing",
    label: "中文写作",
    description: "先发散表达，再统一语气和结构。",
    platformIds: ["doubao", "tongyi", "chatgpt"]
  },
  {
    id: "research",
    label: "资料研究",
    description: "先拆问题，再跨平台交叉验证。",
    platformIds: ["chatgpt", "gemini", "kimi"]
  },
  {
    id: "office",
    label: "办公生产力",
    description: "面向汇报、流程、总结和表格思路。",
    platformIds: ["tongyi", "kimi", "chatgpt"]
  },
  {
    id: "creative",
    label: "创意内容",
    description: "更适合多版本表达和本土化改写。",
    platformIds: ["doubao", "chatgpt", "gemini"]
  }
];

export const platformGuideMap = Object.fromEntries(
  platformGuides.map((guide) => [guide.platformId, guide])
) as Record<string, PlatformGuide>;

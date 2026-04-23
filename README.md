# AI Desk

AI Desk 是一个本地优先的桌面端 AI 聚合工作台。当前 MVP 使用 Electron + React + TypeScript + Vite，把多个官方 AI 聊天网页聚合到一个桌面应用中，同时严格保持边界：

- 不做 API 逆向
- 不绕过登录
- 不采集或上传用户 cookie
- 不共享用户账号
- 不自动批量发送
- 所有登录态只保存在 Electron 本地 WebView session
- Prompt 与收藏夹只保存在本地 `localStorage`

## 当前内置平台

- ChatGPT: `https://chatgpt.com`
- Gemini: `https://gemini.google.com`
- DeepSeek: `https://chat.deepseek.com`
- 豆包: `https://www.doubao.com/chat`
- Kimi: `https://www.kimi.com`
- 通义千问: `https://tongyi.aliyun.com/qianwen`

## 安装依赖

```bash
npm install
```

## 启动开发环境

```bash
npm run dev
```

这会同时启动：

- Vite 渲染进程开发服务器
- Electron 桌面窗口

## 运行测试

```bash
npm test
```

## 构建生产包前端产物

```bash
npm run build
```

当前 `build` 会完成：

- TypeScript 检查
- Vite 前端构建
- Electron 主进程与 preload 文件语法检查

## 移动端构建

移动端使用 Capacitor 复用同一套 React 前端：

```bash
npm run mobile:sync
```

Android debug APK：

```bash
npm run build:android
```

如果本机和当前开发机一样使用 Homebrew 安装的 JDK 21 与 Android command line tools，可以直接运行：

```bash
npm run build:android:local
```

生成路径：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

iOS 工程：

```bash
npm run open:ios
```

iOS 需要完整 Xcode、Apple Developer Team 和签名配置后才能产出真机 `.ipa`。当前仓库已经生成了 Capacitor iOS 工程，路径是 `ios/App/App.xcodeproj`。

移动端限制：iOS/Android 不支持 Electron `webview`。移动端版本保留 Prompt、收藏和平台入口，点击平台时复制 Prompt 并通过系统/内置浏览器打开官方页面，由用户手动粘贴发送。

## 如何添加新的 AI 平台

编辑 [src/config/platforms.ts](/Users/mayuanyuan/git/ai-desk/src/config/platforms.ts)：

1. 添加新的平台对象
2. 提供唯一的 `id`
3. 提供平台名称 `name`
4. 提供官方地址 `url`
5. 提供唯一的本地 session 分区 `partition`
6. 提供一个用于 UI 展示的 `accent`

示例：

```ts
{
  id: "my-platform",
  name: "My Platform",
  url: "https://example.com/chat",
  partition: "persist:ai-desk-my-platform",
  accent: "#0f766e"
}
```

## 为什么当前版本只做复制，不做自动发送

当前版本刻意只提供“复制并打开某平台”：

- 自动填入和自动发送高度依赖每个平台不断变化的页面 DOM 结构
- 这类自动化会让行为边界变得模糊，容易滑向绕过网页正常交互
- 手动粘贴和发送能确保登录、会话、发送动作始终由用户本人掌控
- 这也让 MVP 更稳定，避免因为平台页面调整导致桌面端频繁失效

## MVP 已实现功能

- 左侧平台导航栏
- 中间单栏官方网页视图
- 双栏对比模式
- 底部浮动统一 Prompt 输入区
- “复制并打开某平台”动作
- 右侧 Prompt 收藏夹
- 本地 `localStorage` 持久化
- macOS / Windows / Android / iOS 工程构建入口

## 后续扩展方向

- 项目空间：按主题组织会话与收藏
- Markdown 导出：把 Prompt、备注和结果整理导出
- 半自动填入：在明确用户触发下辅助粘贴，但仍不自动发送
- API 模式：未来在用户明确接入官方 API 后，提供结构化工作流

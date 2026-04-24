import {
  BookOpen,
  Compass,
  Copy,
  Database,
  Download,
  ExternalLink,
  Lightbulb,
  Plus,
  Search,
  Send,
  Tag,
  Trash2
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { Platform } from "../config/platforms";
import {
  platformGuideMap,
  taskGuides,
  type PlatformGuide
} from "../config/platformGuides";
import {
  DEFAULT_KNOWLEDGE_SPACE_ID,
  getKnowledgeTags,
  searchKnowledgeItems,
  type KnowledgeDraft,
  type KnowledgeItem,
  type KnowledgeSpace
} from "../lib/knowledge";

type KnowledgePanelProps = {
  activePlatformId: string;
  countLabel: string;
  items: KnowledgeItem[];
  platforms: Platform[];
  spaces: KnowledgeSpace[];
  onCopyItem: (item: KnowledgeItem) => void;
  onCreateItem: (draft: KnowledgeDraft) => void;
  onDeleteItem: (itemId: string) => void;
  onExportMarkdown: () => void;
  onOpenPlatform: (platformId: string) => void;
  onUseText: (text: string) => void;
};

export function KnowledgePanel({
  activePlatformId,
  countLabel,
  items,
  platforms,
  spaces,
  onCopyItem,
  onCreateItem,
  onDeleteItem,
  onExportMarkdown,
  onOpenPlatform,
  onUseText
}: KnowledgePanelProps) {
  const [selectedTaskId, setSelectedTaskId] = useState(taskGuides[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [spaceFilter, setSpaceFilter] = useState<string>("__all");
  const [platformFilter, setPlatformFilter] = useState<string>("__all");
  const [tagFilter, setTagFilter] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftSpaceId, setDraftSpaceId] = useState(DEFAULT_KNOWLEDGE_SPACE_ID);
  const [draftPlatformId, setDraftPlatformId] = useState(activePlatformId);
  const [draftTags, setDraftTags] = useState("");

  useEffect(() => {
    if (!draftTitle && !draftContent) {
      setDraftPlatformId(activePlatformId);
    }
  }, [activePlatformId, draftContent, draftTitle]);

  const platformById = useMemo(
    () => new Map(platforms.map((platform) => [platform.id, platform])),
    [platforms]
  );
  const spaceById = useMemo(
    () => new Map(spaces.map((space) => [space.id, space])),
    [spaces]
  );
  const selectedTask = taskGuides.find((task) => task.id === selectedTaskId) ?? taskGuides[0];
  const recommendations = selectedTask.platformIds
    .map((platformId) => platformGuideMap[platformId])
    .filter(Boolean);
  const allTags = useMemo(() => getKnowledgeTags(items), [items]);
  const filteredItems = useMemo(
    () =>
      searchKnowledgeItems(items, {
        query: deferredSearchQuery,
        spaceId: spaceFilter === "__all" ? undefined : spaceFilter,
        platformId:
          platformFilter === "__all" ? undefined : platformFilter || null,
        tag: tagFilter || null
      }),
    [deferredSearchQuery, items, platformFilter, spaceFilter, tagFilter]
  );

  const handleCreateItem = () => {
    if (!draftContent.trim() && !draftTitle.trim()) {
      return;
    }

    onCreateItem({
      title: draftTitle,
      content: draftContent,
      spaceId: draftSpaceId,
      platformId: draftPlatformId || null,
      tags: draftTags
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    });
    setDraftTitle("");
    setDraftContent("");
    setDraftTags("");
    setDraftSpaceId(DEFAULT_KNOWLEDGE_SPACE_ID);
    setDraftPlatformId(activePlatformId);
  };

  return (
    <aside className="knowledge-panel" aria-label="AI 平台引导和本地知识库">
      <header className="knowledge-panel__header">
        <div className="panel-title">
          <Compass size={18} strokeWidth={1.8} />
          <div>
            <p>AI Navigator</p>
            <h2>平台引导</h2>
          </div>
        </div>
        <div className="knowledge-panel__header-actions">
          <span>{countLabel}</span>
          <button
            className="icon-button"
            onClick={onExportMarkdown}
            title="导出 Markdown"
            type="button"
          >
            <Download size={15} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <section className="guide-section" aria-label="AI 平台推荐">
        <div className="guide-section__intro">
          <Lightbulb size={17} strokeWidth={1.8} />
          <div>
            <h3>先选任务，再选平台</h3>
            <p>不同官方 AI 平台擅长的事情不一样。这里给出使用建议，不替用户自动发送。</p>
          </div>
        </div>

        <div className="task-chip-row" aria-label="任务类型">
          {taskGuides.map((task) => (
            <button
              className={task.id === selectedTaskId ? "is-active" : ""}
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              type="button"
            >
              {task.label}
            </button>
          ))}
        </div>

        <p className="guide-section__description">{selectedTask.description}</p>

        <div className="recommendation-list">
          {recommendations.map((guide) => (
            <RecommendationCard
              guide={guide}
              key={guide.platformId}
              platform={platformById.get(guide.platformId)}
              onOpenPlatform={onOpenPlatform}
              onUseText={onUseText}
            />
          ))}
        </div>
      </section>

      <section className="knowledge-section" aria-label="本地知识库">
        <div className="knowledge-section__title">
          <div className="panel-title">
            <Database size={17} strokeWidth={1.8} />
            <div>
              <p>Local Knowledge</p>
              <h2>知识库</h2>
            </div>
          </div>
        </div>

        <div className="knowledge-space-row" aria-label="知识空间">
          <button
            className={spaceFilter === "__all" ? "is-active" : ""}
            onClick={() => setSpaceFilter("__all")}
            type="button"
          >
            全部
          </button>
          {spaces.map((space) => (
            <button
              className={spaceFilter === space.id ? "is-active" : ""}
              key={space.id}
              onClick={() => setSpaceFilter(space.id)}
              title={space.description}
              type="button"
            >
              {space.name}
            </button>
          ))}
        </div>

        <div className="knowledge-filters">
          <label className="knowledge-search">
            <Search size={15} strokeWidth={1.8} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索知识、标签或内容"
              type="search"
            />
          </label>
          <select
            aria-label="按平台筛选"
            value={platformFilter}
            onChange={(event) => setPlatformFilter(event.target.value)}
          >
            <option value="__all">全部平台</option>
            <option value="">未绑定平台</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
        </div>

        {allTags.length > 0 ? (
          <div className="knowledge-tag-row" aria-label="知识标签">
            <button
              className={!tagFilter ? "is-active" : ""}
              onClick={() => setTagFilter("")}
              type="button"
            >
              <Tag size={13} strokeWidth={1.8} />
              全部
            </button>
            {allTags.map((tag) => (
              <button
                className={tagFilter === tag ? "is-active" : ""}
                key={tag}
                onClick={() => setTagFilter(tag)}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>
        ) : null}

        <details className="knowledge-capture">
          <summary>
            <Plus size={15} strokeWidth={2} />
            新增知识
          </summary>
          <div className="knowledge-capture__form">
            <input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="标题，例如：Kimi 适合处理中文长文档"
            />
            <textarea
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              placeholder="记录使用经验、对比结论、常用流程或平台限制"
            />
            <div className="knowledge-capture__meta">
              <select
                aria-label="知识空间"
                value={draftSpaceId}
                onChange={(event) => setDraftSpaceId(event.target.value)}
              >
                {spaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="知识来源平台"
                value={draftPlatformId}
                onChange={(event) => setDraftPlatformId(event.target.value)}
              >
                <option value="">不绑定平台</option>
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
              <input
                value={draftTags}
                onChange={(event) => setDraftTags(event.target.value)}
                placeholder="标签，用逗号分隔"
              />
              <button
                className="material-button primary-button"
                onClick={handleCreateItem}
                type="button"
              >
                保存
              </button>
            </div>
          </div>
        </details>

        <div className="knowledge-list">
          {filteredItems.length === 0 ? (
            <div className="knowledge-empty">
              <BookOpen size={18} strokeWidth={1.7} />
              <p>还没有匹配的知识。可以先记录平台特点、对比结论或常用工作流。</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const platform = item.platformId
                ? platformById.get(item.platformId)
                : null;
              const space = spaceById.get(item.spaceId);

              return (
                <article className="knowledge-card" key={item.id}>
                  <div className="knowledge-card__header">
                    <div>
                      <h3>{highlightMatch(item.title, deferredSearchQuery)}</h3>
                      <span>
                        {space?.name ?? "未分区"} · {platform?.name ?? "未绑定平台"}
                      </span>
                    </div>
                    <time dateTime={item.updatedAt}>
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </time>
                  </div>
                  <p>{highlightMatch(item.content, deferredSearchQuery)}</p>
                  {item.tags.length > 0 ? (
                    <div className="knowledge-card__tags">
                      {item.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setTagFilter(tag)}
                          type="button"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="knowledge-card__actions">
                    <button
                      className="icon-button"
                      onClick={() => onUseText(item.content || item.title)}
                      title="放入 Quick Copy"
                      type="button"
                    >
                      <Send size={15} strokeWidth={1.8} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => onCopyItem(item)}
                      title="复制内容"
                      type="button"
                    >
                      <Copy size={15} strokeWidth={1.8} />
                    </button>
                    {item.platformId ? (
                      <button
                        className="icon-button"
                        onClick={() => onOpenPlatform(item.platformId as string)}
                        title="打开来源平台"
                        type="button"
                      >
                        <ExternalLink size={15} strokeWidth={1.8} />
                      </button>
                    ) : null}
                    <button
                      className="icon-button danger-button"
                      onClick={() => onDeleteItem(item.id)}
                      title="删除知识"
                      type="button"
                    >
                      <Trash2 size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </aside>
  );
}

type RecommendationCardProps = {
  guide: PlatformGuide;
  platform?: Platform;
  onOpenPlatform: (platformId: string) => void;
  onUseText: (text: string) => void;
};

function RecommendationCard({
  guide,
  platform,
  onOpenPlatform,
  onUseText
}: RecommendationCardProps) {
  if (!platform) {
    return null;
  }

  return (
    <article className="recommendation-card">
      <div className="recommendation-card__header">
        <span style={{ ["--platform-accent" as string]: platform.accent }}>
          {platform.name.slice(0, 1)}
        </span>
        <div>
          <h3>{platform.name}</h3>
          <p>{guide.headline}</p>
        </div>
      </div>
      <p>{guide.bestFor}</p>
      <div className="recommendation-card__chips">
        {guide.strengths.map((strength) => (
          <span key={strength}>{strength}</span>
        ))}
      </div>
      <small>{guide.starter}</small>
      <small className="recommendation-card__caution">边界：{guide.caution}</small>
      <div className="recommendation-card__actions">
        <button
          className="material-button"
          onClick={() => onOpenPlatform(platform.id)}
          type="button"
        >
          <ExternalLink size={15} strokeWidth={1.8} />
          打开
        </button>
        <button
          className="material-button"
          onClick={() => onUseText(guide.starter)}
          type="button"
        >
          <Send size={15} strokeWidth={1.8} />
          放入 Quick Copy
        </button>
      </div>
    </article>
  );
}

function highlightMatch(text: string, query: string) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return text;
  }

  const index = text.toLowerCase().indexOf(normalizedQuery.toLowerCase());

  if (index === -1) {
    return text;
  }

  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + normalizedQuery.length)}</mark>
      {text.slice(index + normalizedQuery.length)}
    </>
  );
}

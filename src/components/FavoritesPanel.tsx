import {
  BookmarkPlus,
  Edit3,
  FolderPlus,
  Library,
  MousePointerClick,
  Plus,
  Search,
  Tag,
  Trash2
} from "lucide-react";
import { useMemo, useState, type MouseEvent } from "react";
import {
  searchFavorites,
  type PromptFavorite,
  type PromptGroup,
  type PromptTag
} from "../lib/favorites";

type FavoritesPanelProps = {
  favoriteTitle: string;
  favorites: PromptFavorite[];
  favoriteCountLabel: string;
  groups: PromptGroup[];
  tags: PromptTag[];
  selectedGroupId: string | null;
  selectedTagIds: string[];
  onChangeTitle: (title: string) => void;
  onChangeSelectedGroup: (groupId: string | null) => void;
  onChangeSelectedTags: (tagIds: string[]) => void;
  onCreateGroup: (name: string) => void;
  onCreateTag: (name: string) => void;
  onDeleteFavorite: (favoriteId: string) => void;
  onEditFavorite: (favoriteId: string, title: string) => void;
  onManageGroup: (groupId: string, action: "rename" | "delete" | "color", value?: string) => void;
  onMoveFavorite: (favoriteId: string, groupId: string | null) => void;
  onSaveFavorite: () => void;
  onUseFavorite: (favorite: PromptFavorite) => void;
};

export function FavoritesPanel({
  favoriteTitle,
  favorites,
  favoriteCountLabel,
  groups,
  tags,
  selectedGroupId,
  selectedTagIds,
  onChangeTitle,
  onChangeSelectedGroup,
  onChangeSelectedTags,
  onCreateGroup,
  onCreateTag,
  onDeleteFavorite,
  onEditFavorite,
  onManageGroup,
  onMoveFavorite,
  onSaveFavorite,
  onUseFavorite
}: FavoritesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroupId, setActiveGroupId] = useState<string | null | undefined>();
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");

  const filtered = useMemo(
    () =>
      searchFavorites(favorites, {
        query: searchQuery,
        groupId: activeGroupId,
        tagId: activeTagId
      }),
    [activeGroupId, activeTagId, favorites, searchQuery]
  );

  const groupById = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups]
  );
  const tagById = useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);

  const toggleSelectedTag = (tagId: string) => {
    onChangeSelectedTags(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId]
    );
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      return;
    }

    onCreateTag(newTagName);
    setNewTagName("");
  };

  const handleGroupContext = (event: MouseEvent, group: PromptGroup) => {
    event.preventDefault();
    const value = window.prompt(
      "Rename group, enter #hex color, or type delete",
      group.name
    );

    if (!value) {
      return;
    }

    if (value.toLowerCase() === "delete") {
      onManageGroup(group.id, "delete");
      return;
    }

    if (value.startsWith("#")) {
      onManageGroup(group.id, "color", value);
      return;
    }

    onManageGroup(group.id, "rename", value);
  };

  return (
    <aside className="favorites-panel" aria-label="Prompt 收藏夹">
      <div className="favorites-panel__header">
        <div className="panel-title">
          <Library size={18} strokeWidth={1.8} />
          <div>
            <p>Prompt Library</p>
            <h2>收藏库</h2>
          </div>
        </div>
        <span>{favoriteCountLabel}</span>
      </div>

      <div className="favorites-panel__search">
        <Search size={15} strokeWidth={1.8} />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search prompts"
        />
        <select
          value={activeGroupId === undefined ? "__all" : activeGroupId ?? ""}
          onChange={(event) =>
            setActiveGroupId(
              event.target.value === "__all" ? undefined : event.target.value || null
            )
          }
          aria-label="Group filter"
        >
          <option value="__all">All groups</option>
          <option value="">Ungrouped</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="favorites-panel__body">
        <nav className="favorites-panel__groups" aria-label="Prompt groups">
          <button
            className={activeGroupId === undefined ? "is-active" : ""}
            onClick={() => setActiveGroupId(undefined)}
            type="button"
          >
            All
          </button>
          <button
            className={activeGroupId === null ? "is-active" : ""}
            onClick={() => setActiveGroupId(null)}
            type="button"
          >
            Ungrouped
          </button>
          {groups.map((group) => (
            <button
              className={activeGroupId === group.id ? "is-active" : ""}
              key={group.id}
              onClick={() => setActiveGroupId(group.id)}
              onContextMenu={(event) => handleGroupContext(event, group)}
              style={{ ["--group-color" as string]: group.color }}
              type="button"
            >
              <span />
              {group.name}
            </button>
          ))}
          <button
            className="favorites-panel__new-group"
            onClick={() => {
              const name = window.prompt("New group name");
              if (name?.trim()) {
                onCreateGroup(name);
              }
            }}
            type="button"
          >
            <FolderPlus size={14} strokeWidth={1.9} />
            New
          </button>
        </nav>

        <div className="favorites-panel__main">
          <section className="favorites-panel__tags" aria-label="Tag filters">
            <button
              className={!activeTagId ? "is-active" : ""}
              onClick={() => setActiveTagId(null)}
              type="button"
            >
              <Tag size={13} strokeWidth={1.8} />
              All tags
            </button>
            {tags.map((tag) => (
              <button
                className={activeTagId === tag.id ? "is-active" : ""}
                key={tag.id}
                onClick={() => setActiveTagId(tag.id)}
                style={{ ["--tag-color" as string]: tag.color }}
                type="button"
              >
                {tag.name}
              </button>
            ))}
          </section>

          <section className="favorites-panel__save-form" aria-label="Save Prompt">
            <input
              type="text"
              value={favoriteTitle}
              onChange={(event) => onChangeTitle(event.target.value)}
              placeholder="Title from Prompt summary"
            />
            <select
              value={selectedGroupId ?? ""}
              onChange={(event) =>
                onChangeSelectedGroup(event.target.value || null)
              }
              aria-label="Save group"
            >
              <option value="">Ungrouped</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <button
              className="material-button save-button"
              onClick={onSaveFavorite}
              type="button"
            >
              <BookmarkPlus size={16} strokeWidth={1.9} />
              Save
            </button>
          </section>

          <section className="favorites-panel__tag-picker" aria-label="Save tags">
            {tags.map((tag) => (
              <button
                className={selectedTagIds.includes(tag.id) ? "is-active" : ""}
                key={tag.id}
                onClick={() => toggleSelectedTag(tag.id)}
                style={{ ["--tag-color" as string]: tag.color }}
                type="button"
              >
                {tag.name}
              </button>
            ))}
            <div>
              <input
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleCreateTag();
                  }
                }}
                placeholder="New tag"
              />
              <button onClick={handleCreateTag} title="Create tag" type="button">
                <Plus size={13} strokeWidth={2} />
              </button>
            </div>
          </section>

          <div className="favorites-list">
            {filtered.length === 0 ? (
              <div className="favorites-empty">
                <Library size={18} strokeWidth={1.7} />
                <p>No matching prompts.</p>
              </div>
            ) : (
              filtered.map((favorite) => {
                const group = favorite.groupId ? groupById.get(favorite.groupId) : null;

                return (
                  <article className="favorite-card" key={favorite.id}>
                    <div className="favorite-card__header">
                      <h3>{highlightMatch(favorite.title, searchQuery)}</h3>
                      <time dateTime={favorite.updatedAt}>
                        {new Date(favorite.updatedAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p>{highlightMatch(favorite.content, searchQuery)}</p>
                    <div className="favorite-card__meta">
                      <span
                        style={{
                          ["--group-color" as string]: group?.color ?? "#94a3b8"
                        }}
                      >
                        {group?.name ?? "Ungrouped"}
                      </span>
                      {favorite.tags.map((tagId) => {
                        const tag = tagById.get(tagId);

                        return tag ? (
                          <button
                            key={tag.id}
                            onClick={() => setActiveTagId(tag.id)}
                            style={{ ["--tag-color" as string]: tag.color }}
                            type="button"
                          >
                            {tag.name}
                          </button>
                        ) : null;
                      })}
                    </div>
                    <div className="favorite-card__actions">
                      <select
                        value={favorite.groupId ?? ""}
                        onChange={(event) =>
                          onMoveFavorite(favorite.id, event.target.value || null)
                        }
                        aria-label="Move favorite"
                      >
                        <option value="">Ungrouped</option>
                        {groups.map((groupOption) => (
                          <option key={groupOption.id} value={groupOption.id}>
                            {groupOption.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="icon-button"
                        onClick={() => onUseFavorite(favorite)}
                        title="使用 Prompt"
                        type="button"
                      >
                        <MousePointerClick size={16} strokeWidth={1.8} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => {
                          const title = window.prompt("Edit title", favorite.title);
                          if (title?.trim()) {
                            onEditFavorite(favorite.id, title);
                          }
                        }}
                        title="编辑标题"
                        type="button"
                      >
                        <Edit3 size={15} strokeWidth={1.8} />
                      </button>
                      <button
                        className="icon-button danger-button"
                        onClick={() => onDeleteFavorite(favorite.id)}
                        title="删除"
                        type="button"
                      >
                        <Trash2 size={16} strokeWidth={1.8} />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
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

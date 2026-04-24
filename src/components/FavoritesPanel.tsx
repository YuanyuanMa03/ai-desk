import { BookmarkPlus, Library, MousePointerClick, Trash2 } from "lucide-react";
import type { PromptFavorite } from "../lib/favorites";

type FavoritesPanelProps = {
  favoriteTitle: string;
  favorites: PromptFavorite[];
  favoriteCountLabel: string;
  onChangeTitle: (title: string) => void;
  onDeleteFavorite: (favoriteId: string) => void;
  onSaveFavorite: () => void;
  onUseFavorite: (favorite: PromptFavorite) => void;
};

export function FavoritesPanel({
  favoriteTitle,
  favorites,
  favoriteCountLabel,
  onChangeTitle,
  onDeleteFavorite,
  onSaveFavorite,
  onUseFavorite
}: FavoritesPanelProps) {
  return (
    <aside className="favorites-panel" aria-label="Prompt 收藏夹">
      <div className="favorites-panel__header">
        <div className="panel-title">
          <Library size={18} strokeWidth={1.8} />
          <div>
            <p>Favorites</p>
            <h2>Prompt 收藏夹</h2>
          </div>
        </div>
        <span>{favoriteCountLabel}</span>
      </div>

      <label className="favorites-panel__field">
        <span>标题</span>
        <input
          type="text"
          value={favoriteTitle}
          onChange={(event) => onChangeTitle(event.target.value)}
          placeholder="默认使用 Prompt 摘要"
        />
      </label>

      <button
        className="material-button save-button"
        onClick={onSaveFavorite}
        type="button"
      >
        <BookmarkPlus size={16} strokeWidth={1.9} />
        保存当前 Prompt
      </button>

      <div className="favorites-list">
        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <Library size={18} strokeWidth={1.7} />
            <p>还没有收藏 Prompt。</p>
          </div>
        ) : (
          favorites.map((favorite) => (
            <article className="favorite-card" key={favorite.id}>
              <div className="favorite-card__header">
                <h3>{favorite.title}</h3>
                <time dateTime={favorite.createdAt}>
                  {new Date(favorite.createdAt).toLocaleDateString()}
                </time>
              </div>
              <p>{favorite.content}</p>
              <div className="favorite-card__actions">
                <button
                  className="icon-button"
                  onClick={() => onUseFavorite(favorite)}
                  title="使用 Prompt"
                  type="button"
                >
                  <MousePointerClick size={16} strokeWidth={1.8} />
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
          ))
        )}
      </div>
    </aside>
  );
}

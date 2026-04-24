import { Sparkles } from "lucide-react";
import type { Platform } from "../config/platforms";

type PlatformRailProps = {
  platforms: Platform[];
  activePlatformId: string;
  onSelectPlatform: (platformId: string) => void;
};

export function PlatformRail({
  platforms,
  activePlatformId,
  onSelectPlatform
}: PlatformRailProps) {
  return (
    <aside className="platform-rail" aria-label="AI 平台">
      <div className="brand-mark" title="AI Desk">
        <Sparkles size={20} strokeWidth={1.8} />
      </div>

      <nav className="platform-nav">
        {platforms.map((platform) => {
          const active = platform.id === activePlatformId;

          return (
            <button
              key={platform.id}
              className={`platform-nav__item${active ? " is-active" : ""}`}
              onClick={() => onSelectPlatform(platform.id)}
              style={{ ["--platform-accent" as string]: platform.accent }}
              title={platform.name}
              type="button"
            >
              <span className="platform-nav__glyph">
                {platform.name.slice(0, 1)}
              </span>
              <span className="platform-nav__name">{platform.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

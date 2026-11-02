import type { KnowledgeItem, Project } from "@/lib/os/types";
import {
  KNOWLEDGE_FORMATS,
  formatBadgeClass,
  getKnowledgeFormat,
  getKnowledgePreview,
} from "@/lib/os/knowledge";
import { Badge, Glass } from "@/components/os/ui";
import { FORMAT_ICONS } from "./knowledgeMeta";

interface KnowledgeCardProps {
  item: KnowledgeItem;
  linkedProject?: Project | undefined;
  onClick: () => void;
}

export function KnowledgeCard({
  item,
  linkedProject,
  onClick,
}: KnowledgeCardProps) {
  const fmt = getKnowledgeFormat(item);
  const FmtIcon = FORMAT_ICONS[fmt];
  const fmtMeta = KNOWLEDGE_FORMATS.find((f) => f.id === fmt);
  const preview = getKnowledgePreview(item);

  return (
    <Glass
      className="cursor-pointer p-5 transition hover:-translate-y-1 hover:border-primary/40 flex flex-col justify-between"
      onClick={onClick}
    >
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Knowledge Format Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${formatBadgeClass(
              fmt,
            )}`}
          >
            <FmtIcon className="h-3 w-3" />
            {fmtMeta?.label || fmt}
          </span>

          {/* Independent Knowledge Type Badge */}
          <Badge>{item.type}</Badge>

          {/* Priority Badge */}
          {item.priorityId && <Badge>#{item.priorityId}</Badge>}
        </div>

        <div className="mt-3 font-semibold text-foreground text-base leading-snug line-clamp-2">
          {item.title}
        </div>

        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {preview}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-glass-border/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="truncate max-w-[200px]">
          {linkedProject ? linkedProject.name : item.createdAt}
        </div>
        {item.tags && (
          <div className="truncate max-w-[150px] font-mono text-[10px]">
            #{item.tags}
          </div>
        )}
      </div>
    </Glass>
  );
}

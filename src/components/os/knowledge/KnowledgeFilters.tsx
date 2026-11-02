import { Search } from "lucide-react";
import type { Priority } from "@/lib/os/types";
import { Input, Select } from "@/components/os/ui";
import { KNOWLEDGE_TYPES } from "./knowledgeMeta";

interface KnowledgeFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  formatFilter: string;
  onFormatFilterChange: (fmt: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (prio: string) => void;
  priorities: Priority[];
}

export function KnowledgeFilters({
  query,
  onQueryChange,
  formatFilter,
  onFormatFilterChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  priorities,
}: KnowledgeFiltersProps) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_170px_170px_190px]">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search titles, principles, steps, tags…"
          className="pl-9"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      {/* Knowledge Format Filter */}
      <Select
        value={formatFilter}
        onChange={onFormatFilterChange}
        options={[
          { value: "all", label: "All Formats" },
          { value: "principle", label: "Principles" },
          { value: "method", label: "Methods" },
          { value: "framework", label: "Frameworks" },
          { value: "custom", label: "Custom" },
        ]}
      />

      {/* Knowledge Type Filter */}
      <Select
        value={typeFilter}
        onChange={onTypeFilterChange}
        options={[
          { value: "all", label: "All Types" },
          ...KNOWLEDGE_TYPES.map((t) => ({ value: t, label: t })),
        ]}
      />

      {/* Priority Filter */}
      <Select
        value={priorityFilter}
        onChange={onPriorityFilterChange}
        options={[
          { value: "all", label: "All Priorities" },
          ...priorities.map((p) => ({
            value: String(p.id),
            label: `#${p.id} ${p.name}`,
          })),
        ]}
      />
    </div>
  );
}

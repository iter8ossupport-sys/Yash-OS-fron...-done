import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import type { ReflectionTemplate } from "@/lib/os/types";
import { Button, Input } from "@/components/os/ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewQuestionsSettingsProps {
  templates: ReflectionTemplate;
  onUpdateTemplates: (templates: ReflectionTemplate) => void;
  onResetTemplates: () => void;
}

export function ReviewQuestionsSettings({
  templates,
  onUpdateTemplates,
  onResetTemplates,
}: ReviewQuestionsSettingsProps) {
  const [questionCadence, setQuestionCadence] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [newQuestionInput, setNewQuestionInput] = useState("");

  const handleAddQuestion = () => {
    if (!newQuestionInput.trim()) return;
    const currentList = templates[questionCadence] ?? [];
    const updated = {
      ...templates,
      [questionCadence]: [...currentList, newQuestionInput.trim()],
    };
    onUpdateTemplates(updated);
    setNewQuestionInput("");
    toast.success(`Added question to ${questionCadence} review.`);
  };

  const handleDeleteQuestion = (idx: number) => {
    const currentList = templates[questionCadence] ?? [];
    const updated = {
      ...templates,
      [questionCadence]: currentList.filter((_, i) => i !== idx),
    };
    onUpdateTemplates(updated);
    toast.success("Question removed.");
  };

  const handleReset = () => {
    if (confirm("Reset reflection questions to Yash OS default prompts?")) {
      onResetTemplates();
      toast.success("Questions reset to defaults.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-foreground text-sm">
              Reflection Prompt Customization
            </span>
            <p className="text-muted-foreground text-xs mt-0.5">
              Customize the specific reflection questions asked during Daily,
              Weekly, and Monthly reviews.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Defaults
          </Button>
        </div>

        {/* Cadence Switcher */}
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setQuestionCadence(c)}
              className={cn(
                "px-3 py-1.5 rounded-xl font-medium capitalize text-xs transition-all",
                questionCadence === c
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-secondary/30 text-muted-foreground hover:text-foreground",
              )}
            >
              {c} Questions ({(templates[c] ?? []).length})
            </button>
          ))}
        </div>

        {/* Question list for active cadence */}
        <div className="space-y-2">
          {(templates[questionCadence] ?? []).map((q, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-glass-border bg-secondary/20"
            >
              <span className="text-xs text-foreground flex-1">
                <span className="font-bold text-primary mr-2">Q{idx + 1}.</span>{" "}
                {q}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive h-7 w-7 hover:bg-destructive/15 shrink-0"
                onClick={() => handleDeleteQuestion(idx)}
                aria-label="Delete Question"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Question */}
        <div className="flex gap-2 pt-2 border-t border-glass-border/40">
          <Input
            placeholder={`Add a new question for ${questionCadence} review...`}
            value={newQuestionInput}
            onChange={(e) => setNewQuestionInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
          />
          <Button variant="primary" size="sm" onClick={handleAddQuestion}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}

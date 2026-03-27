import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationDisplayProps {
  toolInvocation: ToolInvocation;
}

function getToolLabel(
  toolName: string,
  args: Record<string, unknown>,
  isComplete: boolean
): string {
  const path = typeof args.path === "string" ? args.path : null;
  const command = typeof args.command === "string" ? args.command : null;

  if (toolName === "str_replace_editor" && path) {
    switch (command) {
      case "create":
        return isComplete ? `Created ${path}` : `Creating ${path}`;
      case "str_replace":
      case "insert":
        return isComplete ? `Edited ${path}` : `Editing ${path}`;
      case "view":
        return isComplete ? `Viewed ${path}` : `Viewing ${path}`;
      case "undo_edit":
        return isComplete ? `Reverted ${path}` : `Reverting ${path}`;
    }
  }

  if (toolName === "file_manager" && path) {
    const newPath = typeof args.new_path === "string" ? args.new_path : null;
    switch (command) {
      case "rename":
        if (newPath) {
          return isComplete
            ? `Renamed ${path} → ${newPath}`
            : `Renaming ${path}`;
        }
        return isComplete ? `Renamed ${path}` : `Renaming ${path}`;
      case "delete":
        return isComplete ? `Deleted ${path}` : `Deleting ${path}`;
    }
  }

  return toolName;
}

export function ToolInvocationDisplay({
  toolInvocation,
}: ToolInvocationDisplayProps) {
  const isComplete =
    toolInvocation.state === "result" && "result" in toolInvocation;
  const args = (toolInvocation.args ?? {}) as Record<string, unknown>;
  const label = getToolLabel(toolInvocation.toolName, args, isComplete);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}

import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationDisplay } from "../ToolInvocationDisplay";

afterEach(() => {
  cleanup();
});

test("shows 'Created' for completed str_replace_editor create command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/App.jsx" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Created /App.jsx")).toBeDefined();
});

test("shows 'Creating' for in-progress str_replace_editor create command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("shows 'Edited' for completed str_replace command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "str_replace", path: "/components/Card.jsx" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Edited /components/Card.jsx")).toBeDefined();
});

test("shows 'Editing' for in-progress str_replace command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "str_replace", path: "/components/Card.jsx" },
      }}
    />
  );

  expect(screen.getByText("Editing /components/Card.jsx")).toBeDefined();
});

test("shows 'Edited' for completed insert command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "insert", path: "/utils.js" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Edited /utils.js")).toBeDefined();
});

test("shows 'Viewed' for completed view command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "view", path: "/App.jsx" },
        result: "file contents",
      }}
    />
  );

  expect(screen.getByText("Viewed /App.jsx")).toBeDefined();
});

test("shows 'Reverted' for completed undo_edit command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "undo_edit", path: "/App.jsx" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Reverted /App.jsx")).toBeDefined();
});

test("shows 'Deleted' for completed file_manager delete command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        state: "result",
        args: { command: "delete", path: "/old-file.jsx" },
        result: { success: true },
      }}
    />
  );

  expect(screen.getByText("Deleted /old-file.jsx")).toBeDefined();
});

test("shows 'Renamed' with both paths for completed file_manager rename", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        state: "result",
        args: {
          command: "rename",
          path: "/old.jsx",
          new_path: "/new.jsx",
        },
        result: { success: true },
      }}
    />
  );

  expect(screen.getByText("Renamed /old.jsx → /new.jsx")).toBeDefined();
});

test("shows 'Renaming' for in-progress file_manager rename", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        state: "call",
        args: {
          command: "rename",
          path: "/old.jsx",
          new_path: "/new.jsx",
        },
      }}
    />
  );

  expect(screen.getByText("Renaming /old.jsx")).toBeDefined();
});

test("falls back to tool name for unknown tools", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "unknown_tool",
        state: "result",
        args: {},
        result: "done",
      }}
    />
  );

  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("shows green dot for completed state", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/App.jsx" },
        result: "Success",
      }}
    />
  );

  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner for in-progress state", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("handles partial-call state gracefully", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "partial-call",
        args: {},
      }}
    />
  );

  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

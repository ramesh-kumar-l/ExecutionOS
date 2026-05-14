import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Tauri IPC — all commands must be explicitly mocked in tests
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockImplementation((cmd: string) => {
    throw new Error(`Tauri command not mocked in test: ${cmd}`);
  }),
}));

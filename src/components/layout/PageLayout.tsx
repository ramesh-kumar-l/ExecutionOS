import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <Sidebar />
      <main
        className={cn(
          "flex-1 overflow-hidden transition-all duration-200",
          sidebarCollapsed ? "ml-0" : "ml-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}

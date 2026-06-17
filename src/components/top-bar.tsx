import Image from "next/image";
import Link from "next/link";
import { LogIn, Search } from "lucide-react";

import type { WorkbenchArea } from "@/lib/project-workflow";
import type { ProjectSummary } from "@/lib/projects";

export function TopBar({
  project,
  mode,
  areas = [],
}: {
  readonly project?: ProjectSummary | null;
  readonly mode: "dashboard" | "project" | "auth";
  readonly areas?: readonly WorkbenchArea[];
}) {
  return (
    <header className="flex h-14 items-center border-b border-workbench-line bg-white px-4 shadow-hairline">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <Image
          src="/logo.png"
          width={30}
          height={30}
          alt="Conlang Workbench logo"
          className="rounded-md"
          priority
        />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">Conlang Workbench</h1>
          <p className="truncate text-xs text-workbench-muted">
            {project?.name ?? (mode === "auth" ? "Account access" : "No project open")}
          </p>
        </div>
      </Link>

      {project ? (
        <div className="ml-5 hidden min-w-0 items-center gap-2 rounded-sm bg-workbench-panel px-2 py-1 text-xs font-medium text-workbench-muted ring-1 ring-workbench-line sm:flex">
          <span className="h-2 w-2 rounded-full bg-workbench-accent" />
          <span className="truncate">{project.name}</span>
        </div>
      ) : null}

      {project && areas.length > 0 ? (
        <nav
          aria-label="Project areas"
          className="ml-6 hidden items-center gap-1 md:flex"
        >
          {areas.map((area) => {
            const Icon = area.icon;
            return (
              <Link
                key={area.slug}
                href={`/projects/${project.id}/${area.slug}`}
                className="flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-workbench-muted transition hover:bg-workbench-rail hover:text-workbench-ink"
              >
                <Icon aria-hidden="true" size={16} />
                {area.name}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Search"
          className="grid h-8 w-8 place-items-center rounded-md border border-workbench-line bg-white text-workbench-muted"
        >
          <Search aria-hidden="true" size={16} />
        </button>
        <Link
          href="/auth/sign-in"
          aria-label="Account"
          className="grid h-8 w-8 place-items-center rounded-md border border-workbench-line bg-white text-workbench-muted"
        >
          <LogIn aria-hidden="true" size={16} />
        </Link>
      </div>
    </header>
  );
}

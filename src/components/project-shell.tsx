import Link from "next/link";
import { AlertCircle, BookMarked } from "lucide-react";

import { TopBar } from "@/components/top-bar";
import { glossaryDrawerItems, workbenchAreas } from "@/lib/project-workflow";
import type { ProjectResult } from "@/lib/projects";

export function ProjectShell({
  result,
  selectedAreaSlug,
  selectedSectionName,
  sectionHref,
  children,
}: {
  readonly result: ProjectResult;
  readonly selectedAreaSlug: string;
  readonly selectedSectionName?: string;
  readonly sectionHref?: (item: string) => string;
  readonly children: React.ReactNode;
}) {
  const project = result.project;

  if (!project) {
    return (
      <main className="min-h-screen bg-[#f4f6f8] text-workbench-ink">
        <TopBar mode="project" />
        <section className="mx-auto max-w-2xl px-4 py-10">
          <div className="rounded-lg border border-workbench-line bg-white p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 text-workbench-amber"
                size={20}
              />
              <div>
                <h2 className="text-lg font-semibold">Project unavailable</h2>
                <p className="mt-1 text-sm leading-6 text-workbench-muted">
                  {result.message ?? "This project could not be opened."}
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex h-9 items-center rounded-md border border-workbench-line px-3 text-sm font-medium"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const selectedArea =
    workbenchAreas.find((area) => area.slug === selectedAreaSlug) ??
    workbenchAreas[0];

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-workbench-ink">
      <TopBar mode="project" project={project} areas={workbenchAreas} />

      <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-workbench-line bg-workbench-rail p-4 lg:border-b-0 lg:border-r">
          <nav aria-label="Project sections" className="grid gap-1">
            <p className="px-3 pb-1 text-xs font-semibold uppercase text-workbench-muted">
              {selectedArea.name}
            </p>
            {selectedArea.items.map((item) => {
              const activeItem = selectedSectionName ?? selectedArea.items[0];
              return (
                <Link
                  key={item}
                  href={
                    sectionHref?.(item) ??
                    `/projects/${project.id}/${selectedArea.slug}`
                  }
                  className="flex h-9 items-center rounded-md px-3 text-sm font-medium text-workbench-muted transition hover:bg-white hover:text-workbench-ink"
                  aria-current={activeItem === item ? "page" : undefined}
                >
                  {item}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="p-4 pr-14 sm:p-6 sm:pr-16">{children}</section>
      </div>

      <details className="group fixed bottom-4 right-3 z-10 sm:right-4">
        <summary
          aria-label="Open glossary"
          className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-md border border-workbench-line bg-white text-workbench-muted shadow-hairline transition hover:text-workbench-ink [&::-webkit-details-marker]:hidden"
        >
          <BookMarked aria-hidden="true" size={17} />
        </summary>
        <aside
          aria-label="Glossary drawer"
          className="absolute bottom-0 right-11 hidden max-h-[calc(100vh-5rem)] w-[min(22rem,calc(100vw-5rem))] overflow-auto rounded-lg border border-workbench-line bg-white shadow-lg group-open:block"
        >
          <div className="border-b border-workbench-line px-4 py-3">
            <p className="text-xs font-semibold uppercase text-workbench-muted">
              Glossary
            </p>
            <h2 className="mt-1 text-base font-semibold">Workbench terms</h2>
          </div>
          <div className="grid gap-2 p-4">
            {glossaryDrawerItems.map((item) => (
              <div
                key={item}
                className="rounded-md border border-workbench-line px-3 py-2 text-sm"
              >
                <span className="font-medium">{item}</span>
                <p className="mt-1 text-xs leading-5 text-workbench-muted">
                  Placeholder reference content for later glossary data.
                </p>
              </div>
            ))}
          </div>
        </aside>
      </details>
    </main>
  );
}

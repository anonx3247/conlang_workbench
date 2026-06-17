import Image from "next/image";
import { ChevronRight, PanelLeftClose, Search } from "lucide-react";

import { projectActions, workbenchAreas } from "@/lib/workbench-data";

export function AppShell() {
  return (
    <main className="min-h-screen bg-[#f4f6f8] text-workbench-ink">
      <header className="flex h-14 items-center border-b border-workbench-line bg-white px-4 shadow-hairline">
        <div className="flex min-w-0 items-center gap-3">
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
              No project open
            </p>
          </div>
        </div>

        <nav
          aria-label="Workbench areas"
          className="ml-8 hidden items-center gap-1 md:flex"
        >
          {workbenchAreas.map((area) => (
            <a
              key={area.name}
              href={`#${area.name.toLowerCase()}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-workbench-muted transition hover:bg-workbench-rail hover:text-workbench-ink"
            >
              {area.name}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="grid h-8 w-8 place-items-center rounded-md border border-workbench-line bg-white text-workbench-muted"
          >
            <Search aria-hidden="true" size={16} />
          </button>
          <button
            type="button"
            aria-label="Toggle sidebar"
            className="grid h-8 w-8 place-items-center rounded-md border border-workbench-line bg-white text-workbench-muted"
          >
            <PanelLeftClose aria-hidden="true" size={16} />
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-workbench-line bg-workbench-rail p-4 lg:border-b-0 lg:border-r">
          <section aria-labelledby="project-surface-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="project-surface-heading"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-workbench-muted"
              >
                Project
              </h2>
              <span className="rounded-sm bg-white px-2 py-1 text-[11px] font-medium text-workbench-muted ring-1 ring-workbench-line">
                Cloud ready
              </span>
            </div>

            <div className="rounded-lg border border-workbench-line bg-white p-3">
              <p className="text-sm font-semibold">Project dashboard</p>
              <p className="mt-1 text-sm leading-5 text-workbench-muted">
                Create or open a language workspace once Supabase-backed project
                state is introduced.
              </p>
              <div className="mt-3 grid gap-2">
                {projectActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      className="flex items-start gap-2 rounded-md border border-workbench-line px-3 py-2 text-left text-sm transition hover:border-workbench-accent hover:bg-[#f1faf8]"
                    >
                      <Icon aria-hidden="true" className="mt-0.5" size={16} />
                      <span>
                        <span className="block font-medium">
                          {action.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-4 text-workbench-muted">
                          {action.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </aside>

        <section className="p-4 sm:p-6" aria-labelledby="open-project-heading">
          <div className="mb-5 flex flex-col gap-3 border-b border-workbench-line pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="open-project-heading" className="text-xl font-semibold">
                Open project surface
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-workbench-muted">
                Scaffold view for the web workbench: compact navigation,
                project-first entry, and feature placeholders that can be wired
                to serverless data flows in later PRs.
              </p>
            </div>
            <div className="flex gap-2 text-xs font-medium">
              <span className="rounded-sm bg-[#fff7e6] px-2 py-1 text-workbench-amber ring-1 ring-[#f2d6a2]">
                Serverless
              </span>
              <span className="rounded-sm bg-[#f3edf7] px-2 py-1 text-workbench-plum ring-1 ring-[#ddc8e2]">
                Supabase planned
              </span>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {workbenchAreas.map((area) => {
              const Icon = area.icon;
              return (
                <article
                  id={area.name.toLowerCase()}
                  key={area.name}
                  className="rounded-lg border border-workbench-line bg-white"
                >
                  <div className="flex items-start gap-3 border-b border-workbench-line p-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#edf7f5] text-workbench-accent">
                      <Icon aria-hidden="true" size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold">{area.name}</h3>
                      <p className="mt-1 text-sm leading-5 text-workbench-muted">
                        {area.summary}
                      </p>
                    </div>
                    <span className="ml-auto hidden whitespace-nowrap rounded-sm bg-workbench-panel px-2 py-1 text-[11px] font-medium text-workbench-muted ring-1 ring-workbench-line sm:inline-flex">
                      {area.status}
                    </span>
                  </div>
                  <ul className="divide-y divide-workbench-line">
                    {area.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center justify-between px-4 py-3 text-sm"
                      >
                        <span>{item}</span>
                        <ChevronRight
                          aria-hidden="true"
                          size={15}
                          className="text-workbench-muted"
                        />
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

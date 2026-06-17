import Link from "next/link";
import {
  AlertCircle,
  FolderOpen,
  Info,
  LogIn,
  Settings,
  Trash2,
} from "lucide-react";

import { ProjectCreateForm } from "@/components/project-create-form";
import { TopBar } from "@/components/top-bar";
import {
  submitDeleteProjectAction,
  submitUpdateProjectAction,
} from "@/lib/project-actions";
import { projectLauncherActions, workbenchAreas } from "@/lib/project-workflow";
import type { ProjectListResult, ProjectSummary } from "@/lib/projects";

function StatusNotice({ result }: { readonly result: ProjectListResult }) {
  if (!result.message) {
    return null;
  }

  const Icon = result.status === "error" ? AlertCircle : Info;

  return (
    <div className="flex items-start gap-2 rounded-md border border-workbench-line bg-white px-3 py-2 text-sm text-workbench-muted">
      <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
      <p>{result.message}</p>
    </div>
  );
}

function ProjectEditDetails({
  project,
}: {
  readonly project: ProjectSummary;
}) {
  return (
    <details className="group">
      <summary
        aria-label={`Edit ${project.name}`}
        className="grid h-8 w-8 cursor-pointer list-none place-items-center rounded-md border border-workbench-line bg-white text-workbench-muted transition hover:text-workbench-ink [&::-webkit-details-marker]:hidden"
      >
        <Settings aria-hidden="true" size={15} />
      </summary>
      <div className="fixed inset-0 z-20 hidden place-items-center bg-black/20 px-4 py-6 group-open:grid">
        <div className="w-full max-w-md rounded-lg border border-workbench-line bg-white p-4 shadow-lg">
          <div className="mb-4 border-b border-workbench-line pb-3">
            <p className="text-xs font-semibold uppercase text-workbench-muted">
              Edit project
            </p>
            <h3 className="mt-1 text-base font-semibold">{project.name}</h3>
          </div>

          <form action={submitUpdateProjectAction} className="grid gap-3">
            <input type="hidden" name="projectId" value={project.id} />
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Name</span>
              <input
                name="name"
                defaultValue={project.name}
                required
                maxLength={80}
                className="h-9 rounded-md border border-workbench-line bg-white px-3 text-sm outline-none transition focus:border-workbench-accent"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Description</span>
              <textarea
                name="description"
                defaultValue={project.description ?? ""}
                rows={3}
                className="resize-none rounded-md border border-workbench-line bg-white px-3 py-2 text-sm outline-none transition focus:border-workbench-accent"
              />
            </label>
            <button
              type="submit"
              className="h-9 rounded-md bg-workbench-accent px-3 text-sm font-semibold text-white"
            >
              Save details
            </button>
          </form>

          <form action={submitDeleteProjectAction} className="mt-2">
            <input type="hidden" name="projectId" value={project.id} />
            <button
              type="submit"
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-workbench-line bg-white px-3 text-sm font-medium text-workbench-muted"
            >
              <Trash2 aria-hidden="true" size={15} />
              Delete project
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}

export function Dashboard({ result }: { readonly result: ProjectListResult }) {
  const canCreate = result.status === "ready";

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-workbench-ink">
      <TopBar mode="dashboard" />

      <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-workbench-line bg-workbench-rail p-4 lg:border-b-0 lg:border-r">
          <section aria-labelledby="launcher-heading" className="grid gap-3">
            <div className="flex items-center justify-between">
              <h2
                id="launcher-heading"
                className="text-xs font-semibold uppercase text-workbench-muted"
              >
                Project
              </h2>
              <span className="rounded-sm bg-white px-2 py-1 text-[11px] font-medium text-workbench-muted ring-1 ring-workbench-line">
                {result.status === "demo" ? "Demo mode" : "Cloud"}
              </span>
            </div>

            <div className="rounded-lg border border-workbench-line bg-white p-3">
              <div className="grid gap-2">
                {projectLauncherActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.label}
                      className="flex items-start gap-2 rounded-md border border-workbench-line px-3 py-2 text-left text-sm"
                    >
                      <Icon aria-hidden="true" className="mt-0.5" size={16} />
                      <span>
                        <span className="block font-medium">{action.label}</span>
                        <span className="mt-0.5 block text-xs leading-4 text-workbench-muted">
                          {action.description}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {canCreate ? (
              <div className="rounded-lg border border-workbench-line bg-white p-3">
                <ProjectCreateForm />
              </div>
            ) : (
              <div className="rounded-lg border border-workbench-line bg-white p-3 text-sm text-workbench-muted">
                <p>
                  Project creation is available after Supabase is configured and
                  an account session exists.
                </p>
                <Link
                  href="/auth/sign-in"
                  className="mt-3 inline-flex h-8 items-center gap-2 rounded-md border border-workbench-line px-3 text-sm font-medium text-workbench-ink"
                >
                  <LogIn aria-hidden="true" size={15} />
                  Sign in
                </Link>
              </div>
            )}
          </section>
        </aside>

        <section className="p-4 sm:p-6" aria-labelledby="dashboard-heading">
          <div className="mb-5 flex flex-col gap-3 border-b border-workbench-line pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="dashboard-heading" className="text-xl font-semibold">
                Project dashboard
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-workbench-muted">
                Open a language workspace, or use the read-only demo when local
                Supabase credentials are absent.
              </p>
            </div>
            <div className="flex gap-2 text-xs font-medium">
              <span className="rounded-sm bg-[#eef7f5] px-2 py-1 text-workbench-accent ring-1 ring-[#c7dfdc]">
                URL routed
              </span>
              <span className="rounded-sm bg-[#fff7e6] px-2 py-1 text-workbench-amber ring-1 ring-[#f2d6a2]">
                Auth aware
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <StatusNotice result={result} />

            <div className="rounded-lg border border-workbench-line bg-white">
              <div className="flex items-center justify-between border-b border-workbench-line px-4 py-3">
                <h3 className="text-sm font-semibold">Projects</h3>
                <span className="text-xs text-workbench-muted">
                  {result.projects.length} available
                </span>
              </div>

              {result.projects.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-workbench-muted">
                  No projects yet.
                </div>
              ) : (
                <ul className="divide-y divide-workbench-line">
                  {result.projects.map((project) => (
                    <li
                      key={project.id}
                      className="flex items-start gap-2 px-4 py-3 transition hover:bg-workbench-panel"
                    >
                      <Link
                        href={`/projects/${project.id}/phonology`}
                        className="flex min-w-0 flex-1 items-start gap-3"
                      >
                        <FolderOpen
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-workbench-accent"
                          size={18}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {project.name}
                          </span>
                          <span className="mt-1 block truncate text-xs text-workbench-muted">
                            {project.description ?? "No description"}
                          </span>
                        </span>
                      </Link>
                      {result.status === "ready" ? (
                        <ProjectEditDetails project={project} />
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
              {workbenchAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <article
                    key={area.slug}
                    className="rounded-lg border border-workbench-line bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#edf7f5] text-workbench-accent">
                        <Icon aria-hidden="true" size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">{area.name}</h3>
                        <p className="mt-1 text-sm leading-5 text-workbench-muted">
                          {area.summary}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

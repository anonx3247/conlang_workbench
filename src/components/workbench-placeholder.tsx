import { workbenchAreas } from "@/lib/project-workflow";

export function WorkbenchPlaceholder({
  section,
}: {
  readonly section: string;
}) {
  const area = workbenchAreas.find((item) => item.slug === section);
  const title = area?.name ?? "Workbench";

  return (
    <div className="grid gap-4">
      <div className="border-b border-workbench-line pb-4">
        <p className="text-xs font-semibold uppercase text-workbench-muted">
          Project workbench
        </p>
        <h2 className="mt-1 text-xl font-semibold">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-workbench-muted">
          {area?.summary ??
            "This project route is ready for feature-specific implementation."}
        </p>
      </div>

      <div className="rounded-lg border border-workbench-line bg-white">
        <div className="border-b border-workbench-line px-4 py-3">
          <h3 className="text-sm font-semibold">Placeholder surface</h3>
        </div>
        <div className="grid gap-2 p-4">
          {(area?.items ?? ["Feature workspace"]).map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-md border border-workbench-line px-3 py-2 text-sm"
            >
              <span>{item}</span>
              <span className="rounded-sm bg-workbench-panel px-2 py-1 text-[11px] font-medium text-workbench-muted">
                Coming later
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

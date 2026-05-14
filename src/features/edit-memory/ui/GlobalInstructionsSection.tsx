import { MemoryFileRow } from './MemoryFileRow';
import { NewMemoryForm } from './NewMemoryForm';
import { CollapsibleSection } from './CollapsibleSection';
import type { MemoryFile } from '@/entities/memory';

type Props = {
  claudeMd?: MemoryFile;
  rulesBySubdir: Map<string, MemoryFile[]>;
};

export function GlobalInstructionsSection({ claudeMd, rulesBySubdir }: Props) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
        Global instructions
      </h2>
      {claudeMd && (
        <ul className="mb-4">
          <MemoryFileRow file={claudeMd} canDelete={false} />
        </ul>
      )}
      {[...rulesBySubdir.entries()].map(([subdir, files]) => (
        <CollapsibleSection
          key={subdir}
          sectionKey={`rules:${subdir}`}
          title={`rules/${subdir}/ (${files.length})`}
          trailing={
            <NewMemoryForm
              scopeKey={`global-rule:${subdir}`}
              scope={{ kind: 'global-rule', subdir }}
              label={`rule in ${subdir}`}
            />
          }
        >
          <ul className="flex flex-col gap-2">
            {files.map((f) => (
              <MemoryFileRow key={f.path} file={f} />
            ))}
          </ul>
        </CollapsibleSection>
      ))}
    </section>
  );
}

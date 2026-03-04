import { Badge } from "@/components/ui/badge";

type Stage = {
  id: string;
  name: string;
  order: number;
  count: number;
};

type Props = {
  stages: Stage[];
};

export function StagesHeader({ stages }: Props) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-2">
      {stages.map((stage, idx) => (
        <div key={stage.id} className="flex items-center gap-4">
          <div className="flex min-w-30 flex-col items-center">
            <div className="relative">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                <span className="text-primary text-xl font-bold">
                  {stage.count}
                </span>
              </div>
            </div>
            <p className="mt-2 text-center text-xs font-medium tracking-wide uppercase">
              {stage.name}
            </p>
          </div>

          {idx < stages.length - 1 && <div className="bg-border h-0.5 w-8" />}
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StageForm } from "./comp.stage-form";
import { DeleteButton } from "./comp.delete-button";
import { reorderStages } from "../_actions/action.stage";
import { toast } from "sonner";

type Stage = {
  id: string;
  name: string;
  order: number;
};

function SortableRow({ item }: { item: Stage }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[3rem_5rem_1fr_6rem_6rem] border-b transition-colors hover:bg-muted/50 items-center"
    >
      <div className="p-4">
        <button
          {...attributes}
          {...listeners}
          suppressHydrationWarning  // ← fix hydration error dnd-kit
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="size-4" />
        </button>
      </div>
      <div className="p-4">
        <Badge variant="outline">{item.order}</Badge>
      </div>
      <div className="p-4 font-medium">{item.name}</div>
      <div className="p-4 flex justify-center">
        <StageForm stage={{ id: item.id, name: item.name, order: item.order }} />
      </div>
      <div className="p-4 flex justify-center">
        <DeleteButton id={item.id} name={item.name} />
      </div>
    </div>
  );
}

export function StageTable({ data }: { data: Stage[] }) {
  const [stages, setStages] = useState(data);

  // ← sync state ketika data dari server berubah (setelah revalidatePath)
  useEffect(() => {
    setStages(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stages.findIndex((s) => s.id === active.id);
    const newIndex = stages.findIndex((s) => s.id === over.id);

    const newStages = arrayMove(stages, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i + 1,
    }));

    setStages(newStages);

    const result = await reorderStages(newStages.map((s) => s.id));
    if (result?.error) {
      setStages(data);
      toast.error("Gagal menyimpan order", { position: "top-right" });
    }
  }

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada stage. Tambahkan stage rekrutmen pertama.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="grid grid-cols-[3rem_5rem_1fr_6rem_6rem] bg-muted/50 border-b">
        <div className="p-4"></div>
        <div className="p-4 text-sm font-medium text-muted-foreground">No</div>
        <div className="p-4 text-sm font-medium text-muted-foreground">Nama Stage</div>
        <div className="p-4 text-sm font-medium text-muted-foreground text-center">Edit</div>
        <div className="p-4 text-sm font-medium text-muted-foreground text-center">Hapus</div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stages.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {stages.map((item) => (
            <SortableRow key={item.id} item={item} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
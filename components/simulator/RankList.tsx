"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { TeamMark } from "@/components/team/TeamMark";
import type { Team } from "@/lib/cfp/types";

function Row({
  id,
  rank,
  team,
  onMove,
}: {
  id: string;
  rank: number;
  team: Team | undefined;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  const reduceMotion = useReducedMotion();
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform) };
  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
      className="flex items-center gap-2 border-b border-line py-1"
    >
      <button type="button" className="inline-flex h-11 w-8 cursor-grab items-center justify-center text-muted" aria-label={`Drag ${team?.school ?? id}`} {...attributes} {...listeners}>
        <GripVertical size={16} />
      </button>
      <span className="min-w-0 flex-1">
        <TeamMark team={team} name={team?.school ?? id} seed={rank} size="sm" />
      </span>
      <button type="button" className="inline-flex h-11 w-11 items-center justify-center" aria-label={`Move ${team?.school} up`} onClick={() => onMove(id, -1)}>
        <ChevronUp size={16} />
      </button>
      <button type="button" className="inline-flex h-11 w-11 items-center justify-center" aria-label={`Move ${team?.school} down`} onClick={() => onMove(id, 1)}>
        <ChevronDown size={16} />
      </button>
    </motion.li>
  );
}

export function RankList({
  order,
  teams,
  manual,
  onReorder,
  onReset,
}: {
  order: string[];
  teams: Map<string, Team>;
  manual: boolean;
  onReorder: (order: string[]) => void;
  onReset: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? order : order.slice(0, 25);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const over = event.over?.id;
    if (!over || over === event.active.id) return;
    const oldIndex = order.indexOf(String(event.active.id));
    const newIndex = order.indexOf(String(over));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(order, oldIndex, newIndex));
  };

  const onMove = (id: string, direction: -1 | 1) => {
    const index = order.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return;
    onReorder(arrayMove(order, index, target));
  };

  return (
    <section>
      <div className="mb-2 flex items-end justify-between gap-3">
        <h2 className="text-3xl">Rankings</h2>
        {manual ? (
          <button type="button" className="min-h-11 text-sm underline" onClick={onReset}>
            Reset to formula
          </button>
        ) : (
          <p className="text-sm text-muted">Drag a team to play committee.</p>
        )}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={visible} strategy={verticalListSortingStrategy}>
          <ol>
            {visible.map((id, index) => (
              <Row key={id} id={id} rank={order.indexOf(id) + 1 || index + 1} team={teams.get(id)} onMove={onMove} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      {order.length > 25 ? (
        <button type="button" className="mt-2 min-h-11 text-sm underline" onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Show top 25" : `Show all ${order.length} teams`}
        </button>
      ) : null}
    </section>
  );
}

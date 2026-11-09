"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TeamMark } from "@/components/team/TeamMark";
import type { Team } from "@/lib/cfp/types";

function sameOrder(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function Row({
  id,
  rank,
  team,
  instant,
  onMove,
}: {
  id: string;
  rank: number;
  team: Team | undefined;
  instant: boolean;
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
      transition={{ duration: reduceMotion || instant ? 0 : 0.18 }}
      className="flex items-center gap-2 border-b border-line py-1"
    >
      <button type="button" className="inline-flex h-11 w-11 cursor-grab items-center justify-center text-muted" aria-label={`Drag ${team?.school ?? id}`} {...attributes} {...listeners}>
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
  const [extra, setExtra] = useState(0);
  const [preview, setPreview] = useState<string[] | null>(null);
  const [canReplay, setCanReplay] = useState(false);
  const seen = useRef(order);
  const lastChange = useRef<{ from: string[]; to: string[] } | null>(null);
  const shown = preview ?? order;
  const visible = showAll ? shown : shown.slice(0, 25 + extra);

  useEffect(() => {
    if (sameOrder(seen.current, order)) return;
    lastChange.current = { from: seen.current, to: order };
    seen.current = order;
    setCanReplay(true);
  }, [order]);

  const replay = () => {
    const change = lastChange.current;
    if (!change || sameOrder(change.from, change.to)) return;
    setPreview(change.from);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPreview(null));
    });
  };
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
    if (!showAll && newIndex >= 25 + extra) setExtra(newIndex - 24);
  };

  const onMove = (id: string, direction: -1 | 1) => {
    const index = order.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return;
    onReorder(arrayMove(order, index, target));
    if (!showAll && target >= 25 + extra) setExtra(target - 24);
  };

  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-end justify-between gap-3">
        <h2 className="text-3xl">Rankings</h2>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          <button type="button" className="min-h-11 text-sm underline disabled:text-muted disabled:no-underline" onClick={replay} disabled={!canReplay}>
            Simulate
          </button>
          {manual ? (
            <button type="button" className="min-h-11 text-sm underline" onClick={onReset}>
              Reset to formula
            </button>
          ) : null}
        </div>
      </div>
      <p className="mb-2 text-sm text-muted">{manual ? "Ordered by you." : "Drag a team to play committee."}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={visible} strategy={verticalListSortingStrategy}>
          <ol className={preview ? "pointer-events-none" : undefined}>
            {visible.map((id, index) => (
              <Row key={id} id={id} rank={shown.indexOf(id) + 1 || index + 1} team={teams.get(id)} instant={preview !== null} onMove={onMove} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      {order.length > 25 ? (
        <button
          type="button"
          className="mt-2 min-h-11 text-sm underline"
          onClick={() =>
            setShowAll((value) => {
              if (value) setExtra(0);
              return !value;
            })
          }
        >
          {showAll ? "Show top 25" : `Show all ${order.length} teams`}
        </button>
      ) : null}
    </section>
  );
}

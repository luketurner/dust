'use client';

import { Task } from "@prisma/client";
import TaskList from "./TaskList";
import { useCallback, useMemo, useState } from "react";
import { Checkbox } from "react-aria-components";

export interface TaskManagerProps {
  tasks: Task[]
}

interface Filters {
  active: boolean;
  archived: boolean;
}

export default function TaskManager({ tasks: initialTasks }: TaskManagerProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filters, setFilters] = useState<Filters>({ active: true, archived: false });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.active && !task.archived) { return true; }
      if (filters.archived && task.archived) { return true; }
      return false;
    })
  }, [tasks, filters])
  return (
    <div>
      <TaskStatusFilters filters={filters} onChange={(v) => setFilters(v)} />
      <TaskList tasks={filteredTasks} />
    </div>
  )
}

function TaskStatusFilters({ onChange, filters }: { 
  onChange(v: Filters): void
  filters: Filters
}) {
  const toggleActive = useCallback(() => onChange({ ...filters, active: !filters.active }), [onChange, filters])
  const toggleArchived = useCallback(() => onChange({ ...filters, archived: !filters.archived }), [onChange, filters])
  return (
    <>
      <Checkbox isSelected={filters.active} onChange={toggleActive}>{filters.active ? 'hide' : 'show'} active</Checkbox> / 
      <Checkbox isSelected={filters.archived} onChange={toggleArchived}>{filters.archived ? 'hide' : 'show'} archived</Checkbox>
    </>
  )
}
'use client';

import { Task as TaskType } from "@prisma/client";
import { useCallback, useMemo, useState } from "react";
import { Checkbox } from "react-aria-components";
import TaskEntry from "./TaskEntry";
import Task from "./Task";
import { addTasksFromText } from "@/actions/task";

export interface TaskManagerProps {
  tasks: TaskType[]
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
  }, [tasks, filters]);

  const taskEntrySubmit = useCallback(async (v: string) => {
    const newTasks = await addTasksFromText(v);
    setTasks([...tasks, ...newTasks].sort((a, b) => a.displayOrder - b.displayOrder));
  }, [tasks]);

  return (
    <div>
      <TaskStatusFilters filters={filters} onChange={(v) => setFilters(v)} />
      <div className="my-2 ml-2 flex flex-col flex-nowrap w-full">
        {filteredTasks.map(task => 
          <Task task={task} key={task.id} onChange={(newTask) => {setTasks([...tasks])}} onDelete={() => setTasks(tasks.filter((t) => t.id !== task.id))} />
        )}
      </div>
      <TaskEntry onSubmit={taskEntrySubmit} />
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
    <div className="flex flex-row flex-wrap w-100 mb-8">
      <div className="flex flex-col flex-wrap">
        <p className="font-bold">Status filters</p>
        <Checkbox className="ml-2 m-1 hover:underline cursor-pointer" isSelected={filters.active} onChange={toggleActive}>{filters.active ? 'hide' : 'show'} active</Checkbox>
        <Checkbox className="ml-2 m-1 hover:underline cursor-pointer" isSelected={filters.archived} onChange={toggleArchived}>{filters.archived ? 'hide' : 'show'} archived</Checkbox>
      </div>
    </div>
  )
}
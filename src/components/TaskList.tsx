'use client';

import { Task as TaskType } from "@prisma/client";
import Task from "./Task";

export interface TaskListProps {
  tasks: TaskType[];
}

export default function TaskList({ tasks }: TaskListProps) {
  return (
    <div>
      {tasks.map(task => 
        <Task task={task} key={task.id} />
      )}
    </div>
  )
}


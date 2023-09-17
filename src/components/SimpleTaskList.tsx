'use client';

import { Task } from "@prisma/client";
import SimpleTask from "./SimpleTask";

export interface TaskListProps {
  tasks: Task[];
}

export default function SimpleTaskList({ tasks }: TaskListProps) {
  return (
    <div>
      {tasks.map(task => 
        <SimpleTask task={task} key={task.id} />
      )}
    </div>
  )
}


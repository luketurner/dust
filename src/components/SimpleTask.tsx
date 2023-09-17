'use client';

import { updateTask } from "@/actions/task";
import { Task as TaskType } from "@prisma/client";
import { ChangeEvent, useCallback, useEffect, useState } from "react";


export interface TaskProps {
  task: TaskType
}

export default function SimpleTask({ task }: TaskProps) {

  return (
    <div className="flex flex-row flex-wrap">
      {task.name}
    </div>
  )
}
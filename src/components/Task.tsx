'use client';

import { updateTask } from "@/actions/task";
import { Task as TaskType } from "@prisma/client";
import { ChangeEvent, useCallback, useEffect, useState } from "react";


export interface TaskProps {
  task: TaskType
}

export default function Task({ task }: TaskProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(task.name);

  const editName = useCallback(() => {
    setEditing(true);
  }, [])

  const changeName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setName(v);
  }, [])

  const submitName = useCallback(() => {
    setEditing(false);
    updateTask(task, {
      name: name
    });
  }, [name])

  return (
    <div className="flex flex-row flex-wrap">
      {editing ? (
        <input type="text" value={name} onChange={changeName} onBlur={submitName}></input>
      ) : (
        <>
          <div>{name}</div>
          <button onClick={editName}>edit</button>
        </>
      )}
    </div>
  )
}
'use client';

import { updateTask, deleteTask as deleteTaskAction } from "@/actions/task";
import { Task as TaskType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useState } from "react";


export interface TaskProps {
  task: TaskType
}

export default function Task({ task }: TaskProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const router = useRouter();

  const editName = useCallback(() => {
    setEditing(true);
  }, []);

  const changeName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setName(v);
  }, []);

  const submitName = useCallback(() => {
    setEditing(false);
    updateTask(task.id, {
      name: name
    });
    router.refresh();
  }, [name, router]);

  const archiveTask = useCallback(() => {
    updateTask(task.id, {
      archived: true
    })
    router.refresh();
  }, [router]);

  const deleteTask = useCallback(() => {
    deleteTaskAction(task.id);
    router.refresh();
  }, [router]);

  return (
    <div className="flex flex-row flex-wrap">
      {editing ? (
        <input type="text" value={name} onChange={changeName} onBlur={submitName}></input>
      ) : (
        <>
          <div>{name}</div> {task.archived && '(archived)'} / 
          <button onClick={editName}>edit</button> / 
          <button onClick={archiveTask}>archive</button> / 
          <button onClick={deleteTask}>delete</button>
        </>
      )}
    </div>
  )
}
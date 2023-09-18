'use client';

import { updateTask, deleteTask as deleteTaskAction } from "@/actions/task";
import { Task as TaskType } from "@prisma/client";
import { ChangeEvent, useCallback, useState } from "react";


export interface TaskProps {
  task: TaskType
  onChange?(task: TaskType): void
  onDelete?(): void
}

export default function Task({ task, onChange = () => {}, onDelete = () => {} }: TaskProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(task.name);

  const editName = useCallback(() => {
    setEditing(true);
  }, []);

  const changeName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setName(v);
  }, []);

  const submitName = useCallback(async () => {
    setEditing(false);
    await updateTask(task.id, {
      name: name
    });
    task.name = name;
    onChange(task);
  }, [name, task, onChange]);

  const archiveTask = useCallback(() => {
    updateTask(task.id, {
      archived: true
    });
    task.archived = true;
    onChange(task);
  }, [task, onChange]);

  const unarchiveTask = useCallback(() => {
    updateTask(task.id, {
      archived: false
    });
    task.archived = false;
    onChange(task);
  }, [task, onChange]);

  const deleteTask = useCallback(() => {
    deleteTaskAction(task.id);
    onDelete()
  }, [task, onDelete]);

  return (
    <div className="flex flex-row flex-wrap w-full my-1">
      {editing ? (
        <>
          <input className="flex-grow mx-2" type="text" value={name} onChange={changeName} onBlur={submitName} autoFocus={true}></input>
          <button className="px-2 hover:bg-slate-200 rounded" onClick={submitName}>save name</button>
        </>
      ) : (
        <>
          <div className="flex-grow mx-2">{name}</div> {task.archived && '(archived)'}
          <button className="px-2 hover:bg-slate-200 rounded" onClick={editName}>edit name</button>
        </>
      )}
      {task.archived ? (
        <button className="px-2 hover:bg-slate-200 rounded" onClick={unarchiveTask}>restore</button>
      ) : (
        <button className="px-2 hover:bg-slate-200 rounded" onClick={archiveTask}>archive</button>
      )}
      <button className="px-2 hover:bg-red-300 rounded" onClick={deleteTask}>delete</button>
    </div>
  )
}
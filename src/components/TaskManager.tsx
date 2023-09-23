'use client';

import { Tag as TagType, Task as TaskType } from "@prisma/client";
import { Key, useCallback, useMemo, useState } from "react";
import { Button, Checkbox, GridList, Item, TagGroup, TagList } from "react-aria-components";
import TaskEntry from "./TaskEntry";
import Task from "./Task";
import { addTasksFromText, removeTags } from "@/actions/task";
import Tag from "./Tag";

type TaskWithTags = TaskType & { tags: TagType[] };

export interface TaskManagerProps {
  tasks: TaskWithTags[]
  tags: TagType[]
}

interface Filters {
  active: boolean;
  archived: boolean;
  tags: TagType[];
}

export default function TaskManager({ tasks: initialTasks, tags: initialTags }: TaskManagerProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [allTags, setAllTags] = useState(initialTags);
  const [filters, setFilters] = useState<Filters>({ active: true, archived: false, tags: [] });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.active && !task.archived) { return true; }
      if (filters.archived && task.archived) { return true; }
      return false;
    })
  }, [tasks, filters]);

  const taskEntrySubmit = useCallback(async (v: string) => {
    const newTasks = await addTasksFromText(v);
    // TODO -- needs to update tags as well
    setTasks([...tasks, ...newTasks].sort((a, b) => a.displayOrder - b.displayOrder));
  }, [tasks]);

  const handleRemoveTags = useCallback(async (taskId: string, tagIds: Set<Key>) => {
    const tagIdList = Array.from(tagIds) as string[];
    const { deletedTagIds } = await removeTags(taskId, tagIdList);

    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, tags: task.tags.filter(tag => !tagIdList.includes(tag.id)) };
      }
      return task;
    }));

    if (deletedTagIds.length > 0) {
      setAllTags(allTags.filter(tag => !deletedTagIds.includes(tag.id)));
    }
  }, []);

  return (
    <div>
      <div className="flex flex-row flex-wrap">
        <TaskStatusFilters filters={filters} onChange={(v) => setFilters(v)} />
        <TaskTagFilters onChange={(v) => setFilters({ ...filters,tags: v })} tags={allTags} selectedTags={filters.tags} />
      </div>
      <GridList className="my-2 ml-2 flex flex-col flex-nowrap w-full" selectionMode="multiple" items={filteredTasks}>
        {(task) => (
          <Item id={task.id} textValue={task.name}>
            <div className="w-full">
              <div className="w-full flex flex-row flex-nowrap">
                <Task task={task} key={task.id} onChange={(newTask) => {setTasks([...tasks])}} onDelete={() => setTasks(tasks.filter((t) => t.id !== task.id))} />
              </div>
              <div className="w-full flex flex-row flex-wrap">
                <TagGroup onRemove={(tagIds) => handleRemoveTags(task.id, tagIds)}>
                  <TagList items={task.tags}>
                    {(tag) => (
                      <Tag textValue={tag.name}>
                        {tag.name}
                      </Tag>
                    )}
                  </TagList>
                </TagGroup>
              </div>
            </div>
          </Item>
        )}
      </GridList>
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
    <div className="flex flex-row flex-wrap w-100 mb-8 mx-2">
      <div className="flex flex-col flex-wrap">
        <p className="font-bold">Status filters</p>
        <Checkbox className="ml-2 m-1 hover:underline cursor-pointer" isSelected={filters.active} onChange={toggleActive}>
          {filters.active ? 'hide' : 'show'} active
        </Checkbox>
        <Checkbox className="ml-2 m-1 hover:underline cursor-pointer" isSelected={filters.archived} onChange={toggleArchived}>
          {filters.archived ? 'hide' : 'show'} archived
        </Checkbox>
      </div>
    </div>
  )
}

function TaskTagFilters({ onChange, tags, selectedTags }: { 
  onChange(v: TagType[]): void
  selectedTags: TagType[]
  tags: TagType[]
}) {
  // const allTags: { [key: string]: Tag } = {};
  // for (const task of tasks) {
  //   for (const tag of task.tags ?? []) {
  //     allTags[tag.id] = tag;
  //   }
  // }
  const selectedTagIds = new Set(selectedTags.map(t => t.id));
  const toggleTag = useCallback((id: string) => {
    if (selectedTagIds.has(id)) {
      return onChange(selectedTags.filter((tag) => tag.id !== id));
    } else {
      const tag = tags.find(tag => tag.id === id);
      if (!tag) return;
      return onChange([...selectedTags, tag]);
    }
  }, [onChange, selectedTags, tags]);

  return (
    <div className="flex flex-row flex-wrap w-100 mb-8 mx-2">
      <div className="flex flex-col flex-wrap">
        <p className="font-bold">Tag filters</p>
        {tags.map(tag => (
          <Checkbox key={tag.id} className="ml-2 m-1 hover:underline cursor-pointer" isSelected={selectedTagIds.has(tag.id)} onChange={() => toggleTag(tag.id)}>
            {selectedTagIds.has(tag.id) ? '[x]' : '[ ]'} {tag.name}
          </Checkbox>
        ))}
      </div>
    </div>
  )
}
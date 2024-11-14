import { TaskWithTags } from "@/models/task";
import { ActionMenu, Cell, Checkbox, Column, Item, Row, TableBody, TableHeader, TableView, View } from "@adobe/react-spectrum";
import { DateTime } from "luxon";
import ImportantIcon from "./icons/ImportantIcon";
import SomedayIcon from "./icons/SomedayIcon";
import UrgentIcon from "./icons/UrgentIcon";
import { Key, useCallback } from "react";

export interface TaskTableProps {
  tasks: TaskWithTags[];
  onTaskAction: (taskId: string, key: Key) => void;
}

export default function TaskTable({ tasks, onTaskAction }: TaskTableProps) {
  const handleCheckboxChange = useCallback((taskId: string, value: boolean) => onTaskAction(taskId, value ? 'complete' : 'uncomplete'), [onTaskAction])
  return (
    <TableView aria-label="List of tasks">
      <TableHeader>
        <Column>Name</Column>
        <Column defaultWidth={80} textValue="Important/Urgent Flags">
          <ImportantIcon />
          <UrgentIcon />
          <SomedayIcon />
        </Column>
        <Column defaultWidth={125}>Tags</Column>
        <Column defaultWidth={125}>Created</Column>
        <Column defaultWidth={32} align="end"> </Column>
      </TableHeader>
      <TableBody items={tasks}>
        {(task) => (
          <Row key={task.id} textValue={task.name}>
            <Cell>
              <TaskCheckbox task={task} onChange={handleCheckboxChange} />
            </Cell>
            <Cell>
              {task.important ? <ImportantIcon /> : undefined}
              {task.urgent ? <UrgentIcon /> : undefined}
              {task.someday ? <SomedayIcon /> : undefined}
            </Cell>
            <Cell>
              {task.tags.map(tag => (
                <View elementType="span" marginEnd="size-50" key={tag.id}>#{tag.name}</View>
              ))}
            </Cell>
            <Cell>
              <span title={DateTime.fromJSDate(task.createdAt).toISO()!}>
                {DateTime.fromJSDate(task.createdAt).toRelative({ style: 'narrow' })}
              </span>
            </Cell>
            <Cell>
              <TaskMenu task={task} onAction={onTaskAction} />
            </Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}

interface TaskMenuProps {
  task: TaskWithTags;
  onAction: (taskId: string, key: Key) => void;
}

function TaskMenu({ task, onAction }: TaskMenuProps) {
  const handleTaskMenuAction = useCallback((key: Key) => onAction(task.id, key), [task.id, onAction]);
  return (
    <ActionMenu isQuiet onAction={handleTaskMenuAction}>
      <Item key="edit">Edit...</Item>
      {task.archived ? <Item key="unarchive">Restore</Item> : <Item key="archive">Archive</Item>}                  
      <Item key="delete">Delete</Item>
    </ActionMenu>
  );
}

interface TaskCheckboxProps {
  task: TaskWithTags;
  onChange: (taskId: string, value: boolean) => void;
}

function TaskCheckbox({ task, onChange }: TaskCheckboxProps) {
  const handleChange = useCallback((value: boolean) => onChange(task.id, value), [task.id, onChange]);
  return (
    <Checkbox isSelected={task.completed} onChange={handleChange}>
      {task.name}
    </Checkbox>
  );
}


'use client';

import { Tag, Tag as TagType, Task, Task as TaskType } from "@prisma/client";
import { Key, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { EffectErrorAction, ServerErrorAction, useClientServerReducer } from "@/hooks/clientServerReducer";
import { ActionButton, ActionMenu, Button, Cell, Checkbox, CheckboxGroup, Column, Content, Flex, Heading, IllustratedMessage, Item, ListView, Row, Selection, TableBody, TableHeader, TableView, Text, View } from "@adobe/react-spectrum";
import EditTagDialog from "@/components/EditTagDialog";
import { createTag, deleteTag, updateTag } from "@/actions/tag";
import { ToastQueue } from "@react-spectrum/toast";
import SidebarLayout from "@/components/SidebarLayout";
import EditTaskDialog from "@/components/EditTaskDialog";
import { createTask, deleteTask, updateTask } from "@/actions/task";
import Add from '@spectrum-icons/workflow/Add';
import NotFound from '@spectrum-icons/illustrations/NotFound';
import { DateTime } from "luxon";
import UrgentIcon from "@/components/UrgentIcon";
import ImportantIcon from "@/components/ImportantIcon";
import SomedayIcon from "@/components/SomedayIcon";

type TaskWithTags = TaskType & { tags: TagType[] };

export interface TaskManagerProps {
  tasks: TaskWithTags[]
  tags: TagType[]
}

interface ManagePageClientState {
  tasks: TaskWithTags[]
  tags: TagType[]
  selectedTags: string[]
  dialog?: {
    type: 'add-tag' | 'edit-tag' | 'add-task' | 'edit-task'
    tagId?: string
    taskId?: string
  }
  showActive: boolean;
  showArchived: boolean;
  showNonUrgent: boolean;
  showNonImportant: boolean;
  showSomeday: boolean;
}

interface SelectTagsAction { type: 'select-tags'; tags: Set<Key> | 'all'; }
interface OpenAddTagAction { type: 'open-add-tag'; }
interface OpenEditTagAction { type: 'open-edit-tag'; tagId: string; }
interface AddTagAction { type: 'add-tag'; data: Partial<Tag>; }
interface AddTagFinishedAction { type: 'add-tag-finished'; tag: Tag; }
interface EditTagAction { type: 'edit-tag'; tagId: string, data: Partial<Tag>; }
interface DeleteTagAction { type: 'delete-tag'; tagId: string; }
interface CloseDialogAction { type: 'close-dialog'; }
interface ChangeDisplayFiltersAction { type: 'change-display-filters'; data: string[]; }
interface ChangeSignficanceFiltersAction { type: 'change-significance-filters'; data: string[]; }

interface OpenAddTaskAction { type: 'open-add-task'; }
interface OpenEditTaskAction { type: 'open-edit-task'; taskId: string; }
interface AddTaskAction { type: 'add-task'; data: Partial<Task>; }
interface AddTaskFinishedAction { type: 'add-task-finished'; task: TaskWithTags; }
interface EditTaskAction { type: 'edit-task'; taskId: string, data: Partial<Task> & { tags?: string[] }; }
interface DeleteTaskAction { type: 'delete-task'; taskId: string; }
interface ArchiveTaskAction { type: 'archive-task'; taskId: string; }
interface UnarchiveTaskAction { type: 'unarchive-task'; taskId: string; }


type ManagePageClientAction = EffectErrorAction | ChangeSignficanceFiltersAction | ServerErrorAction | SelectTagsAction | OpenAddTagAction | OpenEditTagAction | AddTagAction | EditTagAction | DeleteTagAction | AddTagFinishedAction | CloseDialogAction | ChangeDisplayFiltersAction | OpenAddTaskAction | OpenEditTaskAction | AddTaskAction | AddTaskFinishedAction | EditTaskAction | DeleteTaskAction | ArchiveTaskAction | UnarchiveTaskAction;

function stateReducer(state: ManagePageClientState, action: ManagePageClientAction) {
  switch (action.type) {
    case 'select-tags':
      state.selectedTags = action.tags === 'all' ? state.tags.map(({ id }) => id) : Array.from(action.tags as Set<string>)
      break;
    case 'open-add-tag':
      state.dialog = { type: 'add-tag' }
      break;
    case 'open-edit-tag':
      state.dialog = { type: 'edit-tag', tagId: action.tagId }
      break;
    case 'add-tag-finished':
      state.tags.push(action.tag);
      delete state.dialog;
      break;
    case 'edit-tag':
      const tag = state.tags.find(({ id }) => id === action.tagId)
      if (tag && typeof action.data.name === 'string') tag.name = action.data.name;
      delete state.dialog;
      break;
    case 'delete-tag':
      state.tags = state.tags.filter((tag) => tag.id !== action.tagId);
      state.selectedTags = state.selectedTags.filter((id) => id !== action.tagId);
      for (const task of state.tasks) task.tags = task.tags.filter(({ id }) => id !== action.tagId);
      break;
    case 'open-add-task':
      state.dialog = { type: 'add-task' }
      break;
    case 'open-edit-task':
      state.dialog = { type: 'edit-task', taskId: action.taskId }
      break;
    case 'add-task-finished':
      state.tasks.push(action.task);
      delete state.dialog;
      break;
    case 'edit-task':
      const taskToUpdate = state.tasks.find(({ id }) => id === action.taskId)
      if (taskToUpdate && typeof action.data.name === 'string') {
        if (typeof action.data.name === 'string') taskToUpdate.name = action.data.name;
        if (typeof action.data.description === 'string') taskToUpdate.description = action.data.description;
        taskToUpdate.urgent = action.data.urgent ?? false;
        taskToUpdate.important = action.data.important ?? false;
        taskToUpdate.someday = action.data.someday ?? false;
        if (Array.isArray(action.data.tags)) taskToUpdate.tags = action.data.tags.map(id => state.tags.find((tag) => tag.id === id)).filter(v => !!v) as Tag[];
      }
      delete state.dialog;
      break;
    case 'archive-task':
      const taskToArchive = state.tasks.find(({ id }) => id === action.taskId)
      if (taskToArchive) taskToArchive.archived = true;
      break;
    case 'unarchive-task':
      const taskToRestore = state.tasks.find(({ id }) => id === action.taskId)
      if (taskToRestore) taskToRestore.archived = false;
      break;
    case 'delete-task':
      state.tasks = state.tasks.filter((task) => task.id !== action.taskId);
      break;
    case 'close-dialog':
      delete state.dialog;
      break;
    case 'change-display-filters':
      state.showActive = action.data.includes('active');
      state.showArchived = action.data.includes('archived');
      state.showSomeday = action.data.includes('someday');
      break;
    case 'change-significance-filters':
      state.showNonImportant = !action.data.includes('important');
      state.showNonUrgent = !action.data.includes('urgent');
      break;
  }
}

async function effectReducer(action: ManagePageClientAction) {
  switch (action.type) {
    case 'server-error':
      ToastQueue.negative('Error: ' + (action.error as Error)?.message ?? 'Unknown error');
      break;
  }
}

async function serverReducer(action: ManagePageClientAction) {
  switch (action.type) {
    case 'add-tag':
      const tag = await createTag(action.data);
      return { type: 'add-tag-finished', tag } as ManagePageClientAction;
    case 'edit-tag':
      await updateTag(action.tagId, action.data)
      break;
    case 'delete-tag':
      await deleteTag(action.tagId);
      break;
    case 'add-task':
      const task = await createTask(action.data);
      return { type: 'add-task-finished', task } as ManagePageClientAction;
    case 'archive-task':
      await updateTask(action.taskId, { archived: true });
      break;
    case 'unarchive-task':
      await updateTask(action.taskId, { archived: false });
      break;
    case 'edit-task':
      await updateTask(action.taskId, action.data)
      break;
    case 'delete-task':
      await deleteTask(action.taskId);
      break;
  }
}

export default function ManagePageClient({ tasks: initialTasks, tags: initialTags }: TaskManagerProps) {

  const [state, dispatch] = useClientServerReducer<ManagePageClientState, ManagePageClientAction>(stateReducer, effectReducer, serverReducer, {
    tasks: initialTasks,
    tags: initialTags,
    selectedTags: [],
    showActive: true,
    showArchived: false,
    showSomeday: false,
    showNonImportant: true,
    showNonUrgent: true,
  });

  const handleAddTask = useCallback(() => { dispatch({ type: 'open-add-task' }) }, [dispatch]);

  const handleTagSelectionChange = useCallback((keys: Selection) => { dispatch({ type: 'select-tags', tags: keys }) }, [dispatch]);
  const handleAddTag = useCallback(() => { dispatch({ type: 'open-add-tag' }) }, [dispatch]);

  const handleDisplayFilterChange = useCallback((data: string[]) => { dispatch({ type: 'change-display-filters', data }) }, [dispatch]);
  const handleSignificanceFilterChange = useCallback((data: string[]) => { dispatch({ type: 'change-significance-filters', data }) }, [dispatch]);

  const handleTagMenuAction = useCallback((tagId: string, key: Key) => {
    switch (key) {
      case 'edit':
        dispatch({ type: 'open-edit-tag', tagId })
        break;
      case 'delete':
        dispatch({ type: 'delete-tag', tagId })
        break;
    }
  }, [dispatch]);

  const handleTaskMenuAction = useCallback((taskId: string, key: Key) => {
    switch (key) {
      case 'edit':
        dispatch({ type: 'open-edit-task', taskId })
        break;
      case 'archive':
        dispatch({ type: 'archive-task', taskId });
        break;
      case 'unarchive':
        dispatch({ type: 'unarchive-task', taskId });
        break;
      case 'delete':
        dispatch({ type: 'delete-task', taskId })
        break;
    }
  }, [dispatch]);

  const filteredTasks = state.tasks.filter((task) => {
    if (!state.showActive && !task.archived && !(state.showSomeday && task.someday)) return false;
    if (!state.showArchived && task.archived) return false;
    if (!state.showSomeday && task.someday) return false;
    if (state.selectedTags.length > 0 && !task.tags.some((tag) => state.selectedTags.includes(tag.id))) return false;
    if (!state.showNonImportant && !task.important) return false;
    if (!state.showNonUrgent && !task.urgent) return false;
    return true;
  });

  return (
    <AppLayout user={true} breadcrumbs={[{ label: 'Manage', url: '/manage', key: 'manage' }]}>
      <EditTagDialog
       onSave={(tagId, data) => dispatch(tagId ? { type: 'edit-tag', tagId, data } : { type: 'add-tag', data })}
       onClose={() => dispatch({ type: 'close-dialog' })}
       tag={state.tags.find(({id}) => id === state.dialog?.tagId)}
       isOpen={state.dialog?.type === 'add-tag' || state.dialog?.type === 'edit-tag'}
       isCreate={state.dialog?.type === 'add-tag'}
       />
      <EditTaskDialog
       onSave={(taskId, data) => dispatch(taskId ? { type: 'edit-task', taskId, data } : { type: 'add-task', data })}
       onClose={() => dispatch({ type: 'close-dialog' })}
       task={state.tasks.find(({id}) => id === state.dialog?.taskId)}
       isOpen={state.dialog?.type === 'add-task' || state.dialog?.type === 'edit-task'}
       isCreate={state.dialog?.type === 'add-task'}
       allTags={state.tags}
      />
      <SidebarLayout>
        <View gridArea="sidebar">
          <Flex direction="row" justifyContent="center">
            <Button variant="primary" onPress={handleAddTask}>Add Task</Button>
          </Flex>
          <Flex direction="row" marginTop="single-line-height">
            <CheckboxGroup label="Display filters" value={[
              ...state.showActive ? ['active'] : [],
              ...state.showArchived ? ['archived'] : [],
              ...state.showSomeday ? ['someday'] : [],
            ]} onChange={handleDisplayFilterChange}>
              <Checkbox value="active">Active</Checkbox>
              <Checkbox value="archived">Archived</Checkbox>
              <Checkbox value="someday">Someday/Maybe</Checkbox>
            </CheckboxGroup>
            <CheckboxGroup label="Significance filters" value={[
              ...state.showNonImportant ? [] : ['important'],
              ...state.showNonUrgent ? [] : ['urgent'],
            ]} onChange={handleSignificanceFilterChange}>
              <Checkbox value="important">Important</Checkbox>
              <Checkbox value="urgent">Urgent</Checkbox>
            </CheckboxGroup>
          </Flex>
          <Flex direction="row" alignItems="center" justifyContent="space-between" marginTop="single-line-height">
            <Heading UNSAFE_className="text-lg" level={2}>Tags</Heading>
            <ActionButton onPress={handleAddTag} isQuiet><Add /><Text>New tag...</Text></ActionButton>
          </Flex>
          <ListView isQuiet items={state.tags} selectionMode="multiple" aria-label="List of selected tags" onSelectionChange={handleTagSelectionChange} width="single-line-width">
            {(tag) => (
              <Item key={tag.id} textValue={tag.name}>
                <Text>{tag.name}</Text>
                <ActionMenu onAction={(key) => handleTagMenuAction(tag.id, key)}>
                  <Item key="edit">Edit...</Item>
                  <Item key="delete">Delete</Item>
                </ActionMenu>
              </Item>
            )}
          </ListView>
        </View>
        <View gridArea="content" justifySelf="stretch">
          <TableView renderEmptyState={renderEmptyState} aria-label="List of tasks">
            <TableHeader>
              <Column>Name</Column>
              <Column width={96} textValue="Important/Urgent Flags">
                <ImportantIcon />
                <UrgentIcon />
                <SomedayIcon />
              </Column>
              <Column width={150}>Tags</Column>
              <Column width={150}>Created</Column>
              <Column width={32} align="end"> </Column>
            </TableHeader>
            <TableBody items={filteredTasks}>
              {(task) => (
                <Row key={task.id} textValue={task.name}>
                  <Cell>
                    {task.name}
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
                    <ActionMenu isQuiet onAction={(key) => handleTaskMenuAction(task.id, key)}>
                      <Item key="edit">Edit...</Item>
                      {task.archived ? <Item key="unarchive">Restore</Item> : <Item key="archive">Archive</Item>}                  
                      <Item key="delete">Delete</Item>
                    </ActionMenu>
                  </Cell>
                </Row>
              )}
            </TableBody>
          </TableView>
        </View>
      </SidebarLayout>
    </AppLayout>
  );
}

function renderEmptyState() {
  return (
    <IllustratedMessage>
      <NotFound />
      <Heading>No tasks</Heading>
      <Content>You haven&apos;t created any tasks yet!</Content>
    </IllustratedMessage>
  );
}
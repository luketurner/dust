'use client';

import { Tag, Tag as TagType, Task as TaskType } from "@prisma/client";
import { Key, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { ServerErrorAction, useClientServerReducer } from "@/hooks/clientServerReducer";
import { ActionButton, ActionMenu, Item, ListView, Selection, Text } from "@adobe/react-spectrum";
import EditTagDialog from "@/components/EditTagDialog";
import { createTag, deleteTag, updateTag } from "@/actions/tag";
import { ToastQueue } from "@react-spectrum/toast";

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
    type: 'add-tag' | 'edit-tag'
    tagId?: string
  }
}

interface SelectTagsAction { type: 'select-tags'; tags: Set<Key> | 'all'; }
interface OpenAddTagAction { type: 'open-add-tag'; }
interface OpenEditTagAction { type: 'open-edit-tag'; tagId: string; }
interface AddTagAction { type: 'add-tag'; data: Partial<Tag>; }
interface AddTagFinishedAction { type: 'add-tag-finished'; tag: Tag; }
interface EditTagAction { type: 'edit-tag'; tagId: string, data: Partial<Tag>; }
interface DeleteTagAction { type: 'delete-tag'; tagId: string; }
interface CloseDialogAction { type: 'close-dialog'; }

type ManagePageClientAction = ServerErrorAction | SelectTagsAction | OpenAddTagAction | OpenEditTagAction | AddTagAction | EditTagAction | DeleteTagAction | AddTagFinishedAction | CloseDialogAction;

function clientReducer(state: ManagePageClientState, action: ManagePageClientAction) {
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
      break;
    case 'close-dialog':
      delete state.dialog;
      break;
    case 'server-error':
      ToastQueue.negative('Error: ' + (action.error as Error)?.message ?? 'Unknown error');
      break;
  }
}

async function serverReducer(action: ManagePageClientAction) {
  switch (action.type) {
    case 'add-tag':
      const tag = await createTag(action.data);
      return { type: 'add-tag-finished', tag };
    case 'edit-tag':
      await updateTag(action.tagId, action.data)
      break;
    case 'delete-tag':
      await deleteTag(action.tagId);
      break;
  }
}

export default function ManagePageClient({ tasks: initialTasks, tags: initialTags }: TaskManagerProps) {

  const [state, dispatch] = useClientServerReducer<ManagePageClientState, ManagePageClientAction>(clientReducer, serverReducer, {
    tasks: initialTasks,
    tags: initialTags,
    selectedTags: [],
  });

  const handleTagSelectionChange = useCallback((keys: Selection) => {
    dispatch({ type: 'select-tags', tags: keys })
  }, []);

  const handleAddTag = useCallback(() => {
    dispatch({ type: 'open-add-tag' })
  }, []);

  const handleTagMenuAction = useCallback((tagId: string, key: Key) => {
    switch (key) {
      case 'edit':
        dispatch({ type: 'open-edit-tag', tagId })
        break;
      case 'delete':
        dispatch({ type: 'delete-tag', tagId })
        break;
    }
  }, []);

  return (
    <AppLayout user={true} breadcrumbs={[{ label: 'Manage', url: '/manage', key: 'manage' }]}>
      <EditTagDialog
       onSave={(tagId, data) => dispatch(tagId ? { type: 'edit-tag', tagId, data } : { type: 'add-tag', data })}
       onClose={() => dispatch({ type: 'close-dialog' })}
       tag={state.tags.find(({id}) => id === state.dialog?.tagId)}
       isOpen={state.dialog?.type === 'add-tag' || state.dialog?.type === 'edit-tag'}
       isCreate={state.dialog?.type === 'add-tag'}
       />
      <ListView items={state.tags} selectionMode="multiple" aria-label="List of selected tags" onSelectionChange={handleTagSelectionChange}>
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
      <ActionButton onPress={handleAddTag}>Add tag...</ActionButton>
    </AppLayout>
  );
}
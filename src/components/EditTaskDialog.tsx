'use client';

import { Button, ButtonGroup, Content, Dialog, DialogContainer, Form, Heading, TextField, ComboBox, Item, Picker, TagGroup, TextArea } from "@adobe/react-spectrum";
import { Tag, Task } from "@prisma/client";
import { useCallback, useMemo } from "react";
import { useImmer } from "use-immer";

export interface EditTaskDialogData {
  name: string;
  tags: string[];
  description: string;
}

export interface EditTaskDialogProps {
  task: (Task & { tags: Tag[] }) | null | undefined
  allTags: Tag[]
  onClose(): void
  onSave(taskId: string, data: EditTaskDialogData): void
}

export default function EditTaskDialog({ task, onClose, onSave, allTags }: EditTaskDialogProps) {
  return (
    <DialogContainer onDismiss={onClose}>
      {task && <EditTaskDialogInner allTags={allTags} key={task.id} task={task} onClose={onClose} onSave={onSave} />}
    </DialogContainer>
  )
}

function EditTaskDialogInner({ task, onClose, onSave, allTags }: EditTaskDialogProps) {

  const [data, setData] = useImmer<EditTaskDialogData>({
    name: task?.name ?? "",
    tags: (task?.tags ?? []).map(({ id }) => id),
    description: task?.description ?? ""
  });

  const handleNameChange = useCallback((value: string) => {
    setData(draft => {
      draft.name = value;
    })
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setData(draft => {
      draft.description = value;
    })
  }, []);

  const handleSave = useCallback(() => {
    onSave(task?.id, data)
  }, [onSave, task, data]);

  const handleAddTag = useCallback((key: string) => {
    setData(data => {
      data.tags.push(key)
    })
  }, []);

  const handleRemoveTag = useCallback((key: string) => {
    setData(data => {
      data.tags = data.tags.filter(id => id !== key);
    })
  }, []);

  const allTagsById = useMemo(() => {
    return (allTags ?? []).reduce((allTagsById, tag) => {
      allTagsById[tag.id] = tag;
      return allTagsById;
    }, {} as Record<string, Tag>);
  }, [allTags])

  return (
    <Dialog>
      <Heading>Edit task</Heading>
      <Content>
      <Form maxWidth="size-3600">
        <TextField label="Name" value={data.name} onChange={handleNameChange} />
        <TagGroup
          items={data.tags}
          onRemove={handleRemoveTag}
          aria-label="Tags for task"
          label="Tags">
          {tagId => <Item key={tagId}>{allTagsById[tagId].name}</Item>}
        </TagGroup>
        <Picker label="Add tag" onSelectionChange={handleAddTag}>
          {allTags.map(tag => <Item key={tag.id}>{tag.name}</Item>)}
        </Picker>
        <TextArea label="Description" value={data.description} onChange={handleDescriptionChange} />
      </Form>
      </Content>
      <ButtonGroup>
        <Button variant="secondary" onPress={onClose}>Cancel</Button>
        <Button variant="accent" onPress={handleSave}>Save</Button>
      </ButtonGroup>
    </Dialog>
  )
}
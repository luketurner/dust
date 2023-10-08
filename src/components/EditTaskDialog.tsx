'use client';

import { Button, ButtonGroup, Content, Dialog, DialogContainer, Form, Heading, TextField, TextArea, Checkbox, ToggleButton, Flex } from "@adobe/react-spectrum";
import { Tag, Task } from "@prisma/client";
import { useCallback } from "react";
import { useImmer } from "use-immer";

export interface EditTaskDialogData {
  name: string;
  tags: string[];
  description: string;
  important: boolean;
  urgent: boolean;
}

export interface EditTaskDialogProps {
  task: (Task & { tags: Tag[] }) | null | undefined
  allTags: Tag[]
  onClose(): void
  onSave(taskId: string | null, data: EditTaskDialogData): void
  isOpen?: boolean;
  isCreate?: boolean;
}

export default function EditTaskDialog({ task, onClose, onSave, allTags, isCreate, isOpen }: EditTaskDialogProps) {
  return (
    <DialogContainer onDismiss={onClose}>
      {isOpen && <EditTaskDialogInner allTags={allTags} key={isCreate ? 'create' : task!.id} task={task} onClose={onClose} onSave={onSave} isCreate={isCreate} />}
    </DialogContainer>
  )
}

function EditTaskDialogInner({ task, onClose, onSave, allTags, isCreate }: EditTaskDialogProps) {

  const [data, setData] = useImmer<EditTaskDialogData>({
    name: task?.name ?? "",
    tags: (task?.tags ?? []).map(({ id }) => id),
    description: task?.description ?? "",
    important: task?.important ?? false,
    urgent: task?.urgent ?? false,
  });

  const handleNameChange = useCallback((value: string) => {
    setData(draft => {
      draft.name = value;
    })
  }, [setData]);

  const handleDescriptionChange = useCallback((value: string) => {
    setData(draft => {
      draft.description = value;
    })
  }, [setData]);

  const handleImportantChange = useCallback((value: boolean) => {
    setData(draft => {
      draft.important = value;
    })
  }, [setData]);

  const handleUrgentChange = useCallback((value: boolean) => {
    setData(draft => {
      draft.urgent = value;
    })
  }, [setData]);

  const handleSave = useCallback(() => {
    onSave(isCreate ? null : task!.id, data)
  }, [onSave, task, data]);

  const handleToggleTag = useCallback((tagId: string, value: boolean) => {
    setData(data => {
      if (value && !data.tags.includes(tagId)) {
        data.tags.push(tagId);
      } else {
        data.tags = data.tags.filter(t => t !== tagId)
      }
    })
  }, [setData]);

  return (
    <Dialog>
      <Heading>{isCreate ? 'Add' : 'Edit'} task</Heading>
      <Content>
        <Form maxWidth="size-3600">
          <TextField label="Name" value={data.name} onChange={handleNameChange} />
          <Checkbox isSelected={data.important} onChange={handleImportantChange}>Important</Checkbox>
          <Checkbox isSelected={data.urgent} onChange={handleUrgentChange}>Urgent</Checkbox>
          <Flex direction="row" wrap gap="size-100">
            {allTags.map((tag) => (
              <ToggleButton key={tag.id} isSelected={data.tags.includes(tag.id)} onChange={(v: boolean) => handleToggleTag(tag.id, v)}>{tag.name}</ToggleButton>
            ))}
          </Flex>
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
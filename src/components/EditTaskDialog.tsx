'use client';

import { findSimilarTasks } from "@/actions/task";
import { useUser } from "@/hooks/user";
import { TaskWithDistance, TaskWithTags } from "@/models/task";
import { Button, ButtonGroup, Content, Dialog, DialogContainer, Form, Heading, TextField, TextArea, Checkbox, ToggleButton, Flex, Well, ProgressCircle } from "@adobe/react-spectrum";
import { Tag, Task } from "@prisma/client";
import { ToastQueue } from "@react-spectrum/toast";
import { useCallback, useState } from "react";
import { useImmer } from "use-immer";

export interface EditTaskDialogData {
  name: string;
  tags: string[];
  description: string;
  important: boolean;
  urgent: boolean;
  someday: boolean;
}

export interface EditTaskDialogProps {
  task: TaskWithTags | null | undefined
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
    someday: task?.someday ?? false,
  });

  const [similarTasks, setSimilarTasks] = useState<TaskWithDistance[] | null>(null);

  const { user } = useUser();

  const handleNameChange = useCallback((value: string) => {setData(draft => {draft.name = value;})}, [setData]);
  const handleDescriptionChange = useCallback((value: string) => {setData(draft => {draft.description = value;})}, [setData]);
  const handleImportantChange = useCallback((value: boolean) => {setData(draft => {draft.important = value;})}, [setData]);
  const handleUrgentChange = useCallback((value: boolean) => {setData(draft => {draft.urgent = value;})}, [setData]);
  const handleSomedayChange = useCallback((value: boolean) => {setData(draft => {draft.someday = value;})}, [setData]);
  const handleSave = useCallback(() => {onSave(isCreate ? null : task!.id, data)}, [onSave, isCreate, task, data]);

  const handleToggleTag = useCallback((tagId: string, value: boolean) => {
    setData(data => {
      if (value && !data.tags.includes(tagId)) {
        data.tags.push(tagId);
      } else {
        data.tags = data.tags.filter(t => t !== tagId)
      }
    })
  }, [setData]);

  if (user?.useAI && task && !similarTasks) {
    findSimilarTasks(task.id)
      .then(setSimilarTasks)
      .catch(e => {
        ToastQueue.negative('Error loading similar tasks.');
      });
  }

  return (
    <Dialog>
      <Heading>{isCreate ? 'Add' : 'Edit'} task</Heading>
      <Content>
        <Form maxWidth="size-3600">
          <TextField label="Name" value={data.name} onChange={handleNameChange} />
          <Checkbox isDisabled={data.someday} isSelected={data.important} onChange={handleImportantChange}>Important</Checkbox>
          <Checkbox isDisabled={data.someday} isSelected={data.urgent} onChange={handleUrgentChange}>Urgent</Checkbox>
          <Checkbox isDisabled={data.important || data.urgent} isSelected={data.someday} onChange={handleSomedayChange}>Someday/Maybe</Checkbox>
          <Flex direction="row" wrap gap="size-100">
            {allTags.map((tag) => (
              <ToggleButton key={tag.id} isSelected={data.tags.includes(tag.id)} onChange={(v: boolean) => handleToggleTag(tag.id, v)}>{tag.name}</ToggleButton>
            ))}
          </Flex>
          <TextArea label="Description" value={data.description} onChange={handleDescriptionChange} />
        </Form>
          {user?.useAI && task && <Well>
            <Heading UNSAFE_className="text-lg" level={2}>
              {similarTasks === null && <ProgressCircle size="S" aria-label="Loading…" isIndeterminate />}
              {' '}Similar tasks
            </Heading>
            {similarTasks?.map(({ task, distance }) => <div key={task.id}>
              {task.name} ({distance.toPrecision(3)})
            </div>)}
          </Well>}
      </Content>
      <ButtonGroup>
        <Button variant="secondary" onPress={onClose}>Cancel</Button>
        <Button variant="accent" onPress={handleSave}>Save</Button>
      </ButtonGroup>
    </Dialog>
  )
}
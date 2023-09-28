'use client';

import { Button, ButtonGroup, Content, Dialog, DialogContainer, Form, Heading, TextField } from "@adobe/react-spectrum";
import { Task } from "@prisma/client";
import { useCallback } from "react";
import { useImmer } from "use-immer";

export interface EditTaskDialogData {
  name: string;
}

export interface EditTaskDialogProps {
  task: Task | null | undefined
  onClose(): void
  onSave(task: Task, data: EditTaskDialogData): void
}

export default function EditTaskDialog({ task, onClose, onSave }: EditTaskDialogProps) {

  return (
    <DialogContainer onDismiss={onClose}>
      {task && <EditTaskDialogInner key={task.id} task={task} onClose={onClose} onSave={onSave} />}
    </DialogContainer>
  )
}

function EditTaskDialogInner({ task, onClose, onSave }: EditTaskDialogProps) {

  const [data, setData] = useImmer<EditTaskDialogData>({
    name: task.name
  });

  const handleNameChange = useCallback((value: string) => {
    setData(draft => {
      draft.name = value;
    })
  }, []);

  const handleSave = useCallback(() => {
    onSave(task, data)
  }, [onSave, task, data]);

  return (
    <Dialog>
      <Heading>Edit task</Heading>
      <Content>
      <Form maxWidth="size-3600">
        <TextField label="Name" value={data.name} onChange={handleNameChange} />
      </Form>
      </Content>
      <ButtonGroup>
        <Button variant="secondary" onPress={onClose}>Cancel</Button>
        <Button variant="accent" onPress={handleSave}>Save</Button>
      </ButtonGroup>
    </Dialog>
  )
}
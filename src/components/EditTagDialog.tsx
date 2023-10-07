'use client';

import { Button, ButtonGroup, Content, Dialog, DialogContainer, Form, Heading, TextField } from "@adobe/react-spectrum";
import { Tag } from "@prisma/client";
import { useCallback } from "react";
import { useImmer } from "use-immer";

export interface EditTagDialogData {
  name: string;
}

export interface EditTagDialogProps {
  isOpen?: boolean;
  isCreate?: boolean;
  tag?: Tag | null | undefined
  onClose(): void
  onSave(tagId: string | null, data: EditTagDialogData): void
}

export default function EditTagDialog({ tag, onClose, onSave, isOpen, isCreate }: EditTagDialogProps) {
  return (
    <DialogContainer onDismiss={onClose}>
      {isOpen && <EditTagDialogInner key={isCreate ? 'create' : tag!.id} tag={tag} onClose={onClose} onSave={onSave} isCreate={isCreate} />}
    </DialogContainer>
  )
}

function EditTagDialogInner({ tag, onClose, onSave, isCreate }: EditTagDialogProps) {

  const [data, setData] = useImmer<EditTagDialogData>({
    name: tag?.name ?? "",
  });

  const handleNameChange = useCallback((value: string) => {
    setData(draft => {
      draft.name = value;
    })
  }, [setData]);

  const handleSave = useCallback(() => {
    onSave(tag?.id ?? null, data)
  }, [onSave, tag, data]);

  return (
    <Dialog>
      <Heading>{isCreate ? 'Add' : 'Edit'} tag</Heading>
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
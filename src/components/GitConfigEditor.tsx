'use client';

import { ClientGitExportConfig } from "@/app/(app)/settings/client";
import { Button, ButtonGroup, Form, LabeledValue, TextField } from "@adobe/react-spectrum";
import { useCallback } from "react";
import { useImmer } from "use-immer";

export type GitConfigEditorState = ClientGitExportConfig

export interface GitConfigEditorProps {
  onSave(configId: string, data: GitConfigEditorState): void
  onDelete(configId: string): void
  onTest(configId: string): void
  config: ClientGitExportConfig
}

export default function GitConfigEditor({ config, onSave, onDelete, onTest }: GitConfigEditorProps) {
  const [state, setState] = useImmer(config)
  const handleNameChange = useCallback((value: string) => { setState(draft => { draft.name = value; }) }, []);
  const handleRemoteUrlChange = useCallback((value: string) => { setState(draft => { draft.remoteUrl = value; }) }, []);
  const handleBranchNameChange = useCallback((value: string) => { setState(draft => { draft.branchName = value; }) }, []);

  const handleDelete = useCallback(() => { onDelete(config.id) }, [onDelete, config.id]);
  const handleTest = useCallback(() => { onTest(config.id) }, [onTest, config.id]);

  const handleSave = useCallback(() => {
    onSave(config.id, state)
  }, [onSave, config.id, state]);

  return (
    <Form maxWidth="size-3600">
      <TextField label="Name" value={state.name ?? ""} onChange={handleNameChange} />
      <TextField label="Remote URL" value={state.remoteUrl ?? ""} onChange={handleRemoteUrlChange} />
      <TextField label="Branch name" value={state.branchName ?? ""} onChange={handleBranchNameChange} />
      <LabeledValue label="SSH Public Key" value={state.sshPublicKey ?? 'Not set'} />
      
      <ButtonGroup>
        <Button variant="negative" onPress={handleDelete}>Delete</Button>
        <Button variant="secondary" onPress={handleTest}>Test</Button>
        <Button variant="accent" onPress={handleSave}>Update</Button>
      </ButtonGroup>
    </Form>
  )
}
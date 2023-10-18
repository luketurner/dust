'use client';

import { ClientGitExportConfig } from "@/models/gitExportConfig";
import { Button, ButtonGroup, Form, LabeledValue, TextField } from "@adobe/react-spectrum";
import { useCallback } from "react";
import { useImmer } from "use-immer";

export type GitConfigEditorState = ClientGitExportConfig

export interface GitConfigEditorProps {
  onSave(configId: string, data: GitConfigEditorState): void
  onDelete(configId: string): void
  onTest(configId: string, data: GitConfigEditorState): void
  config: ClientGitExportConfig
}

export default function GitConfigEditor({ config, onSave, onDelete, onTest }: GitConfigEditorProps) {
  const [state, setState] = useImmer(config)
  const handleNameChange = useCallback((value: string) => { setState(draft => { draft.name = value; }) }, [setState]);
  const handleRemoteUrlChange = useCallback((value: string) => { setState(draft => { draft.remoteUrl = value; }) }, [setState]);
  const handleBranchNameChange = useCallback((value: string) => { setState(draft => { draft.branchName = value; }) }, [setState]);

  const handleDelete = useCallback(() => { onDelete(config.id) }, [onDelete, config.id]);
  const handleTest = useCallback(() => { onTest(config.id, state) }, [onTest, config.id, state]);
  const handleSave = useCallback(() => { onSave(config.id, state) }, [onSave, config.id, state]);

  return (
    <Form maxWidth="size-3600">
      <TextField label="Name" value={state.name ?? ""} onChange={handleNameChange} />
      <TextField label="Remote URL" value={state.remoteUrl ?? ""} onChange={handleRemoteUrlChange} />
      <TextField label="Branch name" value={state.branchName ?? ""} onChange={handleBranchNameChange} />
      <LabeledValue label="SSH Public Key" value={state.sshPublicKey ?? 'Not set'} />
      
      <ButtonGroup>
        <Button variant="negative" onPress={handleDelete}>Delete</Button>
        <Button variant="accent" onPress={handleSave}>Save</Button>
        <Button variant="secondary" onPress={handleTest} isDisabled={!(state.remoteUrl && state.branchName && state.hasPrivateKey)}>Save & Test</Button>
      </ButtonGroup>
    </Form>
  )
}
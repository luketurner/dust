'use client';

import { generateSSHKeys, upsertSingleGitExportConfig } from "@/actions/gitExportConfig";
import AppLayout from "@/components/AppLayout";
import { ActionButton, Form, LabeledValue, TextField } from "@adobe/react-spectrum";
import { GitExportConfig, User } from "@prisma/client";
import { useCallback } from "react";
import { useImmer } from "use-immer";

export type ClientGitExportConfig = Omit<GitExportConfig, 'sshPrivateKey'> & { hasPrivateKey?: boolean };

export interface SettingsPageClientProps {
  user: User;
  gitExportConfig: ClientGitExportConfig | null;
}

export default function SettingsPageClient({ user, gitExportConfig }: SettingsPageClientProps) {
  const [state, setState] = useImmer({
    remoteUrl: gitExportConfig?.remoteUrl ?? '',
    branchName: gitExportConfig?.branchName,
    name: gitExportConfig?.name,
    publicKey: gitExportConfig?.sshPublicKey,
    hasPrivateKey: gitExportConfig?.hasPrivateKey,
  });

  const handleNameChange = useCallback((v: string) => { setState((draft) => { draft.name = v; }) }, []);
  const handleRemoteUrlChange = useCallback((v: string) => { setState((draft) => { draft.remoteUrl = v; }) }, []);
  const handleBranchNameChange = useCallback((v: string) => { setState((draft) => { draft.branchName = v; }) }, []);

  const handleSubmit = useCallback(async () => {
    await upsertSingleGitExportConfig(gitExportConfig?.id ?? null, {
      name: state.name,
      branchName: state.branchName,
      remoteUrl: state.remoteUrl
    });
  }, [gitExportConfig, state]);

  const handleGenerateKeys = useCallback(async () => { 
    await generateSSHKeys(gitExportConfig?.id);
  }, [gitExportConfig]);

  return (
    <AppLayout user={true} breadcrumbs={[{ label: 'Settings', url: '/settings', key: 'settings' }]}>
      <Form maxWidth="size-3600" onSubmit={handleSubmit}>
        <TextField label="Git config nickname" value={state.name} onChange={handleNameChange} />
        <TextField label="Remote URL (SSH)" value={state.remoteUrl} onChange={handleRemoteUrlChange} />
        <TextField label="Branch name" value={state.branchName} onChange={handleBranchNameChange} />
        <LabeledValue label="SSH Public Key" value={state.publicKey ?? 'Not set'} />
        <LabeledValue label="SSH Private Key" value={state.hasPrivateKey ? 'Set' : 'Not set'} />
        <ActionButton onPress={handleGenerateKeys}>Generate new SSH keys</ActionButton>
        <ActionButton onPress={handleSubmit}>Save</ActionButton>
      </Form>
    </AppLayout>
  );
}
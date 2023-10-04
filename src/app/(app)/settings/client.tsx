'use client';

import { createGitExportConfig, generateSSHKeys, removeGitExportConfig, updateGitExportConfig } from "@/actions/gitExportConfig";
import AppLayout from "@/components/AppLayout";
import GitConfigEditor from "@/components/GitConfigEditor";
import { ServerErrorAction, useClientServerReducer } from "@/hooks/clientServerReducer";
import { ActionButton, Item, TabList, TabPanels, Tabs } from "@adobe/react-spectrum";
import { GitExportConfig, User } from "@prisma/client";
import { ToastQueue } from "@react-spectrum/toast";
import { useCallback } from "react";

export type ClientGitExportConfig = Omit<GitExportConfig, 'sshPrivateKey'> & { hasPrivateKey?: boolean };

export interface SettingsPageClientProps {
  user: User;
  gitExportConfigs: ClientGitExportConfig[];
}

export interface GitExportConfigData {
  remoteUrl: string;
  branchName: string;
  name: string;
  publicKey: string;
  hasPrivateKey: boolean;
}

export interface SettingsPageState {
  user: User;
  gitExportConfigs: ClientGitExportConfig[]
}

interface AddGitConfigAction {
  type: 'add-git-config';
}

interface AddGitConfigFinishedAction {
  type: 'add-git-config-finished';
  config: GitExportConfig;
}

interface UpdateGitConfigAction {
  type: 'update-git-config';
  configId: string;
  data: Partial<GitExportConfig>
}

interface RemoveGitConfigAction {
  type: 'remove-git-config';
  configId: string;
}

interface GenerateSSHKeysAction {
  type: 'generate-ssh-keys';
  configId: string;
}

interface GenerateSSHKeysFinishedAction {
  type: 'generate-ssh-keys-finished';
  configId: string;
  publicKey: string;
}

export type SettingsPageAction = ServerErrorAction | AddGitConfigAction | AddGitConfigFinishedAction | UpdateGitConfigAction | RemoveGitConfigAction | GenerateSSHKeysAction | GenerateSSHKeysFinishedAction;

function clientReducer(state: SettingsPageState, action: SettingsPageAction) {
  switch (action.type) {
    case 'update-git-config':
      Object.assign(state.gitExportConfigs.find(({ id }) => id === action.configId)!, action.data)
      break;
    case 'add-git-config-finished':
      if (!state.gitExportConfigs.find(({ id }) => id === action.config.id)) {
        state.gitExportConfigs.push(action.config);
      }
      break;
    case 'remove-git-config':
      state.gitExportConfigs = state.gitExportConfigs.filter(({ id }) => id !== action.configId);
      break;
    case 'generate-ssh-keys-finished':
      Object.assign(state.gitExportConfigs.find(({ id }) => id === action.configId)!, {
        sshPublicKey: action.publicKey,
        hasPrivateKey: true,
      })
      break;
    case 'server-error':
      ToastQueue.negative('Error: ' + (action.error as Error)?.message ?? 'Unknown error');
      break;
  }
}

async function serverReducer(action: SettingsPageAction): Promise<SettingsPageAction | undefined> {
  switch (action.type) {
    case 'add-git-config':
      return { type: 'add-git-config-finished', config: await createGitExportConfig() };
    case 'update-git-config':
      await updateGitExportConfig(action.configId, action.data);
      break;
    case 'remove-git-config':
      await removeGitExportConfig(action.configId);
      break;
    case 'generate-ssh-keys':
      return { type: 'generate-ssh-keys-finished', config: await generateSSHKeys(action.configId) };
  }
}


export default function SettingsPageClient({ user, gitExportConfigs }: SettingsPageClientProps) {
  const [state, dispatch] = useClientServerReducer<SettingsPageState, SettingsPageAction>(clientReducer, serverReducer, {
    user,
    gitExportConfigs
  });

  const handleGitConfigSave = useCallback(async (configId: string, data: ClientGitExportConfig) => { 
    dispatch({ type: 'update-git-config', configId, data })
  }, [dispatch]);

  const handleGitConfigRemove = useCallback(async (configId: string) => { 
    dispatch({ type: 'remove-git-config', configId })
  }, [dispatch]);

  const handleGitConfigKeyGeneration = useCallback(async (configId: string) => { 
    dispatch({ type: 'generate-ssh-keys', configId })
  }, [dispatch]);

  const handleGitConfigAdd = useCallback(async () => { 
    dispatch({ type: 'add-git-config' })
  }, [dispatch]);

  return (
    <AppLayout user={true} breadcrumbs={[{ label: 'Settings', url: '/settings', key: 'settings' }]}>
      <ActionButton onPress={handleGitConfigAdd}>Add Git Export Config</ActionButton>
      {state.gitExportConfigs.length > 0 ? (
        <Tabs items={state.gitExportConfigs}>
          <TabList>
            {({ id, name }: ClientGitExportConfig) => <Item key={id}>{name}</Item>}
          </TabList>
          <TabPanels>
            {(config: ClientGitExportConfig) => (
              <Item key={config.id}>
                <GitConfigEditor config={config} onSave={handleGitConfigSave} onGenerateKeys={handleGitConfigKeyGeneration} onDelete={handleGitConfigRemove} />
              </Item>
            )}
          </TabPanels>
        </Tabs>
      ) : undefined}

    </AppLayout>
  );
}
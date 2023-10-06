'use client';

import { createGitExportConfig, removeGitExportConfig, testGitExportConfig, updateGitExportConfig } from "@/actions/gitExportConfig";
import AppLayout from "@/components/AppLayout";
import GitConfigEditor from "@/components/GitConfigEditor";
import GitExportAttemptsTable from "@/components/GitExportAttemptsTable";
import { ServerErrorAction, useClientServerReducer } from "@/hooks/clientServerReducer";
import { ActionButton, Item, TabList, TabPanels, Tabs } from "@adobe/react-spectrum";
import { GitExportAttempt, GitExportConfig, User } from "@prisma/client";
import { ToastQueue } from "@react-spectrum/toast";
import { randomUUID } from "crypto";
import { useCallback } from "react";
import { v4 as uuid } from "uuid";

export type ClientGitExportConfig = Omit<GitExportConfig, 'sshPrivateKey'> & { hasPrivateKey?: boolean };
export type ClientGitExportConfigWithAttempts = ClientGitExportConfig & { exportAttempts?: GitExportAttempt[] };

export interface SettingsPageClientProps {
  user: User;
  gitExportConfigs: ClientGitExportConfigWithAttempts[];
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
  gitExportConfigs: ClientGitExportConfigWithAttempts[]
}

interface AddGitConfigAction {
  type: 'add-git-config';
}

interface AddGitConfigFinishedAction {
  type: 'add-git-config-finished';
  config: ClientGitExportConfig;
}

interface UpdateGitConfigAction {
  type: 'update-git-config';
  configId: string;
  data: Partial<ClientGitExportConfig>
}

interface RemoveGitConfigAction {
  type: 'remove-git-config';
  configId: string;
}

interface TestGitConfigAction {
  type: 'test-git-config';
  configId: string;
  pendingExportId: string;
}

interface TestGitConfigFinishedAction {
  type: 'test-git-config-finished';
  configId: string;
  exportAttempt: GitExportAttempt;
  pendingExportId: string;
}

export type SettingsPageAction = ServerErrorAction | AddGitConfigAction | AddGitConfigFinishedAction | UpdateGitConfigAction | RemoveGitConfigAction | TestGitConfigAction | TestGitConfigFinishedAction;

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
    case 'server-error':
      ToastQueue.negative('Error: ' + (action.error as Error)?.message ?? 'Unknown error');
      if ((action.error as Error)?.message.includes('Rate-limiting Git export.')) {
        const failedAction = (action.failedAction as TestGitConfigAction);
        Object.assign(
          state.gitExportConfigs.find(({ id }) => id === failedAction.configId)!.exportAttempts?.find(({ id }) => id === failedAction.pendingExportId)!,
          {
            status: 'failed',
            result: 'Rate-limited'
          }
        );
      }
      break;
    case 'test-git-config':
      state.gitExportConfigs.find(({ id }) => id === action.configId)!.exportAttempts?.unshift({
        id: action.pendingExportId,
        userId: state.user.id,
        configId: action.configId,
        startedAt: null,
        finishedAt: null,
        status: 'running',
        result: ''
      });
      break;
    case 'test-git-config-finished':
      ToastQueue.positive('Git export succeeded!');
      Object.assign(
        state.gitExportConfigs.find(({ id }) => id === action.configId)!.exportAttempts?.find(({ id }) => id === action.pendingExportId)!,
        action.exportAttempt
      );
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
    case 'test-git-config':
      const exportAttempt = await testGitExportConfig(action.configId);
      return { type: 'test-git-config-finished', configId: action.configId, exportAttempt, pendingExportId: action.pendingExportId };
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

  const handleGitConfigAdd = useCallback(async () => { 
    dispatch({ type: 'add-git-config' })
  }, [dispatch]);

  const handleGitConfigTest = useCallback(async (configId: string) => { 
    dispatch({ type: 'test-git-config', configId, pendingExportId: uuid() })
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
                <GitConfigEditor config={config} onTest={handleGitConfigTest} onSave={handleGitConfigSave} onDelete={handleGitConfigRemove} />
                <GitExportAttemptsTable config={config} />
              </Item>
            )}
          </TabPanels>
        </Tabs>
      ) : undefined}

    </AppLayout>
  );
}
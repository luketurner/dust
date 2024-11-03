'use client';

import { createGitExportConfig, removeGitExportConfig, saveAndTestGitExportConfig, updateGitExportConfig } from "@/actions/gitExportConfig";
import { recalculateEmbeddings } from "@/actions/task";
import { setUserAiConfig } from "@/actions/user";
import AppLayout from "@/components/AppLayout";
import GitConfigEditor from "@/components/GitConfigEditor";
import GitExportAttemptsTable from "@/components/GitExportAttemptsTable";
import { MODELS } from "@/config";
import { EffectErrorAction, ServerErrorAction, useClientServerReducer } from "@/hooks/clientServerReducer";
import { ClientGitExportConfig, ClientGitExportConfigWithAttempts } from "@/models/gitExportConfig";
import { AIConfig, getAIConfig } from "@/models/userClient";
import { ActionButton, Button, Form, Heading, Item, Picker, Switch, TabList, TabPanels, Tabs, View } from "@adobe/react-spectrum";
import { GitExportAttempt, User } from "@prisma/client";
import { ToastQueue } from "@react-spectrum/toast";
import { useCallback } from "react";
import { v4 as uuid } from "uuid";

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
  data: Partial<ClientGitExportConfig>;
}

interface TestGitConfigFinishedAction {
  type: 'test-git-config-finished';
  configId: string;
  exportAttempt: GitExportAttempt;
  pendingExportId: string;
}

interface UpdateAIConfigAction {
  type: 'update-ai-config';
  aiConfig: AIConfig;
}

export type SettingsPageAction = EffectErrorAction | ServerErrorAction | AddGitConfigAction | AddGitConfigFinishedAction | UpdateGitConfigAction | RemoveGitConfigAction | TestGitConfigAction | TestGitConfigFinishedAction | UpdateAIConfigAction;

function stateReducer(state: SettingsPageState, action: SettingsPageAction) {
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
      Object.assign(
        state.gitExportConfigs.find(({ id }) => id === action.configId)!.exportAttempts?.find(({ id }) => id === action.pendingExportId)!,
        action.exportAttempt
      );
      break;
    case 'update-ai-config':
      state.user.aiConfig = action.aiConfig as Record<string, any>;
      break;
  }
}

async function effectReducer(action: SettingsPageAction) {
  switch (action.type) {
    case 'server-error':
      ToastQueue.negative('Error: ' + ((action.error as Error)?.message ?? 'Unknown error'));
      break;
    case 'test-git-config-finished':
      if (action.exportAttempt.status === 'failed') ToastQueue.negative('Git export failed.');
      if (action.exportAttempt.status === 'success') ToastQueue.positive('Git export success!');
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
      const exportAttempt = await saveAndTestGitExportConfig(action.configId, action.data);
      return { type: 'test-git-config-finished', configId: action.configId, exportAttempt, pendingExportId: action.pendingExportId };
    case 'update-ai-config':
      await setUserAiConfig(action.aiConfig);
      break;
  }
}


export default function SettingsPageClient({ user, gitExportConfigs }: SettingsPageClientProps) {
  const [state, dispatch] = useClientServerReducer<SettingsPageState, SettingsPageAction>(stateReducer, effectReducer, serverReducer, {
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

  const handleGitConfigTest = useCallback(async (configId: string, data: ClientGitExportConfig) => { 
    dispatch({ type: 'test-git-config', configId, data, pendingExportId: uuid() })
  }, [dispatch]);

  const handleRecalculateEmbeddings = useCallback(async () => { 
    await recalculateEmbeddings();
  }, []);

  const handleEmbeddingModelChanged = useCallback(async (modelName: any) => {
    dispatch({ type: 'update-ai-config', aiConfig: { embeddingModel: modelName } })
  }, [dispatch]);

  return (
    <AppLayout user={user} breadcrumbs={[{ label: 'Settings', url: '/settings', key: 'settings' }]}>
      {user.useAI ? <>
        <Heading level={1} UNSAFE_className="text-xl" marginY="single-line-height">AI Settings</Heading>
        <Switch isSelected={user.useAI} isReadOnly={true}>AI Features Enabled</Switch>
        <Button variant="primary" onPress={handleRecalculateEmbeddings}>Recalculate embeddings for all tasks (debug)</Button>
        <Form maxWidth="size-3600">
          <Picker label="Embedding model"
           items={Object.entries(MODELS).map(([modelName, config]) => ({ modelName, ...config}))}
           onSelectionChange={handleEmbeddingModelChanged}
           selectedKey={getAIConfig(state.user).embeddingModel}>
            {(item) => <Item key={item.modelName}>{item.displayName}</Item>}
          </Picker>
        </Form>
      </> : null}
      <Heading level={1} UNSAFE_className="text-xl" marginY="single-line-height">Git Export Settings</Heading>
      <View marginBottom="single-line-height">
        Dust can export a snapshot of your user data (incl. all tasks, tags, historical agendas, etc.) to one or more Git repo(s) every two hours.
        The repos can then be used as a versioned backup of your task data. User data is exported in a raw JSON format.<br /><br />
        In order to do so, Dust will need to know the Git <em>Remote URL</em> and the <em>Branch name</em> on the remote to push to.
        (Note that only SSH-style remote URLs will work.)
        <br /><br />
        You&apos;ll also need to authorize Dust&apos;s <em>SSH Public Key</em> to access your repo.
        In Github, this is done by adding the SSH Public Key as a <em>Deploy Key</em> in the repository
        settings. Make sure to enable write access. (Also, note that each export configuration has its own unique public key.)
      </View>
      <ActionButton onPress={handleGitConfigAdd}>Add Git Export</ActionButton>
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
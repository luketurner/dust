'use client';

import { ActionMenu, Grid, Item, ToggleButton, View } from "@adobe/react-spectrum";
import { Agenda, Task } from "@prisma/client";
import { useCallback } from "react";
import CheckmarkCircleOutline from "@spectrum-icons/workflow/CheckmarkCircleOutline";

export interface AgendaTaskRowAction {
  type: 'toggle' | 'defer' | 'edit'
  task: Task
  agenda?: Agenda
}

export interface TaskProps {
  task: Task
  onAction?(action: AgendaTaskRowAction): void
}

export default function AgendaTaskRow({ task, onAction = () => {} }: TaskProps) {

  const toggleTask = useCallback(() => {
    onAction({ type: 'toggle', task });
  }, [task, onAction]);

  const handleMenuAction = useCallback((key: string) => {
    onAction({ type: key, task });
  }, []);

  return (
    <Grid areas={["toggle name actions",
                  "toggle tags actions"]}
              rows={["1fr", "1fr"]}
              columns={["max-content", "1fr", "max-content"]}
              columnGap="size-100"
              alignItems="center"
              UNSAFE_className="rounded border shadow p-1">
      <View gridArea="toggle">
        <ToggleButton isEmphasized isQuiet onPress={toggleTask} isSelected={task.completed}>
          <CheckmarkCircleOutline />
        </ToggleButton>
      </View>
      <View alignSelf="start" gridArea="name">{task.name}</View>
      <View gridArea="tags">#foo #bar</View>
      <View gridArea="actions">
        <ActionMenu isQuiet onAction={handleMenuAction}>
          <Item key="defer">Defer</Item>
          <Item key="edit">Edit</Item>
        </ActionMenu>
      </View>
    </Grid>
  )
}
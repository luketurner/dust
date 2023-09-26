'use client';

import { updateTask, deleteTask as deleteTaskAction } from "@/actions/task";
import { ActionMenu, Grid, Item, ToggleButton, View } from "@adobe/react-spectrum";
import { Task } from "@prisma/client";
import { ChangeEvent, useCallback, useState } from "react";
import { Button } from "react-aria-components";
import CheckmarkCircleOutline from "@spectrum-icons/workflow/CheckmarkCircleOutline";

export interface AgendaTaskRowAction {
  type: 'toggle'
  task: Task
}

export interface TaskProps {
  task: Task
  onAction?(action: AgendaTaskRowAction): void
}

export default function AgendaTaskRow({ task, onAction = () => {} }: TaskProps) {

  const toggleTask = useCallback(() => {
    updateTask(task.id, {
      completed: !task.completed
    });
    onAction({
      type: 'toggle',
      task
    });
  }, [task, onAction]);

  const handleMenuAction = useCallback((key: string) => {
    // switch (key) {
    //   case 'logout':
    //     signOut();
    //     break;
    //   case 'manage':
    //     router.push('/manage');
    //     break;
    // }
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
          <Item key="edit">Edit</Item>
          <Item key="defer">Defer</Item>
          <Item key="archive">Archive</Item>
        </ActionMenu>
      </View>
    </Grid>
  )
}
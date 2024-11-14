'use client';

import { ActionMenu, Flex, Grid, Item, ToggleButton, View } from "@adobe/react-spectrum";
import { Key, useCallback } from "react";
import CheckmarkCircleOutline from "@spectrum-icons/workflow/CheckmarkCircleOutline";
import { useIsEmbedded } from "@/hooks/isEmbedded";
import ImportantIcon from "./icons/ImportantIcon";
import UrgentIcon from "./icons/UrgentIcon";
import SomedayIcon from "./icons/SomedayIcon";
import { TaskWithTags } from "@/models/task";

export interface AgendaTaskRowProps {
  task: TaskWithTags
  onToggle?(taskId: string, completed: boolean): void
  onDefer?(taskId: string): void
  onEdit?(taskId: string): void
}

export default function AgendaTaskRow({ task, onToggle = () => {}, onDefer = () => {}, onEdit = () => {} }: AgendaTaskRowProps) {

  const handleToggle = useCallback(() => onToggle(task.id, !task.completed), [task.id, task.completed, onToggle]);

  const handleMenuAction = useCallback((key: Key) => {
    switch (key) {
      case 'defer': return onDefer(task.id);
      case 'edit': return onEdit(task.id);
    }
  }, [onDefer, onEdit, task.id]);

  const isEmbedded = useIsEmbedded();

  return (
    <Grid areas={["toggle name actions",
                  "toggle tags actions"]}
              rows={["1fr", "1fr"]}
              columns={["max-content", "1fr", "max-content"]}
              columnGap="size-100"
              alignItems="center"
              UNSAFE_className="rounded border shadow p-1">
      <View gridArea="toggle">
        <ToggleButton isEmphasized isQuiet onPress={handleToggle} isSelected={task.completed}>
          <CheckmarkCircleOutline />
        </ToggleButton>
      </View>
      <View alignSelf="start" gridArea="name">{task.name}</View>
      <Flex gridArea="tags" direction="row" wrap alignItems="center">
        {task.important ? <ImportantIcon /> : undefined}
        {task.urgent ? <UrgentIcon /> : undefined}
        {task.someday ? <SomedayIcon /> : undefined}
        {task.tags.map(tag => (
          <View marginEnd="size-50" key={tag.id}>#{tag.name}</View>
        ))}
      </Flex>
      <View gridArea="actions">
        <ActionMenu isQuiet onAction={handleMenuAction} isDisabled={isEmbedded}>
          <Item key="defer">Defer</Item>
          <Item key="edit">Edit</Item>
        </ActionMenu>
      </View>
    </Grid>
  )
}
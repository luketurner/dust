'use client';

import { ActionMenu, Flex, Grid, Item, TagGroup, ToggleButton, View } from "@adobe/react-spectrum";
import { Tag, Task } from "@prisma/client";
import { Key, useCallback } from "react";
import CheckmarkCircleOutline from "@spectrum-icons/workflow/CheckmarkCircleOutline";
import Flag from "@spectrum-icons/workflow/Flag";
import HotFixes from "@spectrum-icons/workflow/HotFixes";
import { useIsEmbedded } from "@/hooks/isEmbedded";

type TaskWithTags = Task & { tags: Tag[] }

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
        
        {task.important ? <Flag aria-label="Important" size="XS" marginEnd="size-50" color="informative" /> : undefined}
        {task.urgent ? <HotFixes aria-label="Urgent" size="XS" marginEnd="size-50" color="negative" /> : undefined}
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
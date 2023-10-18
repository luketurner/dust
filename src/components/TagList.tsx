import { ActionMenu, Item, ListView, Selection, Text } from "@adobe/react-spectrum";
import { Tag } from "@prisma/client";
import { Key, useCallback } from "react";

export interface TagListProps {
  tags: Tag[];
  onTagAction: (tagId: string, actionKey: Key) => void;
  onSelectionChange: (keys: Selection) => void;
}

export default function TagList({ tags, onTagAction, onSelectionChange }: TagListProps) {
  return (
    <ListView isQuiet items={tags} selectionMode="multiple" aria-label="List of selected tags" onSelectionChange={onSelectionChange} width="single-line-width">
      {(tag) => (
        <Item key={tag.id} textValue={tag.name}>
          <TagListItem tag={tag} onTagAction={onTagAction} />
        </Item>
      )}
    </ListView>
  );
}

interface TagListItemProps {
  tag: Tag;
  onTagAction: (tagId: string, key: Key) => void;
}

function TagListItem({ tag, onTagAction }: TagListItemProps) {
  const handleTagAction = useCallback((key: Key) => onTagAction(tag.id, key), [tag.id, onTagAction]);
  return (
    <>
      <Text>{tag.name}</Text>
      <ActionMenu onAction={handleTagAction}>
        <Item key="edit">Edit...</Item>
        <Item key="delete">Delete</Item>
      </ActionMenu>
    </>
  );
}
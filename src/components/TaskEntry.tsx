'use client';

import { addTasksFromText } from '@/actions/task';
import { useState } from 'react';
import {TextField, Label, TextArea, Text, Button} from 'react-aria-components';

export interface TaskEntryProps {
  onSubmit?: (v: string) => void;
}

export default function TaskEntry({ onSubmit = addTasksFromText }: TaskEntryProps) {
  const [taskInput, setTaskInput] = useState('');
  return (
    <TextField>
      <Label>Enter tasks</Label>
      <TextArea value={taskInput} placeholder={'Buy socks\n#shopping\nGet six pairs'} onChange={(e) => setTaskInput(e.target.value)} />
      <Text slot="description">Add a thingy</Text>
      <Button onPress={() => onSubmit(taskInput)}>Add tasks</Button>
    </TextField>
  );
}
'use client';

import { ChangeEvent, useCallback, useState } from 'react';
import {TextField, Label, TextArea, Button} from 'react-aria-components';

export interface TaskEntryProps {
  onSubmit?: (v: string) => void;
}

export default function TaskEntry({ onSubmit = () => {} }: TaskEntryProps) {
  const [taskInput, setTaskInput] = useState('');

  const handleSubmit = useCallback(() => {
    onSubmit(taskInput);
    setTaskInput('');
  }, [taskInput]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setTaskInput(e.target.value);
  }, []);

  return (
    <TextField className="flex flex-col flex-nowrap items-start w-full my-2">
      <Label>Write new tasks into the box:</Label>
      <div className="flex flex-row flex-nowrap w-full">
        <TextArea
          className="flex-grow h-24 border border-slate-500 p-1"
          value={taskInput}
          placeholder={'Buy socks\n#shopping\nGet six pairs'}
          onChange={handleChange}
        />
        <Button className="border border-slate-500 text-slate-700 rounded rounded-l-none border-l-0 hover:bg-slate-200 w-12" onPress={handleSubmit}>Send 'em!</Button>
      </div>
      <div className="m-2 text-slate-500 text-sm text-left" slot="description">
        <p>Input examples:</p>
        <p className="m-2">
          This is my task title
          <br />
          #tag !important
          <br />
          You can include a multiline description.
          <br />
          End the description with a blank line.
          <br />
          <br />
          This is a task with no description
          <br />
          #tag1 #tag2
          
        </p>
      </div>
    </TextField>
  );
}
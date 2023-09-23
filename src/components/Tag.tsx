'use client';

import { Tag as AriaTag, Button, TagProps } from "react-aria-components";

export default function Tag({ children, ...props }: TagProps) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    <AriaTag textValue={textValue} {...props}>
      {({ allowsRemoving }) => (
        <>
          {children}
          {allowsRemoving && <Button slot="remove">X</Button>}
        </>
      )}
    </AriaTag>
  );
}
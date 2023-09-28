'use client';

import { Footer, Flex } from "@adobe/react-spectrum";

export default function AppFooter() {
  return (
    <Footer gridArea="footer" width="100%">
      <Flex direction="row" wrap justifyContent="center">
        <a className="underline" href="https://github.com/luketurner/dust">Github</a>
      </Flex>
      <Flex direction="row" wrap justifyContent="center">
        <span>Copyright Luke Turner 2023</span>
      </Flex>
  </Footer>
  );
}
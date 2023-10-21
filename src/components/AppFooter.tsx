'use client';

import { Footer, Flex, Link as SpectrumLink } from "@adobe/react-spectrum";
import Link from "next/link";

export default function AppFooter() {
  return (
    <Footer gridArea="footer" width="100%">
      <Flex direction="row" wrap justifyContent="center" gap="single-line-height">
        <SpectrumLink><Link href="/">Home</Link></SpectrumLink>
        <SpectrumLink><Link href="/manual">Manual</Link></SpectrumLink>
        <SpectrumLink><a href="https://github.com/luketurner/dust">Source (Github)</a></SpectrumLink>
      </Flex>
      <Flex direction="row" wrap justifyContent="center">
        <span>Copyright Luke Turner 2023</span>
      </Flex>
  </Footer>
  );
}
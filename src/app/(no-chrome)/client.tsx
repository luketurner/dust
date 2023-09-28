'use client';

import AppFooter from "@/components/AppFooter";
import AppHeader from "@/components/AppHeader";
import AppLayout from "@/components/AppLayout";
import QuoteBlock from "@/components/QuoteBlock";
import ThreeSpotLayout from "@/components/ThreeSpotLayout";
import { Button, Flex, Heading, View } from "@adobe/react-spectrum";
import { Quote } from "@prisma/client";
import { signIn } from "next-auth/react";

export interface IndexPageClientProps {
  quote: Quote;
}

export default async function IndexPageClient({ quote }: IndexPageClientProps) {

  return (
    <AppLayout>
      <ThreeSpotLayout>
        <AppHeader />
        <Heading gridArea="a" UNSAFE_className="text-4xl" level={1} justifySelf={{base: 'center', 'M': 'end'}}>
          Dust
        </Heading>
        <View gridArea="b" justifySelf={{base: 'center', 'M': 'end'}}>
          <QuoteBlock quote={quote} />
        </View>
        <Flex gridArea="c" direction="column" justifyContent="center" marginX={{ base: 'auto', 'M': 0 }} gap="single-line-height">
          <p className="text-lg">Task management for people who don't like tasks.</p>
          <Button alignSelf="center" variant="cta" onPress={(e) => signIn('github')}>
            Log in with Github
          </Button>
        </Flex>
        <AppFooter />
      </ThreeSpotLayout>
    </AppLayout>
  );
}
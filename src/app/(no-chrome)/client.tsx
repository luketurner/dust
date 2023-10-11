'use client';

import AppLayout from "@/components/AppLayout";
import QuoteBlock from "@/components/QuoteBlock";
import ThreeSpotLayout from "@/components/ThreeSpotLayout";
import { Button, Flex, Heading, View } from "@adobe/react-spectrum";
import { Quote } from "@prisma/client";
import { signIn } from "next-auth/react";
import TinyAgendaPage from "@/components/TinyAgendaPage";
import { DateTime } from "luxon";

export interface IndexPageClientProps {
  quote: Quote;
}

export default function IndexPageClient({ quote }: IndexPageClientProps) {

  return (
    <AppLayout>
      <ThreeSpotLayout>
        <Heading gridArea="a" UNSAFE_className="text-6xl font-thin" level={1} justifySelf={{base: 'center', 'M': 'end'}}>
          Dust
        </Heading>
        <View gridArea="b" justifySelf={{base: 'center', 'M': 'end'}}>
          <QuoteBlock quote={quote} />
        </View>
        <Flex gridArea="c" direction="column" marginTop={{base: '0', 'M': "single-line-height"}} marginX={{ base: 'auto', 'M': 0 }} gap="single-line-height">
          <p className="text-lg text-center">Task management for people who don&apos;t like tasks.</p>
          <TinyAgendaPage date={DateTime.now().toISODate()!} quote={quote} />
          <Button alignSelf="center" variant="accent" onPress={(e) => signIn('github')}>
            Log in with Github
          </Button>
        </Flex>
      </ThreeSpotLayout>
    </AppLayout>
  );
}
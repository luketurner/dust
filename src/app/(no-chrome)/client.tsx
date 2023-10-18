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
        <Flex gridArea="c" direction="column" marginTop={{base: '0', 'M': "single-line-height"}} marginX={{ base: 'auto', 'M': 0 }} >
          <View UNSAFE_className="text-lg text-center" marginBottom="size-100">Task management for people who don&apos;t like tasks.</View>
          <View elementType="ul" UNSAFE_className="text-center" marginBottom="single-line-height">
            <li>Add all your tasks.</li>
            <li>Every day, Dust picks 3 tasks for you to do.</li>
            <li>Urgent/Important tasks are picked first.</li>
            <li>Someday/Maybe tasks are picked last.</li>
            <li>Automatically sync task data with Git repo(s).</li>
          </View>
          <TinyAgendaPage date={DateTime.now().toISODate()!} quote={quote} />
          <Button alignSelf="center" variant="accent" onPress={(e) => signIn('github')} marginTop="single-line-height">
            Log in with Github
          </Button>
        </Flex>
      </ThreeSpotLayout>
    </AppLayout>
  );
}
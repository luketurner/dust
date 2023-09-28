import { DateTime } from "luxon";
import { prisma } from "./db/client";
import { Quote } from "@prisma/client";
import { randomInt } from "crypto";

export async function getDailyQuote(date: string): Promise<Quote> {
  const dateTime = DateTime.fromISO(date);
  date = dateTime.toISO()!;

  // 1. Existing date?
  const existingDay = await prisma.day.findUnique({
    where: { date },
    include: { quote: true }
  });

  if (existingDay) {
    return existingDay.quote;
  }

  // 2. Try find a quote.
  // Finds the 5 that have been quoted least recently, and randomly choose one.
  const quotes = await prisma.quote.findMany({
    take: 5,
    orderBy: { lastQuotedOn: 'asc' },
    select: {
      id: true
    },
  });

  if (quotes.length === 0) {
    return {
      content: 'This is a test quote.\nLorem ipsum a.k.a. ipsum lorem\nAnd the racecar rounds\n  the bend',
      author: 'Luke Turner',
      lastQuotedOn: null,
      source: null,
    } as Quote;
  }

  const quote = quotes[randomInt(quotes.length)];

  // 3. Assign the quote (using upsert to avoid race conditions)
  const newDay = await prisma.day.upsert({
    where: { date },
    update: {},
    create: {
      date,
      quote: { connect: { id: quote.id } }
    },
    include: {
      quote: true
    }
  });

  const { lastQuotedOn } = await prisma.quote.update({
    where: { id: quote.id },
    data: {
      lastQuotedOn: date
    },
    select: {
      lastQuotedOn: true
    }
  });

  newDay.quote.lastQuotedOn = lastQuotedOn;

  return newDay.quote;
}
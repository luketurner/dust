import { prisma } from "./db/client";

export interface ParsedTaskInput {
  name: string;
  tags: string[];
  flags: string[];
  description: string;
}

export function parseTaskInput(text: string): ParsedTaskInput[] {
  const blocks = text.split('\n\n');
  const tasks: ParsedTaskInput[] = [];
  for (const block of blocks) {
    if (block === '') continue;
    const [name, tagline, ...description] = block.split('\n');
    const { tags, flags } = parseTagLine(tagline);

    if (name) {
      tasks.push({
        name,
        tags,
        flags,
        description: description.join('\n')
      })
    }
  }
  return tasks;
}

export function parseTagLine(line?: string): { tags: string[], flags: string[] } {
  const tags = [];
  const flags = [];
  for (const piece of (line ?? '').split(/\s/g)) {
    if (piece.match(/^#\w+$/)) {
      tags.push(piece.slice(1));
    }
    if (piece.match(/^!\w+$/)) {
      if (piece === '!i') { 
        flags.push('important');
      } else if (piece === '!u') {
        flags.push('urgent');
      } else {
        flags.push(piece.slice(1))
      }
    }
  }
  return { tags, flags }
}

export async function getHighestDisplayOrderServer(userId: string) {
  return (await prisma.task.findFirst({
    where: {
      userId
    },
    orderBy: {
      displayOrder: 'desc'
    },
    select: {
      displayOrder: true
    }
  }))?.displayOrder ?? 0;
}
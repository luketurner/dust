import { prisma } from "./db/client";

export interface ParsedTaskInput {
  name: string;
  tags: string[];
  description: string;
}

export function parseTaskInput(text: string): ParsedTaskInput[] {
  const blocks = text.split('\n\n');
  const tasks: ParsedTaskInput[] = [];
  for (const block of blocks) {
    if (block === '') continue;
    const [name, tagline, ...description] = block.split('\n');
    const { tags } = parseTagLine(tagline);

    if (name) {
      tasks.push({
        name,
        tags,
        description: description.join('\n')
      })
    }
  }
  return tasks;
}

export function parseTagLine(line?: string): { tags: string[] } {
  const tags = [];
  for (const piece of (line ?? '').split(/\s/g)) {
    if (piece.match(/^#\w+$/)) {
      tags.push(piece.slice(1));
    }
  }
  return { tags };
}
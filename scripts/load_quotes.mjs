// Trusted quotes only! SQL injection risk!

import { parse } from 'yaml';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { v4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const path = join(dirname(__filename), '..', 'local', 'quotes.yml');
const outputPath = join(dirname(__filename), '..', 'local', 'quotes.sql');
console.log("reading from", path);
const rawContent = readFileSync(path, 'utf8');
const { quotes: quoteDefinitions } = parse(rawContent);

const quoteList = [];

for (const [author, sources] of Object.entries(quoteDefinitions)) {
  for (const [source, quotes] of Object.entries(sources)) {
    for (const quote of quotes) {
      quoteList.push({
        id: v4(),
        author,
        source,
        content: quote.trim()
      })
    }
  }
}

const statementList = quoteList.map(({ id, author, source, content }) => (
  `INSERT INTO "Quote" (id, author, source, content)
VALUES (
  '${id}',
  encode(decode('${Buffer.from(author).toString('base64')}', 'base64'), 'escape'),
  encode(decode('${Buffer.from(source).toString('base64')}', 'base64'), 'escape'),
  encode(decode('${Buffer.from(content).toString('base64')}', 'base64'), 'escape')
);`
));

console.log("writing: ", outputPath);
writeFileSync(outputPath, statementList.join('\n'));

console.log("done")
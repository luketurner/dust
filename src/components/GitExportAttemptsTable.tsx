'use client';

import { ClientGitExportConfigWithAttempts } from "@/models/gitExportConfig";
import { Cell, Column, Row, StatusLight, TableBody, TableHeader, TableView } from "@adobe/react-spectrum";
import { DateTime } from "luxon";


export interface GitExportAttemptsTableProps {
  config: ClientGitExportConfigWithAttempts
}

export default function GitExportAttemptsTable({ config }: GitExportAttemptsTableProps) {
  return (
    <TableView>
      <TableHeader>
        <Column maxWidth={120}>Status</Column>
        <Column>Result</Column>
        <Column maxWidth={200}>Started</Column>
        <Column maxWidth={200}>Finished</Column>
      </TableHeader>
      <TableBody items={config.exportAttempts ?? []}>
        {(attempt) => (
          <Row>
            <Cell>
              <StatusLight variant={attempt.status === 'failed' ? 'negative' : attempt.status === 'success' ? 'positive' : 'neutral'} UNSAFE_className="capitalize">
                {attempt.status}
              </StatusLight>
            </Cell>
            <Cell>{attempt.result}</Cell>
            <Cell>{attempt.startedAt ? DateTime.fromJSDate(attempt.startedAt).toLocaleString(DateTime.DATETIME_SHORT) : 'N/A'}</Cell>
            <Cell>{attempt.finishedAt ? DateTime.fromJSDate(attempt.finishedAt).toLocaleString(DateTime.DATETIME_SHORT) : 'N/A'}</Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  )
}
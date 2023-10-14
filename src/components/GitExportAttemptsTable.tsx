'use client';

import { ClientGitExportConfigWithAttempts } from "@/app/(app)/settings/client";
import { Cell, Column, Row, TableBody, TableHeader, TableView } from "@adobe/react-spectrum";
import { DateTime } from "luxon";


export interface GitExportAttemptsTableProps {
  config: ClientGitExportConfigWithAttempts
}

export default function GitExportAttemptsTable({ config }: GitExportAttemptsTableProps) {
  return (
    <TableView>
      <TableHeader>
        <Column>Status</Column>
        <Column>Result</Column>
        <Column>Started</Column>
        <Column>Finished</Column>
      </TableHeader>
      <TableBody items={config.exportAttempts}>
        {(attempt) => (
          <Row>
            <Cell>{attempt.status}</Cell>
            <Cell>{attempt.result}</Cell>
            <Cell>{attempt.startedAt ? DateTime.fromJSDate(attempt.startedAt).toLocaleString(DateTime.DATETIME_SHORT) : 'N/A'}</Cell>
            <Cell>{attempt.finishedAt ? DateTime.fromJSDate(attempt.finishedAt).toLocaleString(DateTime.DATETIME_SHORT) : 'N/A'}</Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  )
}
'use client';

import AppLayout from "@/components/AppLayout";
import ImportantIcon from "@/components/ImportantIcon";
import SomedayIcon from "@/components/SomedayIcon";
import UrgentIcon from "@/components/UrgentIcon";
import { Link } from "@adobe/react-spectrum";
import { User } from "@prisma/client";
import NextLink from "next/link";

export interface ManualPageClientProps {
  user: User | null | undefined;
}

export default function ManualPageClient({ user }: ManualPageClientProps) {

  return (
    <AppLayout user={!!user}>
      <main className="prose">
        <p>
          This is the manual for <Link><NextLink href="/">Dust</NextLink></Link>, a free, <Link><a href="https://github.com/luketurner/dust">open-source</a></Link>, online task management tool.
        </p>
        <p>
          Please be aware that Dust is just a side-project of mine, and provided with no guarantees of functionality, support, or long-term maintenance.
        </p>
        <h2>Daily agenda</h2>
        <p>
          The <em>Daily agenda</em> page is where you should spend most of your time. Dust selects 3 of your active tasks to include in
          the agenda each day.
        </p>
        <p>
          The tasks are selected with a simple priority system:
        </p>
        <ol>
          <li><strong><ImportantIcon/>Important and <UrgentIcon/>Urgent</strong> tasks are selected first.</li>
          <li><strong><UrgentIcon/>Urgent</strong> (but not Important) tasks are selected second.</li>
          <li><strong><ImportantIcon/>Important</strong> (but not Urgent) tasks are selected third.</li>
          <li>Normal tasks are selected fourth.</li>
          <li><strong><SomedayIcon/>Someday/Maybe</strong> tasks are selected fifth.</li>
        </ol>
        <p>
          Within each priority group, the tasks are selected randomly.
          Dust discourages users from micromanaging their tasks, so prioritization is deliberately coarse-grained;
          there is no ability to rearrange the order of tasks within a priority group.
        </p>
        <p>
          Tags (e.g. <em>#groceries</em>) are provided for users to organize and find related tasks, but don&apos;t impact
          how tasks are prioritized or which tasks are selected for the agenda.
        </p>
        <p>
          If you can&apos;t do some of the selected tasks for the day, you can <em>Defer</em> them for another day to get them out of your face.
        </p>
        <p>
          Once you&apos;ve completed (or deferred) all your tasks, you will also have the option to pick more tasks for the day.
          I recommend not using this feature unless you really feel excited by doing some more tasks.
        </p>
        <h2>Manage tasks</h2>
        <p>
          The <em>Manage tasks</em> page provides a filterable list of all your tasks. You can view:
        </p>

        <ul>
          <li><strong>Active</strong> tasks</li>
          <li><strong>Completed</strong> tasks</li>
          <li><strong>Archived</strong> tasks</li>
          <li><strong><SomedayIcon/>Someday/Maybe</strong> tasks</li>
        </ul>

        <p>
          You can also filter by tag (e.g. <em>#groceries</em>) or by flag (e.g. <strong><UrgentIcon/>Urgent</strong>).
        </p>

        <p>
          Dust has a limit of 100 active tasks per user, which is also displayed on this screen.
          This is not a technical limitation, but a deliberate effort to force a certain level of task curation.
          In particular, users are strongly encouraged to mark tasks as <strong><SomedayIcon/>Someday/Maybe</strong> if
          they aren&apos;t immediately relevant. (Note that <strong><SomedayIcon/>Someday/Maybe</strong> tasks, along with completed
          and archived tasks, aren&apos;t considered &quot;active&quot; and so don&apos;t count against this limit.)
        </p>

        <p>
          This page is also where you can create and manage your tags. You can create new tags with the <em>New tag...</em>
          button, edit the name of existing tags (which does not break the relationship any tasks have with that tag), and delete
          tags. Tags cannot be archived.
        </p>
        
        <h2>Settings</h2>

        <p>The <em>Settings</em> page is where you configure general, user-level options for your Dust account.</p>
        <p>Currently, the only real &quot;setting&quot; is Git export configuration.</p>

        <h3>Git export config</h3>

        <p>You can have one or more Git export configurations enabled for your account.</p>

        <p>
          Every two hours, Dust will export all your user data to all your configured Git remotes:
        </p>

        <ol>
          <li>Fetch the <em>Branch name</em> from the <em>Remote URL</em>.</li>
          <li>Export the latest user data and, if there were changes, create a commit.</li>
          <li>Push any commits that were created back to the remote.</li>
        </ol>

        <p>
          Currently, Dust only supports SSH key authentication for these operations. The <em>Remote URL</em> must be an SSH-style URL,
          and the Git remote must be configured to allow the Git configuration&apos;s <em>SSH Public Key</em> that&apos;s displayed in the Dust
          settings page.
        </p>
        <p>
          In Github, for example, the Dust <em>SSH Public Key</em> should be added in the Deploy Keys section of the Git repository settings.
          Make sure to enable write access.
        </p>
        <p>
          Note each Git export configuration receives a unique SSH public key.
        </p>
        <p>
          Also note, Dust saves the SSH host key of the Git server in memory to mitigate MITM attacks. If the SSH host key of your Git
          server changes, you&apos;ll have to wait for the Dust instance to be restarted before your Git export will start working again.
        </p>
        <p>
          As a final note, this Git export functionality is entirely independent from Dust&apos;s usage of Github as an OAuth identity provider.
          The Git export is not Github-specific and will work with any Git server that supports SSH authentication.
        </p>
      </main>
    </AppLayout>
  );
}
/* Periodic Git Export Script

Note that this needs to be run with Bun, or some other Node-alike that:
  (1) supports TS (including respecting the "paths" mapping in tsconfig.json)
  (2) supports top-level async/await

*/
import { allUsersReport } from "@/models/user";
import { exportAll } from "@/models/gitExportConfig";

try {
  console.log(await allUsersReport());
  console.log("exporting...");
  await exportAll();
  console.log("Success");
} catch (e) {
  console.error("Error", e);
}
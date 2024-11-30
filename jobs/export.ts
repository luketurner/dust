import { allUsersReport } from "@/models/user";
import { exportAll } from "@/models/gitExportConfig";

const main = async () => {
  console.log(await allUsersReport());
  console.log("exporting...");
  await exportAll();
}

main()
.then(() => console.log("Success!"))
.catch((e) => console.error("Failure:", e));
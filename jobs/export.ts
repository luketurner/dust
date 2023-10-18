import { exportAll } from "../src/models/gitExportConfig";

const main = async () => {
  console.log("exporting...")
  await exportAll();
}

main()
.then(() => console.log("Success!"))
.catch((e) => console.error("Failure:", e))
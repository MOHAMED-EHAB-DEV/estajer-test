export async function register() {
  // This ensures it only runs on the Node server, not the edge or browser
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NODE_APP_INSTANCE && process.env.NODE_APP_INSTANCE !== "0")
      return console.log(
        `Skipping Cron Jobs on Instance ${process.env.NODE_APP_INSTANCE}`,
      );

    if (!process.env.Run_Cron)
      return console.log("Cron jobs are disabled (Run_Cron is not set)");

    // Dynamically import the cron jobs
    const { startDeliveryNotifications } =
      await import("./lib/cron/deliveryNotifications.js");
    const {
      startContractHandling,
      startUnfinishedContracts,
      // startOrderRejection,
    } = await import("./lib/cron/contractHandling.js");
    const { startDatabaseBackupJob } =
      await import("./lib/cron/databaseBackup.js");
    // const { startCleanupDeletedProducts } = await import(
    //   "./lib/cron/cleanupDeletedProducts.js"
    // );

    // Start jobs
    startDeliveryNotifications();
    startContractHandling();
    startUnfinishedContracts();
    startDatabaseBackupJob();
    // startOrderRejection();
    // startCleanupDeletedProducts();
  }
}

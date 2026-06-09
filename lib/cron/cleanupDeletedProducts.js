import { CronJob } from "cron";
import connectDB from "../db";
import Product from "@/models/Product";
import cloudinary from "../cloudinary";

let cleanupJob = null;

export const startCleanupDeletedProducts = () => {
  if (cleanupJob) {
    console.log("Stopping existing cleanup cron job");
    cleanupJob.stop();
  }

  // Run daily at 9 AM
  cleanupJob = new CronJob(
    "0 9 * * *",
    async () => {
      try {
        await connectDB();
        console.log("Running cleanup deleted products job...");

        // Find products deleted more than 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const productsToDelete = await Product.find({
          deleted: true,
          deletedAt: { $lte: thirtyDaysAgo },
        });

        if (productsToDelete.length === 0)
          return console.log("No products to permanently delete");

        console.log(
          `Found ${productsToDelete.length} products to permanently delete`
        );

        // Delete images from cloudinary and permanently delete products
        for (const product of productsToDelete) {
          try {
            // Delete images from cloudinary
            await Promise.all(
              product.images.map(async (imageUrl) => {
                try {
                  const publicId = imageUrl.preview
                    .split("/")
                    .pop()
                    .split(".")[0];
                  await cloudinary.uploader.destroy(`products/${publicId}`);
                  console.log(`Deleted image: ${publicId}`);
                } catch (error) {
                  console.error(
                    `Failed to delete image ${imageUrl.preview}:`,
                    error
                  );
                }
              })
            );

            // Permanently delete the product
            await Product.findByIdAndDelete(product._id);
            console.log(`Permanently deleted product: ${product._id}`);
          } catch (error) {
            console.error(`Failed to delete product ${product._id}:`, error);
          }
        }

        console.log(
          `Cleanup completed: ${productsToDelete.length} products permanently deleted`
        );
      } catch (error) {
        console.error("Cleanup deleted products cron job error:", error);
      }
    },
    null,
    true,
    "Asia/Riyadh"
  );

  cleanupJob.start();
  console.log("Cleanup deleted products cron job started");
};

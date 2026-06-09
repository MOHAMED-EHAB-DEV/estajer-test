import { drive as googleDrive, auth } from "@googleapis/drive";
import archiver from "archiver";
import { promises as fs, createReadStream, createWriteStream } from "fs";
import { Readable } from "stream";
import path from "path";
// Import EJSON directly from the mongodb driver
import { EJSON } from "bson";
import { MongoClient } from "mongodb";
import { CronJob } from "cron";

const MONGODB_URI = process.env.MONGODB_URI;
const DATA_CACHE_DIR = path.join(process.cwd(), ".cache", "data");

export async function runDatabaseBackup() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    const collections = await db.listCollections().toArray();
    console.log(
      `[Database Backup] Starting backup of ${collections.length} collections...`,
    );

    await fs.mkdir(DATA_CACHE_DIR, { recursive: true });

    const date = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Riyadh",
    });
    const zipFileName = `backup-${date}.zip`;
    const zipFilePath = path.join(DATA_CACHE_DIR, zipFileName);

    console.log(
      `[Database Backup] Streaming data directly to ${zipFileName}...`,
    );

    const archive = archiver("zip", { zlib: { level: 6 } });
    const outputStream = createWriteStream(zipFilePath);

    // Promise to wait for the entire archive to finish writing
    const archiveComplete = new Promise((resolve, reject) => {
      outputStream.on("close", resolve);
      archive.on("error", reject);
    });

    archive.pipe(outputStream);

    for (const collInfo of collections) {
      const collectionName = collInfo.name;

      if (
        collectionName === "visitors" ||
        collectionName.startsWith("system.")
      ) {
        continue;
      }

      console.log(`[Database Backup] Zipping collection: ${collectionName}...`);

      // Create an async generator to yield JSON chunks
      async function* generateCollectionJson() {
        yield "[\n";
        const cursor = db.collection(collectionName).find({});
        let isFirst = true;
        let docCount = 0;

        for await (const doc of cursor) {
          if (!isFirst) {
            yield ",\n";
          }
          yield EJSON.stringify(doc, { relaxed: false }, 2);
          isFirst = false;
          docCount++;
        }

        yield "\n]";
        console.log(
          `[Database Backup] Completed ${collectionName}: ${docCount} documents zipped.`,
        );
      }

      const readableStream = Readable.from(generateCollectionJson());
      archive.append(readableStream, { name: `${collectionName}.json` });
    }

    // Finalize the archive (this indicates we're done appending)
    await archive.finalize();

    // Wait for the file write to complete
    await archiveComplete;

    // 1. Local Cleanup (Keep old zips logic, updated to remove old zip files)
    await cleanupOldBackups();

    // 2. Upload & Cleanup Google Drive
    if (process.env.GDRIVE_REFRESH_TOKEN) {
      await uploadToGoogleDriveAndCleanup(zipFilePath, zipFileName);
    }

    console.log(
      "[Database Backup] All collections backed up and synced to Drive successfully.",
    );
    return { success: true, date, collectionsBackedUp: collections.length - 1 };
  } catch (error) {
    console.error("[Database Backup] Critical failure during backup:", error);
    throw error;
  } finally {
    await client.close();
  }
}

async function cleanupOldBackups() {
  try {
    const items = await fs.readdir(DATA_CACHE_DIR);
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    for (const item of items) {
      const itemPath = path.join(DATA_CACHE_DIR, item);
      const stats = await fs.stat(itemPath);

      // Backwards compatibility cleanup for old raw directories
      if (stats.isDirectory()) {
        const folderDate = new Date(item);
        if (!isNaN(folderDate) && folderDate < sevenDaysAgo) {
          await fs.rm(itemPath, { recursive: true, force: true });
          console.log(
            `[Database Backup] Deleted expired backup folder: ${item}`,
          );
        }
      }
      // Cleanup for zip files
      else if (stats.isFile() && item.endsWith(".zip")) {
        // Extract date from "backup-YYYY-MM-DD.zip"
        const match = item.match(/backup-(\d{4}-\d{2}-\d{2})\.zip/);
        if (match) {
          const fileDate = new Date(match[1]);
          if (!isNaN(fileDate) && fileDate < sevenDaysAgo) {
            await fs.rm(itemPath, { force: true });
            console.log(
              `[Database Backup] Deleted expired backup zip: ${item}`,
            );
          }
        }
      }
    }
  } catch (error) {
    // Suppress error if the directory doesn't exist yet
    if (error.code !== "ENOENT") {
      console.error("[Database Backup] Cleanup error:", error);
    }
  }
}

let backupJob = null;

export const startDatabaseBackupJob = () => {
  if (backupJob) {
    backupJob.stop();
  }

  backupJob = new CronJob(
    "0 21 * * *",
    async () => {
      try {
        await runDatabaseBackup();
      } catch (error) {
        console.error(
          "[Database Backup Job] Scheduled execution failed:",
          error,
        );
      }
    },
    null,
    true,
    "Asia/Riyadh",
  );

  backupJob.start();
  console.log(
    "[Database Backup Job] Cron job initialized for daily 9 PM runs.",
  );
};

// --- GOOGLE DRIVE & ZIPPING HELPERS ---

async function uploadToGoogleDriveAndCleanup(zipFilePath, fileName) {
  try {
    // Setup OAuth2 with your Pro Account credentials
    const oauth2Client = new auth.OAuth2(
      process.env.GDRIVE_CLIENT_ID,
      process.env.GDRIVE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GDRIVE_REFRESH_TOKEN,
    });

    const drive = googleDrive({ version: "v3", auth: oauth2Client });
    const folderId = process.env.GDRIVE_FOLDER_ID;

    console.log("[Google Drive] Uploading backup using Pro Storage...");
    await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: "application/zip",
        body: createReadStream(zipFilePath),
      },
    });
    console.log("[Google Drive] Upload complete.");

    // Cleanup Drive: Delete files older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id, name, createdTime)",
    });

    if (res.data.files) {
      for (const file of res.data.files) {
        if (new Date(file.createdTime) < sevenDaysAgo) {
          await drive.files.delete({ fileId: file.id });
          console.log(`[Google Drive] Deleted old backup: ${file.name}`);
        }
      }
    }
  } catch (error) {
    // Detailed error logging to help troubleshoot
    console.error("[Google Drive] Error details:", error.message);
    if (error.response) console.error(error.response.data);
  }
}

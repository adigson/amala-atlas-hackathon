/**
 * One-time migration script
 * Adds `status: "proposed"` to any spot missing the field
 */

const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json"); // adjust path if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function fixMissingStatus() {
  console.log("🔍 Checking amala_spots for missing status...");

  const snapshot = await db.collection("amala_spots").get();
  let updates = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.status) {
      await doc.ref.update({ status: "proposed" });
      console.log(`✅ Updated ${doc.id} → status: "proposed"`);
      updates++;
    }
  }

  console.log(`🎉 Migration complete. Updated ${updates} documents.`);
  process.exit(0);
}

fixMissingStatus().catch(err => {
  console.error("❌ Error running migration:", err);
  process.exit(1);
});

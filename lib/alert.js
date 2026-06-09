import Alert from "@/models/Alert";

/**
 * Updates the global admin alert for a specific type.
 * @param {string} type - The type of alert ('order', 'message', 'contact', 'proposal', 'damageReport')
 * @param {string} id - The ID of the related item
 */
export const updateAlert = async (type, id) => {
  try {
    await Alert.findOneAndUpdate(
      {},
      { [type]: id },
      { upsert: true, new: true },
    );
  } catch (error) {
    console.error(`Failed to update alert for ${type}:`, error);
  }
};

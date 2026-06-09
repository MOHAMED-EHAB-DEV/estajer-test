import { getProfiles, generateProfileEntries } from "@/lib/sitemap";

export default async function sitemap() {
  const profiles = await getProfiles();
  return generateProfileEntries(profiles);
}

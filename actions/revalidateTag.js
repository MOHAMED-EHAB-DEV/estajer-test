"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateWithTag(tag) {
  revalidateTag(tag);
}
export default async function revalidate(path) {
  revalidatePath(path);
  revalidatePath(path === "/" ? "/ar" : `/ar${path}`);
  revalidatePath(path === "/" ? "/en" : `/en${path}`);
}

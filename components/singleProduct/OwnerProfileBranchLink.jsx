"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OwnerProfileBranchLink({
  langPrefix,
  pathName,
  children,
  className,
  dir,
}) {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch");

  const href = `/${langPrefix}profile/${pathName}/products${
    branchId ? `?branch=${branchId}` : ""
  }`;

  return (
    <Link href={href} className={className} dir={dir}>
      {children}
    </Link>
  );
}

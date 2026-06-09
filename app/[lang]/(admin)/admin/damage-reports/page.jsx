import React from "react";
import { cookies } from "next/headers";
import DamageReportsContainer from "@/components/admin/DamageReportsContainer";

const getDamageReports = async (searchParams) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const query = new URLSearchParams();
    if (searchParams.page) query.append("page", searchParams.page);
    if (searchParams.status) query.append("status", searchParams.status);
    query.append("limit", "10");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/damage-reports?${query.toString()}`,
      { headers: { Authorization: token } },
    );

    if (!response.ok) throw new Error("Failed to fetch damage reports");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching damage reports:", error);
    return {
      success: false,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 1 },
    };
  }
};

export default async function AdminReportsPage({ params, searchParams }) {
  const { lang } = await params;
  const param = await searchParams;
  const data = await getDamageReports(param);

  return (
    <DamageReportsContainer
      initialReports={data.data || []}
      initialPagination={
        data.pagination || { page: 1, limit: 10, total: 0, pages: 1 }
      }
      lang={lang}
    />
  );
}

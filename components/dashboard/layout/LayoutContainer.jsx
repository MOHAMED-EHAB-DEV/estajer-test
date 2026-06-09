"use client";
import { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar";

export default function LayoutContainer({ lang, translate }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DashboardHeader setOpen={setOpen} lang={lang} translate={translate} />
      <Sidebar
        lang={lang}
        open={open}
        setOpen={setOpen}
        translate={translate}
      />
    </>
  );
}

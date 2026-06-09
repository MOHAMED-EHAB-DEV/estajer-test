"use client";
import { useState } from "react";
import AdminHeader from "./AdminHeader";
import Sidebar from "./Sidebar";

export default function LayoutContainer({ lang, translate }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AdminHeader setOpen={setOpen} lang={lang} translate={translate} />
      <Sidebar
        lang={lang}
        open={open}
        setOpen={setOpen}
        translate={translate}
      />
    </>
  );
}

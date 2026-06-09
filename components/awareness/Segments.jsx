"use client";
import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import useEmblaCarousel from "embla-carousel-react";
import Button from "../ui/Button";
import Link from "next/link";
import Image from "next/image";
import SectionTitle from "@/components/shared/SectionTitle";
import { anyImgUrl } from "@/utils/ImageUrl";

const ElectronicsIcon = ({ active }) => (
  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 30 30">
    <path
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      d="M21.25 2.5H8.75A2.5 2.5 0 0 0 6.25 5v20a2.5 2.5 0 0 0 2.5 2.5h12.5a2.5 2.5 0 0 0 2.5-2.5V5a2.5 2.5 0 0 0-2.5-2.5"
    />
    <path
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.667"
      d="M15 22.5h.012"
    />
  </svg>
);

const PartiesIcon = ({ active }) => (
  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 30 30">
    <path
      fill={active ? "#F48A42" : "#5B5656"}
      d="M18.594 22.307c.728-.717.335-2.363-.854-4.265.433-.067.837-.17 1.142-.328 1.1-.568 1.842-1.603 2.404-2.673.605-1.148 1.01-2.41 1.798-3.455.134-.177.267-.335.4-.484 1.7.204 3.058.57 3.058.57l.52-1.32a14 14 0 0 0-2.01-.556c.419-.237.691-.311.691-.311l-.491-1.33a5.6 5.6 0 0 0-1.964 1.414c-2.003-.112-4.02.287-5.61 1.52-1.197.929-2.005 2.216-2.765 3.503a21 21 0 0 0-2.148-1.841c.144-.236.298-.448.463-.611 1-.985 2.319-1.614 3.184-2.74 1.82-2.366.489-6.074-1.007-7.994-.269.259-.712.635-1.046.932 1.59 1.629 2.703 4.48 1.457 6.612-.697 1.19-1.984 1.938-2.884 2.961a3.2 3.2 0 0 0-.421.652c-2.354-1.689-4.514-2.368-5.37-1.525a1.1 1.1 0 0 0-.207.297l-.003-.003-.023.067q-.05.108-.08.23L.937 28.595l17.185-6.009-.005-.004c.185-.06.348-.148.476-.274M4.356 26.406l-1.434-.669.968-2.789 4.44 2.068zm7.946-2.779L4.859 20.16l.968-2.788 5.562 2.791c-3.32-2.16-4.594-5.581-4.594-5.581l.33-.953c.589 1.488 1.883 3.342 3.661 5.091 1.794 1.765 3.695 3.044 5.214 3.615zm2.859-8.784c.777-1.114 1.578-2.239 2.692-3.039 1.06-.762 2.781-.901 4.413-.81-.551.963-.958 2.031-1.324 3.057-.442 1.242-1.035 2.53-2.164 3.292-.305.206-.732.356-1.188.467-.627-.96-1.45-1.976-2.43-2.967"
    />
    <path
      fill={active ? "#F48A42" : "#5B5656"}
      d="M10.796 10.312c.47 0-.938-1.406-.703-2.64.902-.069 2.963.338 1.763-1.31 1.358.239 2.06-.775.78-1.735.426.03 1.089-.775.613-.876-1.524-.323-2.121.501-1.154 1.69-1.017-.189-1.846.284-1.082 1.346-2.937-.366-1.266 3.525-.217 3.525M20.881 9.063c.44-.199-.306-1.512-.549-1.847 1.858-.2 1.787-.753.622-1.939 3.167.107.098-1.693.529-2.406.372-.618 1.516.03 1.41-.314-.357-1.15-3.745-.373-1.602 1.776-1.87.037-2.05.649-.656 1.917-2.429.026-.447 3.125.246 2.813M28.92 13.7c-.74.207-.855.13-.756.868-1.713-.789-3.525-1.885-2.425 1.02-1.946-1.159-1.849-.144-2.212 1.525-.474-.37-1.146-1.341-1.146-1.341l-.713.605s1.305 1.841 1.95 1.737c.567-.092.875-1.163.907-2.107 1.804.762 2.668.863 1.843-1.364 1.443.81 3.212 1.525 2.553-.944M2.834 5.361 4.16 6.687 2.834 8.013 1.508 6.687zM6.012 10.874 4.685 12.2 3.36 10.873l1.327-1.326zM8.072 3.281l1.326 1.326-1.326 1.326-1.326-1.326zM22.506 21.79l-1.326-1.327 1.325-1.326 1.327 1.326zM19.548 26.337l-1.325-1.325 1.325-1.326 1.326 1.326zM25.366 27.385l-1.327-1.327 1.325-1.326 1.327 1.326zM26.693 21.345l-1.326-1.326 1.326-1.326 1.325 1.326zM24.478 4.688l1.326 1.325-1.326 1.326-1.326-1.326z"
    />
  </svg>
);

const FurnitureIcon = ({ active }) => (
  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 30 30">
    <path
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M23.75 11.25V7.5a2.5 2.5 0 0 0-2.5-2.5H8.75a2.5 2.5 0 0 0-2.5 2.5v3.75"
    />
    <path
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3.75 20a2.5 2.5 0 0 0 2.5 2.5h17.5a2.5 2.5 0 0 0 2.5-2.5v-6.25a2.5 2.5 0 0 0-5 0v1.875a.624.624 0 0 1-.625.625H9.375a.625.625 0 0 1-.625-.625V13.75a2.5 2.5 0 0 0-5 0zM6.25 22.5V25M23.75 22.5V25"
    />
  </svg>
);

const CampingIcon = ({ active }) => (
  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 30 30">
    <path
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4.375 26.25 17.5 3.75M25.625 26.25 12.5 3.75M19.375 26.25 15 18.75l-4.375 7.5M2.5 26.25h25"
    />
  </svg>
);

const KidsIcon = ({ active }) => (
  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 30 30">
    <path
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12.5 20c.625.375 1.5.625 2.5.625s1.875-.25 2.5-.625M18.75 15h.012"
    />
    <path
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M24.225 8.516A11.25 11.25 0 0 1 26 12.75a2.5 2.5 0 0 1 0 4.5 11.25 11.25 0 0 1-22 0 2.5 2.5 0 0 1 0-4.5 11.25 11.25 0 0 1 11-9c2.5 0 4.375 1.375 4.375 3.125S18.25 10 16.875 10c-1 0-1.875-.5-1.875-1.25M11.25 15h.012"
    />
  </svg>
);

const GamesIcon = ({ active }) => (
  <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 30 30" fill="none">
    <path
      d="M7.5 13.75H12.5"
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 11.25V16.25"
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.75 15H18.7625"
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.5 12.5H22.5125"
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.65 6.25H8.35C7.11285 6.25029 5.91973 6.70922 5.00129 7.53808C4.08285 8.36694 3.50431 9.50687 3.3775 10.7375C3.37 10.8025 3.365 10.8637 3.35625 10.9275C3.255 11.77 2.5 18.07 2.5 20C2.5 20.9946 2.89509 21.9484 3.59835 22.6516C4.30161 23.3549 5.25544 23.75 6.25 23.75C7.5 23.75 8.125 23.125 8.75 22.5L10.5175 20.7325C10.9862 20.2636 11.622 20.0001 12.285 20H17.715C18.378 20.0001 19.0138 20.2636 19.4825 20.7325L21.25 22.5C21.875 23.125 22.5 23.75 23.75 23.75C24.7446 23.75 25.6984 23.3549 26.4016 22.6516C27.1049 21.9484 27.5 20.9946 27.5 20C27.5 18.0687 26.745 11.77 26.6437 10.9275C26.635 10.865 26.63 10.8025 26.6225 10.7387C26.496 9.50789 25.9176 8.36766 24.9991 7.53854C24.0806 6.70943 22.8873 6.25032 21.65 6.25Z"
      stroke={active ? "#F48A42" : "#5B5656"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-1"
  >
    <circle cx="12" cy="12" r="10" fill="#F48A42" />
    <path
      d="M8 12.5L10.5 15L16 9"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const categories = [
  {
    id: "electronics",
    icon: ElectronicsIcon,
    products: [
      {
        href: "https://estajer.com/products/%D8%B4%D8%A7%D8%B4%D8%A7%D8%AA-led-%D8%A7%D9%84%D8%B4%D9%81%D8%A7%D9%81%D8%A9-p3-9_ref_69c5972af17c3800a1eb7925",
        image: "5a48af95d6a8c2ca7a00598b34bd9869_sbkxwa",
      },
      {
        href: "https://estajer.com/products/%D9%83%D9%85%D8%A8%D9%8A%D9%88%D8%AA%D8%B1-%D8%A3%D9%84%D8%B9%D8%A7%D8%A8-%D8%A7%D8%AD%D8%AA%D8%B1%D8%A7%D9%81%D9%8A-rtx-4060-i5-12400f-16gb-ram-1tb-ssd_ref_69ac13ec3b292150a737168a",
        image: "47d4c22620e2ad64e0671951f273ccbe_ya3o5s",
      },
      {
        href: "https://estajer.com/products/%D9%83%D9%8A%D8%A8%D9%82%D9%88%D8%B1%D8%AF-%D8%AC%D8%A7%D9%84%D8%A7%D9%83%D8%B3_ref_683abffafa8fa5b94af19bfb",
        image: "82a4d59974f0f2200fcc8469b3827425_owwqi1",
      },
      {
        href: "https://estajer.com/products/%D8%B4%D8%A7%D8%B4%D9%87-%D8%AF%D9%8A%D9%84-27-%D8%A7%D9%86%D8%B4-%D8%A7%D8%B3-2715-%D8%A7%D8%AA%D8%B4-%D8%AA%D9%8A_ref_683abffafa8fa5b94af19bd2",
        image: "14e2e8b9f71c1ef8a7c16e8e5efabcfe_lhuy6v",
      },
      {
        href: "https://estajer.com/products/%D9%84%D9%8A%D9%86%D9%88%D9%81%D9%88-%D8%A8%D9%8A-11_ref_683abffafa8fa5b94af19be1",
        image: "8d72ee71250746b49ae0f60622a1fe4a_jsuy7c",
      },
    ],
  },
  {
    id: "parties",
    icon: PartiesIcon,
    products: [
      {
        href: "https://estajer.com/products/%D8%A8%D8%A7%D9%82%D8%A9-%D8%A7%D9%84-10-%D8%A7%D8%B4%D8%AE%D8%A7%D8%B5-%D8%B7%D8%A7%D9%88%D9%84%D8%A9-%D8%B7%D8%B9%D8%A7%D9%85-%D8%AF%D8%A7%D8%A6%D8%B1%D9%8A%D9%87-%D9%82%D9%85%D8%A7%D8%B4-%D9%85%D8%B9-%D9%83%D8%B1%D8%A7%D8%B3%D9%8A-%D8%B4%D9%81%D8%A7%D9%81-%D8%A7%D9%83%D8%B1%D9%8A%D9%84%D9%8A%D9%83_ref_69b76ce78ccffadbbfa1dcf8",
        image: "7cd0086f6e0aaf91b0aa5324109daa3c_z7e5lk",
      },
      {
        href: "https://estajer.com/products/%D9%82%D9%88%D8%B3-%D8%A8%D8%A7%D9%84%D9%88%D9%86_ref_69c525f7f17c3800a1eb5e6f",
        image: "167de99ce0b6297530fbd644f4b09eb7_hv3lnk",
      },
      {
        href: "https://estajer.com/products/%D9%81%D9%84%D8%A7%D9%8A%D8%B1%D9%88%D9%86_ref_6953bdd063d7477493ff0f4f",
        image: "3c0eabd84cf5114a3809ee8bc6e6d0fb_janpyy",
      },
      {
        href: "https://estajer.com/products/%D8%A8%D8%A7%D9%82%D8%A9-%D8%A7%D9%84-10-%D8%A7%D8%B4%D8%AE%D8%A7%D8%B5-%D8%AC%D9%84%D8%B3%D8%A9-%D8%B7%D8%B9%D8%A7%D9%85-%D9%83%D8%B1%D8%A7%D8%B3%D9%8A-%D8%B1%D9%8A%D9%81%D9%8A-%D8%A7%D9%86%D9%8A%D9%82%D9%87-%D9%85%D8%B9-%D8%B7%D8%A7%D9%88%D9%84%D8%A7%D8%AA-%D9%85%D8%B3%D8%AA%D8%B7%D9%8A%D9%84%D9%87-%D8%B1%D9%8A%D9%81%D9%8A-%D8%AE%D8%B4%D8%A8_ref_69aef5f45b9a5481811da3aa",
        image: "9dddf99a4f83abe1fcd304b21ea55810_ejugxa",
      },
      {
        href: "https://estajer.com/products/%D8%A5%D8%B6%D8%A7%D8%A1%D8%A9-%D8%B2%D9%88%D9%88%D9%85-%D9%88%D9%88%D8%B4-zoom-wash-%D8%B0%D9%83%D9%8A%D8%A9_ref_69a26439d519199fb5036df8",
        image: "e4a2751549e6cb1e4b1fc61ad59ed0f2_yel7ah",
      },
    ],
  },
  {
    id: "furniture",
    icon: FurnitureIcon,
    products: [
      {
        href: "https://estajer.com/products/%D9%83%D8%B1%D8%B3%D9%8A-%D9%85%D9%84%D9%83%D9%8A-%D9%81%D8%AE%D9%85-%D8%A8%D8%B0%D8%B1%D8%A7%D8%B9%D9%8A%D9%86_ref_69d4d221ae69049a8192ac1e",
        image: "513a779c0be8c0c6265d2543e970a42e_nrdrtf",
      },
      {
        href: "https://estajer.com/products/%D9%83%D8%B1%D8%B3%D9%8A-%D8%B6%D9%8A%D8%A7%D9%81%D8%A9-%D8%B9%D8%B5%D8%B1%D9%8A-%D8%A3%D8%B2%D8%B1%D9%82_ref_69d4d7492aac76228a6a89bb",
        image: "88a4fde7ebe858d6a1d9852775ffb783_usoxgy",
      },
      {
        href: "https://estajer.com/products/%D8%A8%D9%8A%D9%86-%D8%A8%D8%A7%D8%AC-%D9%85%D9%84%D9%88%D9%86-%D8%A8%D8%A3%D9%84%D9%88%D8%A7%D9%86-%D8%B2%D8%A7%D9%87%D9%8A%D8%A9-%D9%88%D8%B9%D8%B5%D8%B1%D9%8A%D8%A9_ref_683abee2fa8fa5b94af19a15",
        image: "90ab4126ffc0a96227e8b426f364b4b1_vp1wdr",
      },
      {
        href: "https://estajer.com/products/%D8%B7%D8%A7%D9%88%D9%84%D8%A9-%D8%AE%D8%AF%D9%85%D8%A9-%D9%85%D8%B3%D8%AA%D8%AF%D9%8A%D8%B1%D8%A9-%D9%84%D9%88%D9%86-%D8%A3%D8%A8%D9%8A%D8%B6-%D8%A8%D8%AA%D8%B5%D9%85%D9%8A%D9%85-%D8%AD%D8%AF%D9%8A%D8%AB_ref_683abee2fa8fa5b94af19a25",
        image: "d0367d753566fbedee1e87cc9605f01b_rrtcxb",
      },
      {
        href: "https://estajer.com/products/%D8%B7%D8%A7%D9%88%D9%84%D8%A9-%D8%A8%D8%A7%D8%B1_ref_6878e270446bdce8a9d1ec6e",
        image: "fe8db2f555eb91d2b767b8aa3e64a9b6_oq2mhy",
      },
    ],
  },
  {
    id: "camping",
    icon: CampingIcon,
    products: [
      {
        href: "https://estajer.com/products/%D8%AE%D9%8A%D8%A7%D9%85-%D8%B1%D9%85%D8%B6%D8%A7%D9%86%D9%8A%D8%A9-%D9%85%D8%AC%D9%87%D8%B2%D8%A9-%D8%A8%D8%A7%D9%84%D9%83%D8%A7%D9%85%D9%84-%D8%A8%D8%AB%D9%8A%D9%85-%D8%B1%D9%85%D8%B6%D8%A7%D9%86%D9%8A_ref_698eaa9a8ae65a0bb8f054c1",
        image: "products/hol2gpbopf6meynozl7k",
      },
      {
        href: "https://estajer.com/products/%D8%AA%D8%A7%D8%AC%D9%8A%D8%B1-%D9%83%D8%B1%D9%81%D8%A7%D9%86-%D8%A7%D9%85%D8%B1%D9%8A%D9%83%D9%8A-32-%D9%82%D8%AF%D9%85-%D9%82%D9%84%D8%B5_ref_68d1038dae0db10a703ec846",
        image: "products/uvmgkicsr6np0hhellxm",
      },
      {
        href: "https://estajer.com/products/%D8%AE%D9%8A%D9%85%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B4%D8%A7%D8%AA-3-3-2-%D9%85%D8%AA%D8%B1-%D8%AA%D9%83%D9%81%D9%8A-%D9%84%D9%80-8-%D8%A3%D8%B4%D8%AE%D8%A7%D8%B5-%D8%B0%D8%A7%D8%AA-%D8%AC%D9%88%D8%AF%D8%A9-%D8%B9%D8%A7%D9%84%D9%8A%D8%A9_ref_68c5bc301a3451916236adee",
        image: "products/zn74hsuchwepiugklyh7",
      },
      {
        href: "https://estajer.com/products/%D8%AE%D9%8A%D9%85%D9%87-%D8%B4%D8%B9%D8%A8%D9%8A%D9%87-%D8%AA%D8%B1%D8%A7%D8%AB%D9%8A%D9%87-%D9%A1%D9%A0-%D9%A2%D9%A0-%D9%85%D8%AA%D8%B1-%D8%A8%D9%8A%D8%AA-%D8%B4%D8%B9%D8%B1-%D8%A7%D8%A8%D9%8A%D8%B6%D9%91-%D8%A7%D9%88-%D8%A7%D8%B3%D9%88%D8%AF_ref_68835ea9302c94888e22bc03",
        image: "products/g7ltbrcncjlxton7ojh3",
      },
      {
        href: "https://estajer.com/products/%D8%AE%D9%8A%D9%85%D9%87-%D8%B4%D8%B9%D8%A8%D9%8A%D9%87-%D8%AA%D8%B1%D8%A7%D8%AB%D9%8A%D9%87-%D9%A1%D9%A0-%D9%A3%D9%A0-%D9%85%D8%AA%D8%B1-%D8%A8%D9%8A%D8%AA-%D8%B4%D8%B9%D8%B1-%D8%A7%D8%A8%D9%8A%D8%B6%D9%91-%D8%A7%D9%88-%D8%A7%D8%B3%D9%88%D8%AF_ref_688362dc302c94888e22bd0a",
        image: "products/nbcelsqoazti057td2x4",
      },
    ],
  },
  {
    id: "kids",
    icon: KidsIcon,
    products: [
      {
        href: "https://estajer.com/products/%D9%83%D8%B1%D8%B3%D9%8A-%D8%B3%D9%8A%D8%A7%D8%B1%D8%A9-%D9%84%D9%84%D8%A3%D8%B7%D9%81%D8%A7%D9%84_ref_kids1",
        image: "c06f2856416cd44275b0de555d01b361_tqw9k9",
      },
      {
        href: "https://estajer.com/products/%D8%B9%D8%B1%D8%A8%D8%A9-%D8%A3%D8%B7%D9%81%D8%A7%D9%84-%D9%85%D8%AA%D9%86%D9%82%D9%84%D8%A9_ref_kids2",
        image: "9a0abff228c39bad8afbac1f1acb071b_uvtalk",
      },
      {
        href: "https://estajer.com/products/%D9%83%D8%B1%D8%B3%D9%8A-%D8%B7%D8%B9%D8%A7%D9%85-%D9%84%D9%84%D8%A3%D8%B7%D9%81%D8%A7%D9%84_ref_kids3",
        image: "3f7c2d06c74783bb0bed4839febfcf78_qymwvd",
      },
      {
        href: "https://estajer.com/products/%D8%B3%D8%B1%D9%8A%D8%B1-%D8%A3%D8%B7%D9%81%D8%A7%D9%84-%D9%87%D8%B2%D8%A7%D8%B2_ref_kids4",
        image: "245e2fce57ff233e65b4365584c813c1_btkhd1",
      },
      {
        href: "https://estajer.com/products/%D8%B7%D8%A7%D9%88%D9%84%D8%A9-%D8%AA%D8%BA%D9%8A%D9%8A%D8%B1-%D9%84%D9%84%D8%A3%D8%B7%D9%81%D8%A7%D9%84_ref_kids5",
        image: "968d435d9c70b5bfb4dbaa244e49494d_eyimoi",
      },
    ],
  },
  {
    id: "games",
    icon: GamesIcon,
    products: [
      {
        href: "https://estajer.com/products/%D9%85%D8%AA%D8%A7%D9%87%D8%A9-%D9%88%D8%B2%D8%AD%D9%84%D9%8A%D9%82%D8%A9-%D8%A7%D9%84%D8%BA%D8%A7%D8%A8%D8%A9_ref_699e24f641cb78c555202283",
        image: "products/pwja2ss7rrleqp6f1p2a",
      },
      {
        href: "https://estajer.com/products/%D8%A8%D9%84%D8%A7%D9%8A%D8%B3%D8%AA%D9%8A%D8%B4%D9%86-5_ref_69ab9fafd00e9391f89e974e",
        image: "products/f2wytahtngqoegek6jqq",
      },
      {
        href: "https://estajer.com/products/%D9%85%D9%87%D8%B1%D8%AC-%D9%85%D9%87%D8%B1%D8%AC%D8%A9_ref_6878e72e4aba7e5abd7e111d",
        image: "products/kolnovvicmpqzff8yxso",
      },
      {
        href: "https://estajer.com/products/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D8%AA%D8%B5%D8%A7%D8%AF%D9%85_ref_695ee4872d5fc4b85b44b678",
        image: "products/nxkyqurccj2uk6bbs3px",
      },
      {
        href: "https://estajer.com/products/%D8%AA%D8%A3%D8%AC%D9%8A%D8%B1-%D8%B7%D8%A7%D9%88%D9%84%D8%A9-%D9%81%D9%88%D8%B3%D8%A8%D9%88%D9%84-%D8%A7%D8%AD%D8%AA%D8%B1%D8%A7%D9%81%D9%8A%D8%A9_ref_69562ab80d37364e4d8969e1",
        image: "products/mhpibbq0tfxwgd2lx9rl",
      },
    ],
  },
];

const Segments = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`awareness.segments.${text}`);
  const catData = (catId) => trans(`awareness.segments.categories.${catId}`);

  const [activeTab, setActiveTab] = useState("electronics");
  const currentData = catData(activeTab);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    direction: lang === "ar" ? "rtl" : "ltr",
    loop: true,
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
    watchDrag: true,
    breakpoints: {
      "(min-width: 768px)": {
        axis: "y",
      },
    },
  });

  const [tabsRef, tabsApi] = useEmblaCarousel({
    direction: lang === "ar" ? "rtl" : "ltr",
    dragFree: true,
    containScroll: "trimSnaps",
    align: "center",
  });

  const [tabsSelectedIndex, setTabsSelectedIndex] = useState(0);
  const [tabsScrollSnaps, setTabsScrollSnaps] = useState([]);

  const onTabsSelect = useCallback((api) => {
    setTabsSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!tabsApi) return;
    setTabsScrollSnaps(tabsApi.scrollSnapList());
    tabsApi.on("select", () => onTabsSelect(tabsApi));
    tabsApi.on("reInit", () => {
      setTabsScrollSnaps(tabsApi.scrollSnapList());
      onTabsSelect(tabsApi);
    });
  }, [tabsApi, onTabsSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(() => emblaApi.scrollNext(), 4500);
    return () => clearInterval(id);
  }, [emblaApi]);

  return (
    <section className="py-12 md:py-28 bg-white overflow-hidden" id="segments">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        {/* Header — matches home SectionTitle pattern */}
        <div className="text-center mb-8 md:mb-16">
          <span className="inline-block px-4 md:px-5 py-1 md:py-1.5 rounded-full border border-primary/20 bg-[#FFF9F5] text-primary text-xs md:text-sm font-IBMPlex font-bold tracking-wide mb-4">
            {t("badge")}
          </span>
          <SectionTitle title={t("title")} text={t("subtitle")} main={true} />
        </div>

        {/* Filter tabs */}
        <div className="mb-10 md:mb-14">
          <div className="overflow-hidden" ref={tabsRef}>
            <div className="flex gap-2 md:gap-5 px-4 md:justify-center">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const data = catData(cat.id);
                const active = activeTab === cat.id;
                return (
                  <div key={cat.id} className="flex-[0_0_auto]">
                    <button
                      onClick={() => setActiveTab(cat.id)}
                      className={`relative flex items-center gap-2.5 px-4 md:px-8 py-2 md:py-3.5 rounded-full transition-all whitespace-nowrap font-IBMPlex font-semibold text-sm md:text-lg ${
                        active
                          ? "bg-[#FFF9F0] text-primary"
                          : "bg-transparent text-[#5B5656] hover:bg-[#FFF9F0] hover:text-primary"
                      }`}
                    >
                      <Icon active={active} />
                      {data?.label}
                      {active && (
                        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-primary rounded-full" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Dots — mobile only */}
          <div className="flex justify-center gap-2 mt-4 md:hidden">
            {tabsScrollSnaps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => tabsApi?.scrollTo(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === tabsSelectedIndex ? "bg-primary w-4" : "bg-primary/20"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic content */}
        <div className="bg-[#FFF9F0] rounded-[2.5rem] flex flex-col justify-between md:flex-row-reverse relative overflow-hidden md:px-20">
          {/* Vertical image slider — 3 items visible */}
          <div className="w-full md:w-[400px] relative">
            <div
              className="overflow-hidden h-[260px] md:h-[550px] lg:h-[650px] w-full"
              ref={emblaRef}
            >
              <div className="flex flex-row md:flex-col h-full cursor-grab active:cursor-grabbing md:cursor-auto md:active:cursor-auto px-2 md:px-0">
                {categories
                  .find((cat) => cat.id === activeTab)
                  ?.products.map((product, idx) => {
                    const productHref =
                      product.href === "#"
                        ? "#"
                        : product.href.replace(
                            "https://estajer.com/",
                            `https://estajer.com/${lang === "ar" ? "" : "en/"}`,
                          );
                    return (
                      <div
                        key={idx}
                        className="flex-[0_0_75%] sm:flex-[0_0_55%] md:flex-[0_0_45%] min-w-0 md:min-h-0 h-full md:h-auto px-2 md:px-0 py-4 md:py-2"
                      >
                        <div className="block relative w-full h-full overflow-hidden rounded-xl md:rounded-3xl bg-white group/item shadow-sm">
                          <Image
                            src={anyImgUrl({ src: product.image, size: 500 })}
                            unoptimized
                            alt={`${currentData?.label} ${idx + 1}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover/item:scale-105"
                            sizes="(max-width: 768px) 100vw, 45vw"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          {/* Text content - placed right in RTL because of row-reverse */}
          <div className="w-full md:w-[55%] flex flex-col justify-center py-6 px-4 md:py-12 lg:py-16">
            <h3 className="font-IBMPlex font-semibold lg:text-[2rem] md:text-[1.75rem] text-[1.2rem] text-darkNavy leading-snug mb-4">
              {currentData?.title}
            </h3>

            <p className="text-sm md:text-lg font-IBMPlex mb-6 md:mb-14 leading-relaxed font-bold">
              {currentData?.support?.includes("=") ? (
                <>
                  <span className="text-primary">
                    {currentData.support.split("=")[0]}
                  </span>
                  <span className="text-primary mx-1"> = </span>
                  <span className="text-primary">
                    {currentData.support.split("=")[1]}
                  </span>
                </>
              ) : (
                <span className="text-primary">{currentData?.support}</span>
              )}
            </p>

            <div className="space-y-3 md:space-y-6 mb-8 md:mb-12">
              {currentData?.bullets?.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <CheckIcon />
                  <div className="flex-1 flex flex-col items-start">
                    <span className="font-IBMPlex font-bold text-darkNavy text-sm md:text-lg inline-block mb-1">
                      {bullet.title}
                    </span>
                    <p className="text-[#5B5656] text-xs md:text-base leading-relaxed">
                      {bullet.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-start md:justify-start">
              <Button
                as={Link}
                href={`/${lang}/pricing`}
                className="md:text-lg text-sm py-4 px-6 md:py-7 md:px-14 flex items-center gap-2 font-IBMPlex font-semibold shadow-[0_12px_28px_-6px_rgba(244,138,66,0.4)] active:scale-95 transition-all rounded-full bg-primary text-white"
              >
                {t("action")}
                <span className="text-xl">{lang === "ar" ? "←" : "→"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Global Action Button */}
        <div className="flex justify-center mt-12 md:mt-24">
          <Button
            as={Link}
            href={`/${lang}/pricing`}
            className="md:text-xl text-base py-5 px-10 md:py-8 md:px-20 flex items-center gap-4 font-IBMPlex font-bold shadow-[0_20px_40px_-12px_rgba(244,138,66,0.45)] hover:-translate-y-1.5 transition-all duration-300 rounded-full group bg-[#F48A42] text-white"
          >
            <span>{t("action")}</span>
            <span className="font-black text-2xl leading-none transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
              {lang === "ar" ? "←" : "→"}
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Segments;

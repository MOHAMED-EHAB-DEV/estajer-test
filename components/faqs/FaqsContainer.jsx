"use client";

import { useState } from "react";
import TopSection from "./TopSection";
import Faqs from "./Faqs";
import MoreQuestions from "./MoreQuestions";

const FaqsContainer = ({translate, lang}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  return (
    <div className="flex flex-col gap-16">
      <TopSection translate={translate} lang={lang} search={searchQuery} setSearch={setSearchQuery} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <Faqs translate={translate} activeCategory={activeCategory} />
      <MoreQuestions translate={translate} lang={lang} />
    </div>
  );
};

export default FaqsContainer;

import {
  Art,
  Bike,
  Camera,
  Confetti,
  ElectricMotor,
  Fashion,
  Games,
  KidsAccessories,
  Medical,
  Sofa,
  Tent,
  Tools,
  WashingMachine,
} from "@/components/ui/svgs/CategoriesIcons";

// Icon map for categories - used to display icons based on category key
const categoryIcons = {
  electronics: Camera,
  "home-supplies": WashingMachine,
  "parties-and-events": Confetti,
  "trips-and-camping": Tent,
  furniture: Sofa,
  arts: Art,
  sports: Bike,
  motors: ElectricMotor,
  medical: Medical,
  "kids-accessories": KidsAccessories,
  games: Games,
  fashion: Fashion,
  tools: Tools,
  other: Camera,
};

// Fetch categories from database
async function fetchCategoriesFromDB() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/categories?mainOnly=true&status=active`,
      { next: { revalidate: 60 * 60 * 24 * 2 }, tags: ["categories"] }, // Cache for 2 days
    );
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : null;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch categories from DB:", error);
    return null;
  }
}

export default async function categories({ lang }) {
  // Try to fetch from database first
  const dbCategories = await fetchCategoriesFromDB();

  if (dbCategories && dbCategories.length > 0) {
    // Use database categories
    return dbCategories.map((cat) => ({
      name: lang === "en" ? cat.nameEn : cat.nameAr,
      Icon: categoryIcons[cat.key] || Camera,
      key: cat.key,
      image: cat.image,
      _id: cat._id,
    }));
  }
}

// Export icon map for use in other components
export { categoryIcons };

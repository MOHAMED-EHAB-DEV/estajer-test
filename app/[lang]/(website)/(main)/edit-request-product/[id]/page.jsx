import TopSection from "@/components/addProduct/TopSection";
import AddRequestForm from "@/components/addRequest/AddRequestForm";
import { getTranslations } from "@/hooks/getTranslations";
import {cookies} from "next/headers";

async function getRequestedProduct(id) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/requests/${id}`,
            {headers: {Authorization: token}}
        );
        if (!response.ok) throw new Error("Failed to fetch request");
        const data = await response.json();
        return data.data;
    } catch (err) {
        console.error(`Error while trying to get the request product: ${err}`);
        return;
    }
}

export default async function page({ params }) {
    const { lang, id } = await params;
    const translate = await getTranslations(lang);
    const request = await getRequestedProduct(id);

    return (
        <div className="bg-[#F6F6F6] py-2">
            <TopSection
                lang={lang}
                title={translate("request.editTitle")}
                description={translate("request.editDescription")}
            />
            <AddRequestForm lang={lang} request={request} translate={translate()} isEditing={true} />
        </div>
    );
}

import SessionPlayerContainer from "@/components/admin/tracking/SessionPlayerContainer";

export default async function SessionDetailsPage({ params }) {
  const { lang, id } = await params;
  return <SessionPlayerContainer sessionId={id} lang={lang} />;
}

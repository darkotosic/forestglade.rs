import { OFFICIAL_APARTMENTS } from "@forestglade/project-data";
import { ApartmentEditPage } from "@/components/admin/apartment-edit-page";

export function generateStaticParams() {
  return OFFICIAL_APARTMENTS.map((apartment) => ({ slug: apartment.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ApartmentEditPage slug={slug} />;
}

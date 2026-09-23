import { OFFICIAL_PROJECT_FACTS } from "@forestglade/project-data";
import { canonicalSiteUrl } from "@/lib/seo";

export const site = {
  name: OFFICIAL_PROJECT_FACTS.companyName,
  title: OFFICIAL_PROJECT_FACTS.project,
  description: "Premium apartmani u Vrdniku, na obroncima Fruške Gore.",
  url: canonicalSiteUrl(),
  email: "info@forestglade.rs",
  phone: "0658441634",
  phoneHref: "tel:0658441634",
  location: OFFICIAL_PROJECT_FACTS.location,
};

export const projectFacts = {
  project: OFFICIAL_PROJECT_FACTS.project,
  location: OFFICIAL_PROJECT_FACTS.location,
  type: OFFICIAL_PROJECT_FACTS.type,
  floors: OFFICIAL_PROJECT_FACTS.floors,
  totalApartments: String(OFFICIAL_PROJECT_FACTS.totalApartments),
  grossArea: OFFICIAL_PROJECT_FACTS.grossArea,
  netArea: OFFICIAL_PROJECT_FACTS.netArea,
  marketArea: OFFICIAL_PROJECT_FACTS.marketArea,
  parking: OFFICIAL_PROJECT_FACTS.parking,
};

export const navigation = [
  { label: "Početna", href: "/" },
  { label: "Projekti", href: "/projekti" },
  { label: "Apartmani", href: "/apartmani" },
  { label: "Galerija", href: "/galerija" },
  { label: "O nama", href: "/o-nama" },
  { label: "Kontakt", href: "/kontakt" },
];

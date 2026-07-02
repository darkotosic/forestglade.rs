export const site = {
  name: "Forest Glade d.o.o",
  title: "Forest Glade Apart Hotel",
  description: "Premium apartmani u Vrdniku, na obroncima Fruške Gore.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://forestglade.rs",
  email: "info@forestglade.rs",
  phone: "+381 XX XXX XXXX",
  location: "Velika Međa bb, Vrdnik",
};

export const projectFacts = {
  project: "Forest Glade Apart Hotel",
  location: "Velika Međa bb, Vrdnik",
  type: "Apart Hotel",
  floors: "Suteren + Prizemlje + I sprat + II sprat + Povučeni sprat",
  totalApartments: "31",
  grossArea: "2.271,82 m²",
  netArea: "1.918,11 m²",
  marketArea: "1.540,01 m²",
  parking: "21 parking mesta",
};

export const navigation = [
  { label: "Početna", href: "/" },
  { label: "Projekti", href: "/projekti" },
  { label: "O nama", href: "/o-nama" },
  { label: "Kontakt", href: "/kontakt" },
];

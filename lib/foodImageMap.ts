export const foodImageMap: Record<string, string> = {
  // Boissons froides
  "Jus avocat": "/images/jus_avocat.jpg",
  "Jus banane": "/images/jus_banane.jpg",
  "Jus pomme": "/images/jus_pomme.jpg",
  "Jus citron": "/images/jus citron.jpg",
  "Jus de banane": "/images/jus_banane.jpg",
  "Jus de citron": "/images/jus citron.jpg",
  "Jus de pomme": "/images/jus_pomme.jpg",
  "Jus d'avocat": "/images/jus_avocat.jpg",
  "Raib nature": "/images/raib_nature.jpg",
  "Raib sirop": "/images/raib_sirop.jpg",
  "Raïb nature": "/images/raib_nature.jpg",
  "Raïb au sirop": "/images/raib_sirop.jpg",

  // Plats marocains
  Harira: "/images/hrira.jpg",
  "Hrira complet": "/images/hrira.jpg",
  Rfisa: "/images/rfisa.jpg",
  Loubia: "/images/loubia.jpg",
  Lentilles: "/images/lentille.jpg",
  Kar3in: "/images/kar3in.jpg",
  "Couscous poulet": "/images/couscous_poulet.jpg",
  "Couscous viande": "/images/couscous_viande.jpg",
  "Émincé de poulet": "/images/Émincé_de_poulet.jpg",
  "M9ila kefta": "/images/m9ila_kefta.jpg",
  "M9ila kebda": "/images/m9ila_kebda.jpg",
  "M9ila mixte": "/images/m9ila_mixte.jpg",
  "M9ila fruit de mer": "/images/m9ila_fruit_de_mer.jpg",
  "M9ila kfta": "/images/m9ila_kefta.jpg",
  "M9ila kbda": "/images/m9ila_kebda.jpg",
  "M9ila fruits de mer": "/images/m9ila_fruit_de_mer.jpg",
  "Tajine poulet": "/images/tajine_poulet.jpg",
  "Tajine poulet frites": "/images/tajine_poulet_frites.jpg",
  "Tajine kefta": "/images/tajine_kefta.jpg",
  "Tajine boeuf": "/images/tajine_boeuf.jpg",
  "Tanjia poulet": "/images/tanjia_poulet.jpg",
  "Tanjia viande": "/images/tanjia_viande.jpg",
  "Omelette fromage": "/images/omelette_fromage.jpg",

  // Msemen & Viennoiseries
  "Msemen fromage": "/images/msemen_fromage.jpg",
  "Msemen miel": "/images/msemen_miel.jpg",
  "Msemen simple": "/images/msemen_simple.jpg",
  "Msemen complet": "/images/msemen_simple.jpg",
  "Pain chocolat": "/images/pain_chocolat.jpg",
  "Petit pain choco": "/images/pain_chocolat.jpg",

  // Sandwichs & Paninis
  "Sandwich poulet": "/images/sandwich_poulet.jpg",
  "Sandwich viande hachée": "/images/sandwich_viande_hachée.jpg",
  "Sandwich mix": "/images/sandwich_mix.jpg",
  "Sandwich V.H avec frites": "/images/sandwich_viande_hachée.jpg",
  "Sandwich V.H sans frites": "/images/sandwich_viande_hachée.jpg",
  "Sandwich Poulet avec frites": "/images/sandwich_poulet.jpg",
  "Sandwich Poulet sans frites": "/images/sandwich_poulet.jpg",
  "Sandwich Mix": "/images/sandwich_mix.jpg",
  "Panini poulet": "/images/panini_poulet.jpg",
  "Panini thon": "/images/panini_thon.jpg",
  "Panini viande hachée": "/images/panini_viande_hachée.jpg",
  "Panini Poulet": "/images/panini_poulet.jpg",
  "Panini Thon": "/images/panini_thon.jpg",
  "Panini V.H": "/images/panini_viande_hachée.jpg",
  "Panini V.H avec frites": "/images/panini_viade_hachée.jpg",
  "Panini V.H sans frites": "/images/panini_viade_hachée.jpg",
  "Bocadillos avec frites": "/images/bocadillos_avec_frites.jpg",
  "Bocadillos sans frites": "/images/bocadillos_sans_frites.jpg",

  // Tacos
  "Tacos viande hachée": "/images/tacos_viande_hachée.jpg",
  "Tacos poulet": "/images/tacos_poulet.jpg",
  "Tacos mixte": "/images/tacos_mixte.jpg",
  "Tacos V.H avec frites": "/images/tacos_viande_hachée.jpg",
  "Tacos V.H sans frites": "/images/tacos_viande_hachée.jpg",
  "Tacos mix avec frites": "/images/tacos_mixte.jpg",
  "Tacos mix sans frites": "/images/tacos_mixte.jpg",
  "Tacos Poulet avec frites": "/images/tacos_poulet.jpg",
  "Tacos Poulet sans frites": "/images/tacos_poulet.jpg",

  // Pizzas
  "Pizza margarita": "/images/pizza_margarita.jpg",
  "Pizza poulet": "/images/pizza_poulet.jpg",
  "Pizza thon": "/images/pizza_thon.jpg",
  "Pizza végétarienne": "/images/pizza_végétarienne.jpg",
  "Pizza viande hachée": "/images/pizza_viande_hachée.jpg",

  // Pastitsio (orthographe réelle en DB)
  "Pastitsio Poulet": "/images/pasticcio_poulet.jpg",
  "Pastitsio V.H": "/images/pasticcio_viande_hachée.jpg",
  "Pastitsio Mix": "/images/pasticcio_mix.jpg",
  // Anciens noms (fallback)
  "Pasticcio poulet": "/images/pasticcio_poulet.jpg",
  "Pasticcio viande hachée": "/images/pasticcio_viande_hachée.jpg",
  "Pasticcio mix": "/images/pasticcio_mix.jpg",

  // Salades
  "Salade chef": "/images/salade_chef.jpg",
  "Salade italienne": "/images/salade_italienne.jpg",
  "Salade pâtes": "/images/salade_pates.jpg",
  "Salade de pâtes": "/images/salade_pates.jpg",

  // Desserts
  Basboussa: "/images/basboussa.jpg",
  Millefeuille: "/images/millefeuille.jpg",
  "Mille-feuille": "/images/millefeuille.jpg",
  "Crêpe chocolat": "/images/crepe_chocolat.jpg",
};

export function getFoodImage(dishName: string): string | null {
  if (!dishName) return null;

  // 1. Recherche exacte
  if (foodImageMap[dishName]) return foodImageMap[dishName];

  // 2. Insensible à la casse
  const lower = dishName.toLowerCase().trim();
  for (const [key, val] of Object.entries(foodImageMap)) {
    if (key.toLowerCase() === lower) return val;
  }

  // 3. Normalisation
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/\bv\.h\b/g, "viande hachée")
      .replace(/\bde\s/g, "")
      .replace(/\bavec frites\b/g, "")
      .replace(/\bsans frites\b/g, "")
      .replace(/raïb/g, "raib")
      .replace(/mille-feuille/g, "millefeuille")
      .replace(/pâtes/g, "pates")
      .replace(/\bkbda\b/g, "kebda")
      .replace(/\bkfta\b/g, "kefta")
      .replace(/fruits de mer/g, "fruit de mer")
      .trim();

  const normalized = normalize(lower);
  for (const [key, val] of Object.entries(foodImageMap)) {
    if (normalize(key) === normalized) return val;
  }

  // 4. Recherche partielle
  for (const [key, val] of Object.entries(foodImageMap)) {
    const keyL = key.toLowerCase();
    if (lower.includes(keyL) || keyL.includes(lower)) return val;
  }

  return null;
}

export function hasFoodImage(dishName: string): boolean {
  return getFoodImage(dishName) !== null;
}

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/lib/password";

if (process.env.NODE_ENV === "production") {
  throw new Error("Le seed efface les données : interdit en production.");
}

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

const img = (name: string) => `/images/produits/${name}.jpg`;

const categories = [
  { slug: "optiques", name: "Optiques & caméras", universe: "foret", description: "Jumelles et pièges photographiques pour observer sans déranger.", image: img("jumelles") },
  { slug: "appeaux", name: "Appeaux", universe: "foret", description: "Appeaux à cerf, à canard et à gibier d'eau.", image: img("appeau-canard") },
  { slug: "vetements", name: "Vêtements de chasse", universe: "foret", description: "Vestes de battue haute visibilité et tenues d'approche silencieuses.", image: img("veste-blaze") },
  { slug: "coutellerie", name: "Coutellerie", universe: "foret", description: "Couteaux de chasse à lame fixe, du dépeçage au bivouac.", image: img("couteau-classique") },
  { slug: "equipement", name: "Équipement", universe: "foret", description: "Sacs, éclairage, gants et orientation.", image: img("sac") },
  { slug: "fusils-harpons", name: "Fusils harpons", universe: "mer", description: "Arbalètes bois et aluminium, du trou à la pleine eau.", image: img("fusil-harpon") },
  { slug: "masques-palmes", name: "Masques & palmes", universe: "mer", description: "Masques faible volume et palmes longues pour l'apnée.", image: img("masque") },
  { slug: "combinaisons", name: "Combinaisons", universe: "mer", description: "Néoprène refendu et camouflage pour rester longtemps à l'eau.", image: img("combinaison") },
  { slug: "securite", name: "Sécurité", universe: "mer", description: "Signalisation et matériel de sécurité obligatoire.", image: img("bouee") },
] as const;

type CategorySlug = (typeof categories)[number]["slug"];

type SeedProduct = Omit<typeof schema.products.$inferInsert, "id" | "categoryId"> & {
  category: CategorySlug;
  variants: { label: string; price: number; compareAt?: number; stock: number }[];
};

const catalog: SeedProduct[] = [
  {
    slug: "jumelles-brumaire-hd",
    name: "Jumelles Brumaire HD",
    brand: "Brumaire",
    tagline: "Prismes en toit, verres HD, étanches et azotées.",
    description:
      "Des jumelles de chasse polyvalentes : traitement multicouche intégral pour garder de la luminosité à l'aube et au crépuscule, remplissage à l'azote contre la buée, armature caoutchouc antidérapante. Le 8x42 offre un champ large pour la battue, le 10x42 plus de détail pour l'approche et la plaine.",
    tip: "En battue, préférez un grossissement 8 : l'image est plus stable à main levée et le champ plus large pour suivre un animal en mouvement.",
    category: "optiques",
    image: img("jumelles"),
    isFeatured: true,
    specs: [
      { label: "Diamètre objectif", value: "42 mm" },
      { label: "Poids", value: "690 g" },
      { label: "Étanchéité", value: "IPX7, azote" },
      { label: "Garantie", value: "10 ans" },
    ],
    variants: [
      { label: "8x42", price: 27900, stock: 9 },
      { label: "10x42", price: 29900, stock: 14 },
    ],
  },
  {
    slug: "camera-de-chasse-sylvacam-tx24",
    name: "Caméra de chasse Sylvacam TX24",
    brand: "Sylvacam",
    tagline: "Piège photographique 24 Mpx, flash infrarouge invisible.",
    description:
      "Photos 24 Mpx et vidéo Full HD avec son, déclenchement en 0,3 s et détection jusqu'à 20 m. Les LED infrarouges à 940 nm sont invisibles pour la faune. Jusqu'à huit mois d'autonomie avec huit piles AA. Livrée avec sangle de fixation.",
    tip: "Fixez la caméra à hauteur de genou et orientez-la vers le nord pour éviter les clichés surexposés au lever et au coucher du soleil.",
    category: "optiques",
    image: img("camera-chasse"),
    specs: [
      { label: "Résolution", value: "24 Mpx / vidéo 1080p" },
      { label: "Déclenchement", value: "0,3 s" },
      { label: "Portée de détection", value: "20 m" },
      { label: "Autonomie", value: "Jusqu'à 8 mois" },
    ],
    variants: [
      { label: "À l'unité", price: 12900, stock: 18 },
      { label: "Lot de 2", price: 23900, stock: 5 },
    ],
  },
  {
    slug: "appeau-cerf-resonance",
    name: "Appeau à cerf Résonance",
    brand: "Cerfophone",
    tagline: "Corne en résine acoustique pour imiter le brame.",
    description:
      "Corne de brame en résine à embouchure réglable, du raire grave du vieux cerf au sanglot du jeune. Le pavillon évasé porte le son loin sans le déformer. Livré avec une fiche de tonalités.",
    tip: "Pendant le brame, répondez plutôt que de provoquer : quelques raires courts, puis un long silence. Un cerf dominant se déplace rarement vers un appel trop insistant.",
    category: "appeaux",
    image: img("appeau-cerf"),
    isFeatured: true,
    specs: [
      { label: "Longueur", value: "38 cm" },
      { label: "Matière", value: "Résine acoustique" },
    ],
    variants: [{ label: "Modèle unique", price: 5990, stock: 12 }],
  },
  {
    slug: "appeau-colvert-double-anche",
    name: "Appeau colvert double anche",
    brand: "Marais & Fils",
    tagline: "Noyer massif tourné, cancanement rauque et réaliste.",
    description:
      "Appeau à canard colvert en noyer massif, double anche en Mylar pour un son rauque et crédible même par vent de face. Livré avec sa dragonne.",
    tip: "Soufflez avec le diaphragme, pas avec les joues : prononcez « kwak » dans l'appeau plutôt que de souffler fort.",
    category: "appeaux",
    image: img("appeau-canard"),
    specs: [
      { label: "Anche", value: "Double, Mylar" },
      { label: "Bois", value: "Noyer massif" },
    ],
    variants: [{ label: "Modèle unique", price: 3490, compareAt: 3990, stock: 26 }],
  },
  {
    slug: "veste-de-traque-oree-blaze",
    name: "Veste de traque Orée Blaze",
    brand: "Orée",
    tagline: "Orange haute visibilité, membrane imper-respirante.",
    description:
      "Veste de battue orange fluo conforme aux exigences de sécurité en chasse collective. Membrane 10 000 mm, coutures étanchées, capuche amovible, deux poches poitrine à rabat et poches chauffe-mains. Tissu silencieux pour rester discret au poste.",
    tip: "Le gibier distingue mal l'orange, contrairement à vos voisins de ligne. Prenez une taille au-dessus si vous portez une polaire épaisse en dessous.",
    category: "vetements",
    image: img("veste-blaze"),
    isFeatured: true,
    specs: [
      { label: "Membrane", value: "10 000 mm / 8 000 g/m²/24 h" },
      { label: "Poids (taille L)", value: "880 g" },
      { label: "Entretien", value: "Lavage 30 °C, sans assouplissant" },
    ],
    variants: [
      { label: "S", price: 14900, stock: 6 },
      { label: "M", price: 14900, stock: 12 },
      { label: "L", price: 14900, stock: 15 },
      { label: "XL", price: 14900, stock: 0 },
    ],
  },
  {
    slug: "veste-approche-oree-silence",
    name: "Veste d'approche Orée Silence",
    brand: "Orée",
    tagline: "Camouflage feuillage, tissu brossé silencieux.",
    description:
      "Pensée pour l'approche et l'affût : le tissu brossé ne fait aucun bruit au contact des branches. Camouflage feuillage d'automne, col montant, poches zippées. Coupe ajustée pour ne pas gêner l'épaulé.",
    tip: "Lavez-la sans adoucissant ni lessive parfumée : l'odorat du gibier est votre premier adversaire, bien avant sa vue.",
    category: "vetements",
    image: img("veste-camo"),
    specs: [
      { label: "Tissu", value: "Polyester brossé silencieux" },
      { label: "Motif", value: "Feuillage d'automne" },
    ],
    variants: [
      { label: "M", price: 15900, compareAt: 18900, stock: 7 },
      { label: "L", price: 15900, compareAt: 18900, stock: 4 },
      { label: "XL", price: 15900, compareAt: 18900, stock: 2 },
    ],
  },
  {
    slug: "couteau-taillis-classique",
    name: "Couteau Taillis Classique",
    brand: "Taillis",
    tagline: "Lame fixe 11 cm, manche cuir empilé.",
    description:
      "Le couteau de chasse traditionnel : lame fixe en acier inoxydable 14C28N, garde laiton, manche en rondelles de cuir empilées. Livré avec un étui en cuir tanné végétal.",
    tip: "Affûtez à 20° sur une pierre grain 1000, puis finissez au cuir. Dix passages par face suffisent pour retrouver le fil.",
    category: "coutellerie",
    image: img("couteau-classique"),
    specs: [
      { label: "Lame", value: "11 cm, acier 14C28N" },
      { label: "Manche", value: "Cuir empilé" },
      { label: "Étui", value: "Cuir tanné végétal" },
    ],
    variants: [{ label: "Modèle unique", price: 8900, stock: 16 }],
  },
  {
    slug: "couteau-taillis-expedition",
    name: "Couteau Taillis Expédition",
    brand: "Taillis",
    tagline: "Lame 13 cm à dos droit, manche bois stabilisé.",
    description:
      "Une lame plus longue et plus épaisse pour le dépeçage du grand gibier et les travaux de bivouac. Acier inoxydable, garde aluminium, manche bois stabilisé résistant à l'humidité.",
    tip: "Après usage, rincez à l'eau claire, séchez et huilez légèrement la lame avant de la ranger dans l'étui.",
    category: "coutellerie",
    image: img("couteau-expedition"),
    specs: [
      { label: "Lame", value: "13 cm, inox" },
      { label: "Manche", value: "Bois stabilisé" },
    ],
    variants: [{ label: "Modèle unique", price: 11900, stock: 9 }],
  },
  {
    slug: "couteau-taillis-damas",
    name: "Couteau Taillis Damas",
    brand: "Taillis",
    tagline: "Lame damas avec crochet à éviscérer.",
    description:
      "Lame en acier damas forgée à la main, crochet à éviscérer intégré, manche multicouche os et bois. Pièce de coutelier, livrée avec étui en cuir.",
    tip: "Le damas n'est pas inoxydable : essuyez la lame après chaque usage et protégez-la d'un film d'huile.",
    category: "coutellerie",
    image: img("couteau-damas"),
    specs: [
      { label: "Lame", value: "Acier damas forgé" },
      { label: "Particularité", value: "Crochet à éviscérer" },
    ],
    variants: [{ label: "Modèle unique", price: 18900, stock: 3 }],
  },
  {
    slug: "sac-de-chasse-35l",
    name: "Sac de chasse 35 L",
    brand: "Orée",
    tagline: "Dos ventilé, ceinture lombaire, tissu silencieux.",
    description:
      "Sac à dos de chasse de 35 litres avec dos ventilé, ceinture lombaire rembourrée et poche à hydratation. Compartiment étanche pour le gibier et nombreuses poches latérales. Tissu brossé pour rester silencieux.",
    tip: "Placez les charges lourdes au plus près du dos, à hauteur des omoplates : le sac reste stable et vous ménagez vos lombaires.",
    category: "equipement",
    image: img("sac"),
    isFeatured: true,
    specs: [
      { label: "Volume", value: "35 L" },
      { label: "Poids", value: "1,4 kg" },
    ],
    variants: [{ label: "35 L", price: 11900, stock: 8 }],
  },
  {
    slug: "lampe-torche-lumen-900",
    name: "Lampe torche Lumen 900",
    brand: "Sylvacam",
    tagline: "900 lumens, rechargeable USB-C, étanche IPX8.",
    description:
      "Lampe torche en aluminium anodisé, 900 lumens en mode maximum et cinq modes d'éclairage. Batterie rechargeable par USB-C, autonomie jusqu'à 40 heures en mode éco. Étanche à l'immersion.",
    tip: "Pour la recherche au sang de nuit, une lumière blanche puissante fait ressortir les traces sur les feuilles mortes.",
    category: "equipement",
    image: img("lampe-torche"),
    specs: [
      { label: "Flux", value: "900 lumens" },
      { label: "Autonomie", value: "Jusqu'à 40 h" },
      { label: "Étanchéité", value: "IPX8" },
    ],
    variants: [{ label: "Modèle unique", price: 6990, stock: 0 }],
  },
  {
    slug: "gants-cuir-pleine-fleur",
    name: "Gants cuir pleine fleur",
    brand: "Orée",
    tagline: "Cuir de vachette souple, coutures renforcées.",
    description:
      "Gants de travail et de chasse en cuir de vachette pleine fleur, souples dès la première utilisation. Idéaux pour le débroussaillage, la pose de miradors et le transport du gibier.",
    tip: "Nourrissez le cuir avec une graisse incolore en fin de saison pour qu'il reste souple et imperméable.",
    category: "equipement",
    image: img("gants"),
    specs: [{ label: "Matière", value: "Vachette pleine fleur" }],
    variants: [
      { label: "M", price: 3490, stock: 20 },
      { label: "L", price: 3490, stock: 18 },
      { label: "XL", price: 3490, stock: 6 },
    ],
  },
  {
    slug: "boussole-de-visee",
    name: "Boussole de visée",
    brand: "Brumaire",
    tagline: "Boîtier métal, capot à fente de visée, cadran lumineux.",
    description:
      "Boussole à capot avec fente et ligne de visée pour relever un azimut avec précision. Cadran phosphorescent, boîtier métal résistant aux chocs. L'indispensable quand le réseau ne passe plus.",
    tip: "Éloignez-vous de tout objet métallique (véhicule, carabine, couteau) d'au moins un mètre avant de relever un azimut.",
    category: "equipement",
    image: img("boussole"),
    specs: [{ label: "Précision", value: "± 1°" }],
    variants: [{ label: "Modèle unique", price: 3990, stock: 14 }],
  },
  {
    slug: "fusil-harpon-calanque-iroko",
    name: "Fusil harpon Calanque Iroko",
    brand: "Calanque",
    tagline: "Fût iroko massif, double sandow 16 mm, flèche tahitienne.",
    description:
      "Arbalète en bois d'iroko massif, naturellement flottante et sans recul. Double sandow de 16 mm et flèche tahitienne de 6,5 mm pour une trajectoire tendue. Le 75 cm pour les failles et l'eau trouble, le 100 cm pour la pleine eau.",
    tip: "Choisissez la longueur selon votre eau : visibilité sous 8 m, restez sur un 75 cm maniable ; en eau claire et en pleine eau, le 100 cm gagne en portée.",
    category: "fusils-harpons",
    image: img("fusil-harpon"),
    isFeatured: true,
    specs: [
      { label: "Fût", value: "Iroko massif" },
      { label: "Sandows", value: "2 x 16 mm" },
      { label: "Flèche", value: "Tahitienne 6,5 mm" },
    ],
    variants: [
      { label: "75 cm", price: 32900, stock: 5 },
      { label: "90 cm", price: 34900, stock: 8 },
      { label: "100 cm", price: 36900, stock: 3 },
    ],
  },
  {
    slug: "masque-posidonie-faible-volume",
    name: "Masque Posidonie faible volume",
    brand: "Posidonie",
    tagline: "Bi-verre, 90 cm³, jupe silicone noir anti-reflet.",
    description:
      "Masque bi-verre à très faible volume intérieur : il se compense d'un souffle, même en profondeur. Jupe en silicone noir pour supprimer les reflets latéraux, sangle fendue confortable.",
    tip: "Avant la première sortie, frottez l'intérieur des verres avec un peu de dentifrice pour retirer le film de fabrication : c'est la fin de la buée.",
    category: "masques-palmes",
    image: img("masque"),
    isFeatured: true,
    specs: [
      { label: "Volume intérieur", value: "90 cm³" },
      { label: "Verres", value: "Trempés" },
      { label: "Jupe", value: "Silicone noir" },
    ],
    variants: [{ label: "Modèle unique", price: 6900, stock: 22 }],
  },
  {
    slug: "palmes-calanque-carbone",
    name: "Palmes Calanque Carbone",
    brand: "Calanque",
    tagline: "Voilures carbone tissé, rendement maximal.",
    description:
      "Palmes longues à voilures en carbone tissé : réactives, légères et d'un excellent rendement pour les descentes répétées. Chaussons ergonomiques à angle de voilure optimisé.",
    tip: "Palmez jambes presque tendues, depuis la hanche : ce sont les cuisses qui travaillent, pas les genoux.",
    category: "masques-palmes",
    image: img("palmes-carbone"),
    isFeatured: true,
    specs: [
      { label: "Voilure", value: "Carbone, 78 cm" },
      { label: "Dureté", value: "Medium" },
    ],
    variants: [
      { label: "40/41", price: 34900, stock: 3 },
      { label: "42/43", price: 34900, stock: 5 },
      { label: "44/45", price: 34900, stock: 2 },
    ],
  },
  {
    slug: "palmes-posidonie-fibre",
    name: "Palmes Posidonie Fibre",
    brand: "Posidonie",
    tagline: "Voilures fibre de verre, polyvalentes et tolérantes.",
    description:
      "Le bon compromis entre performance et robustesse : voilures en fibre de verre plus tolérantes que le carbone, presque aussi nerveuses. Idéales pour progresser.",
    tip: "Rincez-les à l'eau douce et stockez-les à plat, à l'abri du soleil : une voilure rangée tordue garde sa déformation.",
    category: "masques-palmes",
    image: img("palmes-fibre"),
    specs: [{ label: "Voilure", value: "Fibre de verre, 76 cm" }],
    variants: [
      { label: "40/41", price: 15900, compareAt: 17900, stock: 9 },
      { label: "42/43", price: 15900, compareAt: 17900, stock: 14 },
      { label: "44/45", price: 15900, compareAt: 17900, stock: 6 },
    ],
  },
  {
    slug: "combinaison-posidonie-5mm",
    name: "Combinaison Posidonie 5 mm",
    brand: "Posidonie",
    tagline: "Néoprène refendu, camouflage herbier, cagoule intégrée.",
    description:
      "Combinaison deux pièces en néoprène refendu 5 mm : veste à cagoule intégrée et pantalon taille haute. Camouflage herbier pour se fondre dans la posidonie, renforts aux coudes et aux genoux.",
    tip: "Le refendu s'enfile mouillé : versez un peu d'eau légèrement savonneuse à l'intérieur et la combinaison glisse sans forcer.",
    category: "combinaisons",
    image: img("combinaison"),
    isFeatured: true,
    specs: [
      { label: "Épaisseur", value: "5 mm" },
      { label: "Intérieur", value: "Refendu" },
      { label: "Température d'eau", value: "14 à 20 °C" },
    ],
    variants: [
      { label: "S", price: 29900, compareAt: 33900, stock: 4 },
      { label: "M", price: 29900, compareAt: 33900, stock: 6 },
      { label: "L", price: 29900, compareAt: 33900, stock: 5 },
      { label: "XL", price: 29900, compareAt: 33900, stock: 1 },
    ],
  },
  {
    slug: "bouee-de-signalisation",
    name: "Bouée de signalisation",
    brand: "Calanque",
    tagline: "Pavillon Alpha, 30 m de ligne flottante.",
    description:
      "Bouée torpille orange haute visibilité avec pavillon Alpha réglementaire, 30 m de ligne flottante et anneaux d'accroche pour vos prises. La signalisation est obligatoire en chasse sous-marine.",
    tip: "Gardez la ligne tendue au-dessus de vous : une bouée qui dérive à 50 m ne signale plus votre position aux bateaux.",
    category: "securite",
    image: img("bouee"),
    specs: [
      { label: "Ligne", value: "30 m flottante" },
      { label: "Pavillon", value: "Alpha réglementaire" },
    ],
    variants: [{ label: "Modèle unique", price: 4990, stock: 35 }],
  },
];

await db.transaction(async (tx) => {
  await tx.execute(
    sql`truncate order_items, orders, cart_items, carts, variants, products, categories, sessions, users cascade`,
  );

  await tx.insert(schema.users).values([
    {
      email: "admin@affut-apnee.test",
      name: "Équipe Affût & Apnée",
      role: "admin",
      passwordHash: await hashPassword("123"),
    },
    {
      email: "client@affut-apnee.test",
      name: "Camille Martin",
      passwordHash: await hashPassword("123"),
    },
  ]);

  const insertedCategories = await tx
    .insert(schema.categories)
    .values(categories.map((c, position) => ({ ...c, position })))
    .returning();
  const categoryId = Object.fromEntries(insertedCategories.map((c) => [c.slug, c.id]));

  for (const { category, variants, ...product } of catalog) {
    const [created] = await tx
      .insert(schema.products)
      .values({ ...product, categoryId: categoryId[category] })
      .returning();
    await tx.insert(schema.variants).values(
      variants.map((v, position) => ({
        productId: created.id,
        sku: `AA-${product.slug.slice(0, 20).toUpperCase()}-${position + 1}`,
        label: v.label,
        priceCents: v.price,
        compareAtCents: v.compareAt ?? null,
        stock: v.stock,
        position,
      })),
    );
  }
});

await client.end();
console.log(`Seed terminé : ${categories.length} catégories, ${catalog.length} produits, 2 comptes de démonstration.`);

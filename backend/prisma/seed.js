// backend/prisma/seed.js
// Loads the starting Kenyan destinations and subscription plans into MySQL.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const destinations = [
  {
    "slug": "maasai-mara",
    "name": "Maasai Mara National Reserve",
    "county": "Narok",
    "region": "Rift Valley",
    "category": "Safari",
    "summary": "Kenya's flagship reserve and stage of the Great Migration.",
    "description": "Rolling savannah dotted with acacia, home to the Big Five and the annual wildebeest migration across the Mara River.",
    "bestSeason": "July to October",
    "activities": ["Game drives", "Hot air ballooning", "Big Five", "Cultural visits"],
    "highlights": ["Great Migration", "Mara River crossings", "Maasai villages"],
    "featured": true
  },
  {
    "slug": "amboseli",
    "name": "Amboseli National Park",
    "county": "Kajiado",
    "region": "Rift Valley",
    "category": "Safari",
    "summary": "Great elephant herds beneath Mount Kilimanjaro.",
    "description": "Famous for large tusker elephants and unmatched views of Kilimanjaro across dusty plains and swamp-fed marshes.",
    "bestSeason": "June to October",
    "activities": ["Game drives", "Elephant watching", "Photography", "Bird watching"],
    "highlights": ["Kilimanjaro views", "Tusker elephants", "Observation Hill"],
    "featured": true
  },
  {
    "slug": "diani-beach",
    "name": "Diani Beach",
    "county": "Kwale",
    "region": "Coast",
    "category": "Beach",
    "summary": "White sand, warm reef and coastal palms south of Mombasa.",
    "description": "A 17km stretch of powder-white beach with coral reef diving, kite surfing and dhow sailing.",
    "bestSeason": "December to March",
    "activities": ["Diving", "Kite surfing", "Dhow sailing", "Snorkelling"],
    "highlights": ["Coral reef", "Colobus monkeys", "Kisite Marine Park"],
    "featured": true
  },
  {
    "slug": "mount-kenya",
    "name": "Mount Kenya National Park",
    "county": "Meru",
    "region": "Central",
    "category": "Mountain",
    "summary": "Africa's second highest peak with glaciers on the equator.",
    "description": "Trek Sirimon, Chogoria or Naro Moru routes to Point Lenana through moorland and afro-alpine scenery.",
    "bestSeason": "January to March, July to October",
    "activities": ["Trekking", "Climbing", "Bird watching", "Camping"],
    "highlights": ["Point Lenana", "Glacial tarns", "Giant lobelia"],
    "featured": true
  },
  {
    "slug": "tsavo-east",
    "name": "Tsavo East National Park",
    "county": "Taita Taveta",
    "region": "Coast",
    "category": "Safari",
    "summary": "Vast red-earth wilderness and the Galana River.",
    "description": "One of the world's largest parks, known for red-dust elephants, Mudanda Rock and the Yatta Plateau.",
    "bestSeason": "June to October",
    "activities": ["Game drives", "Camping", "Bird watching"],
    "highlights": ["Red elephants", "Lugard Falls", "Yatta Plateau"],
    "featured": false
  },
  {
    "slug": "tsavo-west",
    "name": "Tsavo West National Park",
    "county": "Taita Taveta",
    "region": "Coast",
    "category": "Safari",
    "summary": "Volcanic hills, lava flows and crystal springs.",
    "description": "More rugged than its twin, with Mzima Springs hippo pools and the Shetani lava flow.",
    "bestSeason": "June to October",
    "activities": ["Game drives", "Rhino sanctuary", "Volcano walks"],
    "highlights": ["Mzima Springs", "Shetani lava flow", "Ngulia Rhino Sanctuary"],
    "featured": false
  },
  {
    "slug": "nairobi-national-park",
    "name": "Nairobi National Park",
    "county": "Nairobi",
    "region": "Nairobi",
    "category": "Safari",
    "summary": "The only national park bordering a capital city.",
    "description": "Rhino stronghold with lions and giraffe grazing against the Nairobi skyline, minutes from the city.",
    "bestSeason": "All year",
    "activities": ["Game drives", "Rhino tracking", "Day trips"],
    "highlights": ["City skyline game viewing", "Black rhino", "Ivory Burning Site"],
    "featured": true
  },
  {
    "slug": "lake-nakuru",
    "name": "Lake Nakuru National Park",
    "county": "Nakuru",
    "region": "Rift Valley",
    "category": "Safari",
    "summary": "Alkaline lake fringed by flamingos and rhino country.",
    "description": "A fenced sanctuary with white and black rhino, Rothschild giraffe and huge flocks of flamingo and pelican.",
    "bestSeason": "June to March",
    "activities": ["Game drives", "Bird watching", "Rhino tracking"],
    "highlights": ["Flamingos", "Baboon Cliff", "Makalia Falls"],
    "featured": false
  },
  {
    "slug": "lake-naivasha",
    "name": "Lake Naivasha",
    "county": "Nakuru",
    "region": "Rift Valley",
    "category": "Lakes",
    "summary": "Freshwater lake of hippos, fish eagles and flower farms.",
    "description": "Boat rides among hippos, walking safaris on Crescent Island and easy access to Hell's Gate.",
    "bestSeason": "All year",
    "activities": ["Boat rides", "Walking safari", "Cycling", "Bird watching"],
    "highlights": ["Crescent Island", "Hippo pods", "Fish eagles"],
    "featured": true
  },
  {
    "slug": "hells-gate",
    "name": "Hell's Gate National Park",
    "county": "Nakuru",
    "region": "Rift Valley",
    "category": "Adventure",
    "summary": "Cycle and hike between towering red cliffs.",
    "description": "Geothermal gorges, Fischer's Tower and open plains you can explore on foot or by bike.",
    "bestSeason": "All year",
    "activities": ["Cycling", "Gorge hiking", "Rock climbing"],
    "highlights": ["Fischer's Tower", "Ol Njorowa Gorge", "Hot springs"],
    "featured": false
  },
  {
    "slug": "samburu",
    "name": "Samburu National Reserve",
    "county": "Samburu",
    "region": "Northern",
    "category": "Safari",
    "summary": "Arid northern wilderness with the special five.",
    "description": "The Ewaso Ng'iro river draws elephant herds, Grevy's zebra, reticulated giraffe and gerenuk.",
    "bestSeason": "June to October",
    "activities": ["Game drives", "Cultural visits", "Bird watching"],
    "highlights": ["Special Five", "Ewaso Ng'iro river", "Samburu culture"],
    "featured": false
  },
  {
    "slug": "meru-national-park",
    "name": "Meru National Park",
    "county": "Meru",
    "region": "Eastern",
    "category": "Safari",
    "summary": "Remote, lush and famously wild — the land of Elsa.",
    "description": "Rivers, doum palms and open grassland with rhino sanctuary and very few vehicles.",
    "bestSeason": "June to September",
    "activities": ["Game drives", "Fishing", "Rhino sanctuary"],
    "highlights": ["Elsa's grave", "Adamson's Falls", "Rhino sanctuary"],
    "featured": false
  },
  {
    "slug": "aberdare",
    "name": "Aberdare National Park",
    "county": "Nyeri",
    "region": "Central",
    "category": "Mountain",
    "summary": "Misty highland forest, waterfalls and tree lodges.",
    "description": "Bamboo forest and moorland home to elephant, bongo and black leopard, with famous waterfall drops.",
    "bestSeason": "January to February, June to September",
    "activities": ["Trout fishing", "Waterfall hikes", "Night game viewing"],
    "highlights": ["Karuru Falls", "Bongo antelope", "Tree lodges"],
    "featured": false
  },
  {
    "slug": "shimba-hills",
    "name": "Shimba Hills National Reserve",
    "county": "Kwale",
    "region": "Coast",
    "category": "Safari",
    "summary": "Coastal rainforest and the last sable antelope.",
    "description": "Green hills above Diani with sable antelope, elephant and the Sheldrick Falls walk.",
    "bestSeason": "June to October",
    "activities": ["Game drives", "Forest walks", "Bird watching"],
    "highlights": ["Sable antelope", "Sheldrick Falls", "Coastal views"],
    "featured": false
  },
  {
    "slug": "watamu",
    "name": "Watamu",
    "county": "Kilifi",
    "region": "Coast",
    "category": "Beach",
    "summary": "Marine park, turtle nesting and turquoise coves.",
    "description": "Watamu Marine National Park protects reef gardens, and Mida Creek offers boardwalk sunsets.",
    "bestSeason": "October to March",
    "activities": ["Snorkelling", "Diving", "Kayaking", "Turtle watching"],
    "highlights": ["Watamu Marine Park", "Mida Creek", "Gede Ruins"],
    "featured": true
  },
  {
    "slug": "malindi",
    "name": "Malindi",
    "county": "Kilifi",
    "region": "Coast",
    "category": "Beach",
    "summary": "Swahili-Italian coastal town with reef and history.",
    "description": "Golden beaches, the Vasco da Gama Pillar and access to Malindi Marine National Park.",
    "bestSeason": "October to March",
    "activities": ["Snorkelling", "Deep sea fishing", "Historic tours"],
    "highlights": ["Vasco da Gama Pillar", "Marine park", "Falconry"],
    "featured": false
  },
  {
    "slug": "lamu",
    "name": "Lamu Island",
    "county": "Lamu",
    "region": "Coast",
    "category": "Cultural",
    "summary": "A UNESCO Swahili town of dhows and coral stone.",
    "description": "Car-free lanes, carved doors, dhow sailing and Shela's long empty beach.",
    "bestSeason": "June to October",
    "activities": ["Dhow sailing", "Heritage walks", "Beach"],
    "highlights": ["Lamu Old Town", "Shela Beach", "Lamu Cultural Festival"],
    "featured": true
  },
  {
    "slug": "mombasa",
    "name": "Mombasa",
    "county": "Mombasa",
    "region": "Coast",
    "category": "Cultural",
    "summary": "Kenya's coastal capital of forts, spice and old town.",
    "description": "Fort Jesus, Old Town alleys and the north and south coast beaches on either side.",
    "bestSeason": "All year",
    "activities": ["Historic tours", "Beach", "Food tours"],
    "highlights": ["Fort Jesus", "Old Town", "Haller Park"],
    "featured": false
  },
  {
    "slug": "nairobi",
    "name": "Nairobi",
    "county": "Nairobi",
    "region": "Nairobi",
    "category": "City",
    "summary": "Safari capital with museums, markets and giraffes.",
    "description": "Base for the Giraffe Centre, elephant orphanage, Karen Blixen Museum and a strong food scene.",
    "bestSeason": "All year",
    "activities": ["City tours", "Museums", "Food tours", "Day safaris"],
    "highlights": ["Giraffe Centre", "Elephant orphanage", "Karen Blixen Museum"],
    "featured": false
  },
  {
    "slug": "kakamega-forest",
    "name": "Kakamega Forest",
    "county": "Kakamega",
    "region": "Western",
    "category": "Nature",
    "summary": "Kenya's last tropical rainforest and birding gem.",
    "description": "Remnant Guineo-Congolian rainforest with 300+ bird species, monkeys and butterflies.",
    "bestSeason": "All year",
    "activities": ["Bird watching", "Forest walks", "Butterfly spotting"],
    "highlights": ["Rainforest canopy", "Great blue turaco", "Lirhanda Hill"],
    "featured": false
  },
  {
    "slug": "kisumu",
    "name": "Kisumu & Lake Victoria",
    "county": "Kisumu",
    "region": "Western",
    "category": "Lakes",
    "summary": "Lakeside city of sunsets, fish and hippo boat trips.",
    "description": "Dunga Beach boat rides, Impala Sanctuary and the Kit Mikayi rock formation nearby.",
    "bestSeason": "All year",
    "activities": ["Boat rides", "Bird watching", "City tours"],
    "highlights": ["Lake Victoria sunsets", "Impala Sanctuary", "Dunga Beach"],
    "featured": false
  },
  {
    "slug": "lake-turkana",
    "name": "Lake Turkana",
    "county": "Turkana",
    "region": "Northern",
    "category": "Adventure",
    "summary": "The Jade Sea — vast, remote and prehistoric.",
    "description": "World's largest desert lake, with Central Island volcanoes, Turkana culture and Koobi Fora fossil beds.",
    "bestSeason": "June to September",
    "activities": ["Cultural visits", "Boat rides", "Expedition travel"],
    "highlights": ["Central Island", "Koobi Fora", "Turkana Festival"],
    "featured": false
  },
  {
    "slug": "chalbi-desert",
    "name": "Chalbi Desert",
    "county": "Marsabit",
    "region": "Northern",
    "category": "Adventure",
    "summary": "Salt-pan desert crossings in Kenya's far north.",
    "description": "Shimmering white flats between Kalacha and North Horr, best reached on an expedition itinerary.",
    "bestSeason": "June to September",
    "activities": ["Expedition travel", "Cultural visits", "Photography"],
    "highlights": ["Salt flats", "Oasis villages", "Gabbra culture"],
    "featured": false
  },
  {
    "slug": "marsabit",
    "name": "Marsabit National Park",
    "county": "Marsabit",
    "region": "Northern",
    "category": "Nature",
    "summary": "Forested mountain island above the northern desert.",
    "description": "Misty cloud forest crater lakes surrounded by arid plains, known for big-tusked elephants.",
    "bestSeason": "June to September",
    "activities": ["Game drives", "Crater hikes", "Bird watching"],
    "highlights": ["Lake Paradise", "Cloud forest", "Singing wells"],
    "featured": false
  },
  {
    "slug": "nanyuki-laikipia",
    "name": "Nanyuki & Laikipia",
    "county": "Laikipia",
    "region": "Central",
    "category": "Safari",
    "summary": "Private conservancies at the foot of Mount Kenya.",
    "description": "Ol Pejeta, Solio and Borana conservancies offer rhino, walking safaris and horseback game viewing.",
    "bestSeason": "All year",
    "activities": ["Walking safari", "Rhino tracking", "Horse riding", "Night drives"],
    "highlights": ["Ol Pejeta", "Equator crossing", "Mount Kenya views"],
    "featured": true
  },
  {
    "slug": "ruma",
    "name": "Ruma National Park",
    "county": "Homa Bay",
    "region": "Western",
    "category": "Safari",
    "summary": "Kenya's only home of the roan antelope.",
    "description": "Quiet Lambwe Valley park with roan antelope, Rothschild giraffe and rolling green hills.",
    "bestSeason": "June to October",
    "activities": ["Game drives", "Bird watching"],
    "highlights": ["Roan antelope", "Lambwe Valley", "Rothschild giraffe"],
    "featured": false
  },
  {
    "slug": "saiwa-swamp",
    "name": "Saiwa Swamp National Park",
    "county": "Trans Nzoia",
    "region": "Western",
    "category": "Nature",
    "summary": "Kenya's smallest park, walked on boardwalks.",
    "description": "Tree-lined swamp visited on foot for sitatunga antelope, de Brazza's monkey and rich birdlife.",
    "bestSeason": "All year",
    "activities": ["Walking safari", "Bird watching"],
    "highlights": ["Sitatunga", "Observation towers", "De Brazza's monkey"],
    "featured": false
  },
  {
    "slug": "loita-hills",
    "name": "Loita Hills",
    "county": "Narok",
    "region": "Rift Valley",
    "category": "Cultural",
    "summary": "Maasai forest highlands for walking safaris.",
    "description": "The Forest of the Lost Child — multi-day guided walks with Maasai warriors and fly camps.",
    "bestSeason": "June to October",
    "activities": ["Walking safari", "Cultural visits", "Fly camping"],
    "highlights": ["Maasai guides", "Cedar forest", "Fly camps"],
    "featured": false
  },
  {
    "slug": "isiolo",
    "name": "Isiolo",
    "county": "Isiolo",
    "region": "Northern",
    "category": "City",
    "summary": "Gateway town to Kenya's northern frontier.",
    "description": "Staging post for Samburu, Shaba and the Mathews Range, with lively frontier markets.",
    "bestSeason": "June to October",
    "activities": ["Cultural visits", "Market tours", "Road expeditions"],
    "highlights": ["Frontier markets", "Samburu access", "Mathews Range"],
    "featured": false
  }
];

const plans = [
  { "slug": "free", "name": "Free", "description": "Get started and test the marketplace.", "priceKes": 0, "priceKesAnnual": 0, "leadLimitMonthly": 5, "storageMb": 100, "crmAccess": false, "reportsAccess": false, "staffAccounts": 1, "packageLimit": 3, "priorityRank": 0, "premiumBadge": false, "featuredListing": false, "sortOrder": 1 },
  { "slug": "basic", "name": "Basic", "description": "For small operators building a pipeline.", "priceKes": 2500, "priceKesAnnual": 25000, "leadLimitMonthly": 30, "storageMb": 1024, "crmAccess": true, "reportsAccess": false, "staffAccounts": 2, "packageLimit": 10, "priorityRank": 10, "premiumBadge": false, "featuredListing": false, "sortOrder": 2 },
  { "slug": "professional", "name": "Professional", "description": "Full CRM, reports and a premium badge.", "priceKes": 7500, "priceKesAnnual": 75000, "leadLimitMonthly": 150, "storageMb": 5120, "crmAccess": true, "reportsAccess": true, "staffAccounts": 5, "packageLimit": 40, "priorityRank": 20, "premiumBadge": true, "featuredListing": false, "sortOrder": 3 },
  { "slug": "enterprise", "name": "Enterprise", "description": "Unlimited leads, featured listings and priority ranking.", "priceKes": 20000, "priceKesAnnual": 200000, "leadLimitMonthly": null, "storageMb": 51200, "crmAccess": true, "reportsAccess": true, "staffAccounts": 25, "packageLimit": null, "priorityRank": 30, "premiumBadge": true, "featuredListing": true, "sortOrder": 4 }
];

async function main() {
  console.log(`Seeding ${destinations.length} destinations...`);
  for (const d of destinations) {
    await prisma.destination.upsert({
      where: { slug: d.slug },
      update: d,
      create: d,
    });
  }

  console.log(`Seeding ${plans.length} subscription plans...`);
  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
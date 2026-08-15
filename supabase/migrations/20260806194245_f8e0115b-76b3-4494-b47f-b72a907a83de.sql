CREATE TABLE public.destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  county TEXT NOT NULL,
  region TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  best_season TEXT,
  activities TEXT[] NOT NULL DEFAULT '{}',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.destinations TO anon;
GRANT SELECT ON public.destinations TO authenticated;
GRANT ALL ON public.destinations TO service_role;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Destinations are publicly viewable" ON public.destinations FOR SELECT USING (true);

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  nationality TEXT,
  country TEXT,
  phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'English',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.trip_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  destination_slug TEXT,
  destination_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  flexible_dates BOOLEAN NOT NULL DEFAULT false,
  adults INTEGER NOT NULL DEFAULT 2,
  children INTEGER NOT NULL DEFAULT 0,
  budget_usd NUMERIC,
  accommodation_type TEXT,
  transport_preference TEXT,
  luxury_level TEXT,
  activities TEXT[] NOT NULL DEFAULT '{}',
  nationality TEXT,
  arrival_airport TEXT,
  pickup_location TEXT,
  dietary_requirements TEXT,
  special_needs TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_requests TO authenticated;
GRANT ALL ON public.trip_requests TO service_role;
ALTER TABLE public.trip_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Travellers manage their own trip requests" ON public.trip_requests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trip_requests_updated_at BEFORE UPDATE ON public.trip_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.destinations (slug, name, county, region, category, summary, description, best_season, activities, highlights, featured) VALUES
('maasai-mara','Maasai Mara National Reserve','Narok','Rift Valley','Safari','Kenya''s flagship reserve and stage of the Great Migration.','Rolling savannah dotted with acacia, home to the Big Five and the annual wildebeest migration across the Mara River.','July to October','{"Game drives","Hot air ballooning","Big Five","Cultural visits"}','{"Great Migration","Mara River crossings","Maasai villages"}',true),
('amboseli','Amboseli National Park','Kajiado','Rift Valley','Safari','Great elephant herds beneath Mount Kilimanjaro.','Famous for large tusker elephants and unmatched views of Kilimanjaro across dusty plains and swamp-fed marshes.','June to October','{"Game drives","Elephant watching","Photography","Bird watching"}','{"Kilimanjaro views","Tusker elephants","Observation Hill"}',true),
('diani-beach','Diani Beach','Kwale','Coast','Beach','White sand, warm reef and coastal palms south of Mombasa.','A 17km stretch of powder-white beach with coral reef diving, kite surfing and dhow sailing.','December to March','{"Diving","Kite surfing","Dhow sailing","Snorkelling"}','{"Coral reef","Colobus monkeys","Kisite Marine Park"}',true),
('mount-kenya','Mount Kenya National Park','Meru','Central','Mountain','Africa''s second highest peak with glaciers on the equator.','Trek Sirimon, Chogoria or Naro Moru routes to Point Lenana through moorland and afro-alpine scenery.','January to March, July to October','{"Trekking","Climbing","Bird watching","Camping"}','{"Point Lenana","Glacial tarns","Giant lobelia"}',true),
('tsavo-east','Tsavo East National Park','Taita Taveta','Coast','Safari','Vast red-earth wilderness and the Galana River.','One of the world''s largest parks, known for red-dust elephants, Mudanda Rock and the Yatta Plateau.','June to October','{"Game drives","Camping","Bird watching"}','{"Red elephants","Lugard Falls","Yatta Plateau"}',false),
('tsavo-west','Tsavo West National Park','Taita Taveta','Coast','Safari','Volcanic hills, lava flows and crystal springs.','More rugged than its twin, with Mzima Springs hippo pools and the Shetani lava flow.','June to October','{"Game drives","Rhino sanctuary","Volcano walks"}','{"Mzima Springs","Shetani lava flow","Ngulia Rhino Sanctuary"}',false),
('nairobi-national-park','Nairobi National Park','Nairobi','Nairobi','Safari','The only national park bordering a capital city.','Rhino stronghold with lions and giraffe grazing against the Nairobi skyline, minutes from the city.','All year','{"Game drives","Rhino tracking","Day trips"}','{"City skyline game viewing","Black rhino","Ivory Burning Site"}',true),
('lake-nakuru','Lake Nakuru National Park','Nakuru','Rift Valley','Safari','Alkaline lake fringed by flamingos and rhino country.','A fenced sanctuary with white and black rhino, Rothschild giraffe and huge flocks of flamingo and pelican.','June to March','{"Game drives","Bird watching","Rhino tracking"}','{"Flamingos","Baboon Cliff","Makalia Falls"}',false),
('lake-naivasha','Lake Naivasha','Nakuru','Rift Valley','Lakes','Freshwater lake of hippos, fish eagles and flower farms.','Boat rides among hippos, walking safaris on Crescent Island and easy access to Hell''s Gate.','All year','{"Boat rides","Walking safari","Cycling","Bird watching"}','{"Crescent Island","Hippo pods","Fish eagles"}',true),
('hells-gate','Hell''s Gate National Park','Nakuru','Rift Valley','Adventure','Cycle and hike between towering red cliffs.','Geothermal gorges, Fischer''s Tower and open plains you can explore on foot or by bike.','All year','{"Cycling","Gorge hiking","Rock climbing"}','{"Fischer''s Tower","Ol Njorowa Gorge","Hot springs"}',false),
('samburu','Samburu National Reserve','Samburu','Northern','Safari','Arid northern wilderness with the special five.','The Ewaso Ng''iro river draws elephant herds, Grevy''s zebra, reticulated giraffe and gerenuk.','June to October','{"Game drives","Cultural visits","Bird watching"}','{"Special Five","Ewaso Ng''iro river","Samburu culture"}',false),
('meru-national-park','Meru National Park','Meru','Eastern','Safari','Remote, lush and famously wild — the land of Elsa.','Rivers, doum palms and open grassland with rhino sanctuary and very few vehicles.','June to September','{"Game drives","Fishing","Rhino sanctuary"}','{"Elsa''s grave","Adamson''s Falls","Rhino sanctuary"}',false),
('aberdare','Aberdare National Park','Nyeri','Central','Mountain','Misty highland forest, waterfalls and tree lodges.','Bamboo forest and moorland home to elephant, bongo and black leopard, with famous waterfall drops.','January to February, June to September','{"Trout fishing","Waterfall hikes","Night game viewing"}','{"Karuru Falls","Bongo antelope","Tree lodges"}',false),
('shimba-hills','Shimba Hills National Reserve','Kwale','Coast','Safari','Coastal rainforest and the last sable antelope.','Green hills above Diani with sable antelope, elephant and the Sheldrick Falls walk.','June to October','{"Game drives","Forest walks","Bird watching"}','{"Sable antelope","Sheldrick Falls","Coastal views"}',false),
('watamu','Watamu','Kilifi','Coast','Beach','Marine park, turtle nesting and turquoise coves.','Watamu Marine National Park protects reef gardens, and Mida Creek offers boardwalk sunsets.','October to March','{"Snorkelling","Diving","Kayaking","Turtle watching"}','{"Watamu Marine Park","Mida Creek","Gede Ruins"}',true),
('malindi','Malindi','Kilifi','Coast','Beach','Swahili-Italian coastal town with reef and history.','Golden beaches, the Vasco da Gama Pillar and access to Malindi Marine National Park.','October to March','{"Snorkelling","Deep sea fishing","Historic tours"}','{"Vasco da Gama Pillar","Marine park","Falconry"}',false),
('lamu','Lamu Island','Lamu','Coast','Cultural','A UNESCO Swahili town of dhows and coral stone.','Car-free lanes, carved doors, dhow sailing and Shela''s long empty beach.','June to October','{"Dhow sailing","Heritage walks","Beach"}','{"Lamu Old Town","Shela Beach","Lamu Cultural Festival"}',true),
('mombasa','Mombasa','Mombasa','Coast','Cultural','Kenya''s coastal capital of forts, spice and old town.','Fort Jesus, Old Town alleys and the north and south coast beaches on either side.','All year','{"Historic tours","Beach","Food tours"}','{"Fort Jesus","Old Town","Haller Park"}',false),
('nairobi','Nairobi','Nairobi','Nairobi','City','Safari capital with museums, markets and giraffes.','Base for the Giraffe Centre, elephant orphanage, Karen Blixen Museum and a strong food scene.','All year','{"City tours","Museums","Food tours","Day safaris"}','{"Giraffe Centre","Elephant orphanage","Karen Blixen Museum"}',false),
('kakamega-forest','Kakamega Forest','Kakamega','Western','Nature','Kenya''s last tropical rainforest and birding gem.','Remnant Guineo-Congolian rainforest with 300+ bird species, monkeys and butterflies.','All year','{"Bird watching","Forest walks","Butterfly spotting"}','{"Rainforest canopy","Great blue turaco","Lirhanda Hill"}',false),
('kisumu','Kisumu & Lake Victoria','Kisumu','Western','Lakes','Lakeside city of sunsets, fish and hippo boat trips.','Dunga Beach boat rides, Impala Sanctuary and the Kit Mikayi rock formation nearby.','All year','{"Boat rides","Bird watching","City tours"}','{"Lake Victoria sunsets","Impala Sanctuary","Dunga Beach"}',false),
('lake-turkana','Lake Turkana','Turkana','Northern','Adventure','The Jade Sea — vast, remote and prehistoric.','World''s largest desert lake, with Central Island volcanoes, Turkana culture and Koobi Fora fossil beds.','June to September','{"Cultural visits","Boat rides","Expedition travel"}','{"Central Island","Koobi Fora","Turkana Festival"}',false),
('chalbi-desert','Chalbi Desert','Marsabit','Northern','Adventure','Salt-pan desert crossings in Kenya''s far north.','Shimmering white flats between Kalacha and North Horr, best reached on an expedition itinerary.','June to September','{"Expedition travel","Cultural visits","Photography"}','{"Salt flats","Oasis villages","Gabbra culture"}',false),
('marsabit','Marsabit National Park','Marsabit','Northern','Nature','Forested mountain island above the northern desert.','Misty cloud forest crater lakes surrounded by arid plains, known for big-tusked elephants.','June to September','{"Game drives","Crater hikes","Bird watching"}','{"Lake Paradise","Cloud forest","Singing wells"}',false),
('nanyuki-laikipia','Nanyuki & Laikipia','Laikipia','Central','Safari','Private conservancies at the foot of Mount Kenya.','Ol Pejeta, Solio and Borana conservancies offer rhino, walking safaris and horseback game viewing.','All year','{"Walking safari","Rhino tracking","Horse riding","Night drives"}','{"Ol Pejeta","Equator crossing","Mount Kenya views"}',true),
('ruma','Ruma National Park','Homa Bay','Western','Safari','Kenya''s only home of the roan antelope.','Quiet Lambwe Valley park with roan antelope, Rothschild giraffe and rolling green hills.','June to October','{"Game drives","Bird watching"}','{"Roan antelope","Lambwe Valley","Rothschild giraffe"}',false),
('saiwa-swamp','Saiwa Swamp National Park','Trans Nzoia','Western','Nature','Kenya''s smallest park, walked on boardwalks.','Tree-lined swamp visited on foot for sitatunga antelope, de Brazza''s monkey and rich birdlife.','All year','{"Walking safari","Bird watching"}','{"Sitatunga","Observation towers","De Brazza''s monkey"}',false),
('loita-hills','Loita Hills','Narok','Rift Valley','Cultural','Maasai forest highlands for walking safaris.','The Forest of the Lost Child — multi-day guided walks with Maasai warriors and fly camps.','June to October','{"Walking safari","Cultural visits","Fly camping"}','{"Maasai guides","Cedar forest","Fly camps"}',false),
('isiolo','Isiolo','Isiolo','Northern','City','Gateway town to Kenya''s northern frontier.','Staging post for Samburu, Shaba and the Mathews Range, with lively frontier markets.','June to October','{"Cultural visits","Market tours","Road expeditions"}','{"Frontier markets","Samburu access","Mathews Range"}',false);
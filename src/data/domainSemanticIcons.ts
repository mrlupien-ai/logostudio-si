import { ColorPalette } from "../types/logo";
import { COLOR_PALETTES } from "./domains";
import { DOMAIN_ICON_GROUPS, DomainIconGroups, flattenIconGroups } from "./domainIconGroups";

export interface DomainMatchResult {
  niche: string;
  icons: string[];
  groups: DomainIconGroups;
  palette: ColorPalette;
}

// 1. Palette index mapping for the 223 portfolio domains
export const EXACT_DOMAIN_INFO: Record<string, { paletteIdx: number }> = {
  "4kimages.com": { paletteIdx: 5 },
  "adstock.org": { paletteIdx: 0 },
  "affcar.com": { paletteIdx: 8 },
  "affcart.com": { paletteIdx: 3 },
  "affpet.com": { paletteIdx: 3 },
  "allfancyfont.com": { paletteIdx: 2 },
  "allfancyfonts.com": { paletteIdx: 2 },
  "analyzestock.com": { paletteIdx: 0 },
  "antarcticshop.com": { paletteIdx: 4 },
  "apetshopz.com": { paletteIdx: 3 },
  "applebids.com": { paletteIdx: 3 },
  "archiveonline.net": { paletteIdx: 4 },
  "articlegenerator.net": { paletteIdx: 7 },
  "asciiart.studio": { paletteIdx: 6 },
  "autolisting.org": { paletteIdx: 8 },
  "automatic.onl": { paletteIdx: 2 },
  "automotive.ad": { paletteIdx: 8 },
  "automotive.onl": { paletteIdx: 8 },
  "avatardesign.net": { paletteIdx: 3 },
  "barcode.codes": { paletteIdx: 8 },
  "barcode.onl": { paletteIdx: 8 },
  "barcodeanalyzer.com": { paletteIdx: 8 },
  "bestcareers.net": { paletteIdx: 1 },
  "bid.onl": { paletteIdx: 3 },
  "bioofy.com": { paletteIdx: 7 },
  "blackbeautychannel.com": { paletteIdx: 5 },
  "bloggerposter.com": { paletteIdx: 7 },
  "blogposts.net": { paletteIdx: 7 },
  "booksshops.com": { paletteIdx: 9 },
  "booksstore.net": { paletteIdx: 9 },
  "breadrecipe.net": { paletteIdx: 9 },
  "brisketrecipes.com": { paletteIdx: 9 },
  "browse.ad": { paletteIdx: 1 },
  "businessaddress.net": { paletteIdx: 4 },
  "businessescards.com": { paletteIdx: 1 },
  "businessideas.us": { paletteIdx: 1 },
  "businesslibrary.net": { paletteIdx: 4 },
  "busses.us": { paletteIdx: 8 },
  "buyandsell.onl": { paletteIdx: 3 },
  "canesshop.com": { paletteIdx: 4 },
  "careermanager.net": { paletteIdx: 1 },
  "carinform.com": { paletteIdx: 8 },
  "childeducation.net": { paletteIdx: 4 },
  "codes.zone": { paletteIdx: 2 },
  "comparing.us": { paletteIdx: 1 },
  "comparisoncars.com": { paletteIdx: 8 },
  "computersmemory.com": { paletteIdx: 6 },
  "computersprice.com": { paletteIdx: 6 },
  "consumersdeals.com": { paletteIdx: 3 },
  "cooker.us": { paletteIdx: 9 },
  "coolfonts.cool": { paletteIdx: 2 },
  "coolsymbol.cool": { paletteIdx: 6 },
  "coolsymbols.cool": { paletteIdx: 6 },
  "counter.onl": { paletteIdx: 6 },
  "couponcode.one": { paletteIdx: 3 },
  "courses.onl": { paletteIdx: 4 },
  "courseweb.org": { paletteIdx: 4 },
  "currencyexchanger.net": { paletteIdx: 0 },
  "cutecaptions.com": { paletteIdx: 2 },
  "dealspalace.com": { paletteIdx: 3 },
  "dealssaving.com": { paletteIdx: 3 },
  "domainarchive.net": { paletteIdx: 4 },
  "domainnameservices.net": { paletteIdx: 1 },
  "downloadicons.com": { paletteIdx: 3 },
  "downloadicons.net": { paletteIdx: 3 },
  "easysend.net": { paletteIdx: 1 },
  "eggrecipes.net": { paletteIdx: 9 },
  "empiresweb.com": { paletteIdx: 0 },
  "endowment.net": { paletteIdx: 0 },
  "endowment.us": { paletteIdx: 0 },
  "engineerings.net": { paletteIdx: 2 },
  "eroticaexpress.com": { paletteIdx: 5 },
  "eroticalover.com": { paletteIdx: 5 },
  "eroticaplace.com": { paletteIdx: 5 },
  "eroticbooks.net": { paletteIdx: 5 },
  "eroticwomen.net": { paletteIdx: 5 },
  "estimated.us": { paletteIdx: 0 },
  "extractor.email": { paletteIdx: 1 },
  "fancyfonts.cool": { paletteIdx: 2 },
  "feed.coupons": { paletteIdx: 3 },
  "findimage.net": { paletteIdx: 5 },
  "findimages.net": { paletteIdx: 5 },
  "findname.org": { paletteIdx: 1 },
  "flayer.net": { paletteIdx: 1 },
  "fontgenerator.onl": { paletteIdx: 2 },
  "fontgenerator.site": { paletteIdx: 2 },
  "forexcurrency.net": { paletteIdx: 0 },
  "foxs.co": { paletteIdx: 3 },
  "foxs.us": { paletteIdx: 3 },
  "foxwomen.com": { paletteIdx: 5 },
  "freefontsgenerator.com": { paletteIdx: 2 },
  "generatorify.com": { paletteIdx: 2 },
  "globalsportsshop.com": { paletteIdx: 8 },
  "globalsportsstore.com": { paletteIdx: 8 },
  "goldmarkings.com": { paletteIdx: 3 },
  "homeadvice.net": { paletteIdx: 4 },
  "homewaresshop.com": { paletteIdx: 4 },
  "hostsshop.com": { paletteIdx: 1 },
  "howsblog.com": { paletteIdx: 7 },
  "infoaddress.com": { paletteIdx: 4 },
  "irinaana.com": { paletteIdx: 5 },
  "italicfont.com": { paletteIdx: 2 },
  "italicfont.net": { paletteIdx: 2 },
  "italicfont.org": { paletteIdx: 2 },
  "jewelriesonline.com": { paletteIdx: 3 },
  "jobs.best": { paletteIdx: 1 },
  "jobs.country": { paletteIdx: 1 },
  "jobscountry.com": { paletteIdx: 1 },
  "jobsearches.org": { paletteIdx: 1 },
  "jobseeker.onl": { paletteIdx: 1 },
  "jobslistly.com": { paletteIdx: 1 },
  "jobssearch.us": { paletteIdx: 1 },
  "journalgold.com": { paletteIdx: 3 },
  "laptoppricing.com": { paletteIdx: 6 },
  "latestprocessor.com": { paletteIdx: 6 },
  "learn.bz": { paletteIdx: 4 },
  "learnzone.net": { paletteIdx: 4 },
  "lennyface.cool": { paletteIdx: 6 },
  "lennyfaces.cool": { paletteIdx: 6 },
  "list.ad": { paletteIdx: 1 },
  "listing.ad": { paletteIdx: 1 },
  "listing.onl": { paletteIdx: 1 },
  "listlyjobs.com": { paletteIdx: 1 },
  "lists.onl": { paletteIdx: 1 },
  "logomakers.net": { paletteIdx: 2 },
  "lowestphone.com": { paletteIdx: 1 },
  "maildoozy.com": { paletteIdx: 1 },
  "marketing.yt": { paletteIdx: 1 },
  "marketmail.net": { paletteIdx: 1 },
  "marketplace.ad": { paletteIdx: 3 },
  "mentifact.ai": { paletteIdx: 2 },
  "mentifact.com": { paletteIdx: 2 },
  "mooc.onl": { paletteIdx: 4 },
  "mouseforgaming.com": { paletteIdx: 6 },
  "movie.yt": { paletteIdx: 5 },
  "movieschimp.com": { paletteIdx: 5 },
  "musics.one": { paletteIdx: 5 },
  "musics.onl": { paletteIdx: 5 },
  "musicsong.net": { paletteIdx: 5 },
  "nailstamper.com": { paletteIdx: 5 },
  "newestbusiness.com": { paletteIdx: 1 },
  "nicecaptions.com": { paletteIdx: 2 },
  "novapetstore.com": { paletteIdx: 3 },
  "offers.onl": { paletteIdx: 3 },
  "online-exams.com": { paletteIdx: 4 },
  "onlinearchive.net": { paletteIdx: 4 },
  "onlineautomatic.com": { paletteIdx: 2 },
  "onlinebarcodescan.com": { paletteIdx: 8 },
  "onlineqrcodegenerator.com": { paletteIdx: 8 },
  "pastarecipes.net": { paletteIdx: 9 },
  "petsaccess.com": { paletteIdx: 3 },
  "pizzarecipes.net": { paletteIdx: 9 },
  "postpress.org": { paletteIdx: 7 },
  "potatoesrecipes.com": { paletteIdx: 9 },
  "ppv.ad": { paletteIdx: 1 },
  "profolio.cv": { paletteIdx: 1 },
  "prompts.markets": { paletteIdx: 2 },
  "prompts.one": { paletteIdx: 2 },
  "prompts.onl": { paletteIdx: 2 },
  "ptc.ad": { paletteIdx: 1 },
  "ptc.onl": { paletteIdx: 1 },
  "puppiestoys.com": { paletteIdx: 3 },
  "puppyimages.com": { paletteIdx: 3 },
  "quikseo.com": { paletteIdx: 1 },
  "radiostations.world": { paletteIdx: 5 },
  "rank.onl": { paletteIdx: 1 },
  "readbarcode.com": { paletteIdx: 8 },
  "readbooks.us": { paletteIdx: 9 },
  "reply.onl": { paletteIdx: 1 },
  "responsively.dev": { paletteIdx: 2 },
  "responsivly.com": { paletteIdx: 2 },
  "responsivly.dev": { paletteIdx: 2 },
  "rushcoupons.com": { paletteIdx: 3 },
  "seekcoupons.com": { paletteIdx: 3 },
  "sexshope.com": { paletteIdx: 5 },
  "sharevideo.net": { paletteIdx: 5 },
  "shophome.org": { paletteIdx: 4 },
  "shopsite.org": { paletteIdx: 3 },
  "sitegenerator.net": { paletteIdx: 2 },
  "socialmedia.onl": { paletteIdx: 1 },
  "socialproof.onl": { paletteIdx: 1 },
  "solo.ad": { paletteIdx: 1 },
  "specialsshop.com": { paletteIdx: 3 },
  "sportsstore.us": { paletteIdx: 8 },
  "storeadult.com": { paletteIdx: 5 },
  "story.onl": { paletteIdx: 7 },
  "template.graphics": { paletteIdx: 2 },
  "template.onl": { paletteIdx: 2 },
  "text.onl": { paletteIdx: 2 },
  "textart.studio": { paletteIdx: 2 },
  "textfont.cool": { paletteIdx: 2 },
  "textgenerator.net": { paletteIdx: 7 },
  "textgenerator.online": { paletteIdx: 7 },
  "textgenerator.us": { paletteIdx: 7 },
  "textoinvisible.net": { paletteIdx: 6 },
  "toolkit.codes": { paletteIdx: 2 },
  "toolkit.domains": { paletteIdx: 1 },
  "toolkitcodes.com": { paletteIdx: 2 },
  "totalautomated.com": { paletteIdx: 2 },
  "trackingwebsites.com": { paletteIdx: 1 },
  "trailer.movie": { paletteIdx: 5 },
  "translater.us": { paletteIdx: 4 },
  "travelhotels.org": { paletteIdx: 4 },
  "txtart.com": { paletteIdx: 2 },
  "txtcounter.com": { paletteIdx: 6 },
  "unicodedb.com": { paletteIdx: 6 },
  "unifiedcv.com": { paletteIdx: 1 },
  "uniquerecipes.net": { paletteIdx: 9 },
  "urls.onl": { paletteIdx: 1 },
  "video.yt": { paletteIdx: 5 },
  "videocutter.net": { paletteIdx: 5 },
  "wallsdecorating.com": { paletteIdx: 4 },
  "webmasters-tools.com": { paletteIdx: 2 },
  "websitestore.org": { paletteIdx: 3 },
  "welcomediscounts.com": { paletteIdx: 3 },
  "windowscamera.com": { paletteIdx: 5 },
  "worldstations.com": { paletteIdx: 5 },
  "writer.onl": { paletteIdx: 7 },
  "writerscontent.com": { paletteIdx: 7 },
  "writingblogger.com": { paletteIdx: 7 },
  "yeaporn.com": { paletteIdx: 5 },
  "yt.tools": { paletteIdx: 5 },
  "zone.ad": { paletteIdx: 1 },
};

export interface SemanticRule {
  keywords: string[];
  niche: string;
  icons: string[];
  paletteIdx: number;
}

export const SEMANTIC_KEYWORD_RULES: SemanticRule[] = [
  // Dental & Medical
  {
    keywords: ["dent", "tooth", "teeth", "ortho"],
    niche: "Dentistry & Oral Healthcare",
    icons: ["Smile", "ShieldPlus", "Activity", "HeartPulse", "Award", "CircleCheck", "Sparkles", "Stethoscope", "House", "Star"],
    paletteIdx: 6,
  },
  {
    keywords: ["health", "clinic", "med", "doctor", "care", "hospital", "pharma", "cure", "therapy", "nurse"],
    niche: "Healthcare, Medicine & Clinical Services",
    icons: ["Stethoscope", "HeartPulse", "Activity", "Pill", "ShieldPlus", "FileHeart", "Heart", "Thermometer", "Building2", "Award"],
    paletteIdx: 6,
  },
  // Finance, Crypto, Trading
  {
    keywords: ["crypto", "bitcoin", "btc", "eth", "token", "coin", "wallet", "blockchain", "nft", "defi"],
    niche: "Cryptocurrency, Web3 & Blockchain Assets",
    icons: ["Coins", "Layers", "Link", "Lock", "Key", "TrendingUp", "Cpu", "Boxes", "QrCode", "Wallet"],
    paletteIdx: 7,
  },
  {
    keywords: ["bank", "pay", "payment", "credit", "cash", "loan", "mortgage", "fund", "money", "invest", "stock", "trade", "finance"],
    niche: "Banking, Payments & Investment Capital",
    icons: ["Landmark", "BadgeDollarSign", "Coins", "CreditCard", "Wallet", "TrendingUp", "ChartCandlestick", "Receipt", "PiggyBank", "ShieldCheck"],
    paletteIdx: 0,
  },
  // Real Estate & Architecture
  {
    keywords: ["estate", "realty", "house", "home", "villa", "apartment", "property", "rent", "roof", "build"],
    niche: "Real Estate, Properties & Architecture",
    icons: ["House", "Building2", "Key", "MapPin", "DoorOpen", "Compass", "ShieldCheck", "Warehouse", "Castle", "Tag"],
    paletteIdx: 4,
  },
  // Automotive & Transport
  {
    keywords: ["car", "auto", "vehicle", "drive", "motor", "garage", "tire", "mechanic", "taxi", "ride", "truck"],
    niche: "Automotive, Vehicles & Mobility Services",
    icons: ["CarFront", "Car", "Gauge", "Fuel", "KeyRound", "Wrench", "ShieldCheck", "Navigation", "Compass", "Zap"],
    paletteIdx: 8,
  },
  // Pets & Animals
  {
    keywords: ["pet", "dog", "puppy", "cat", "kitten", "vet", "paw", "animal", "zoo", "bark", "tail"],
    niche: "Pet Care, Veterinary & Animal Companions",
    icons: ["PawPrint", "Dog", "Cat", "Bone", "Heart", "ShieldPlus", "House", "Award", "Sparkles", "ShoppingBag"],
    paletteIdx: 3,
  },
  // Coffee, Food & Bakery
  {
    keywords: ["coffee", "cafe", "roast", "espresso", "brew", "bean", "barista", "tea"],
    niche: "Specialty Coffee Roastery & Cafe",
    icons: ["Coffee", "CupSoda", "Flame", "Store", "Clock", "Sparkles", "Heart", "Croissant", "Utensils", "Smile"],
    paletteIdx: 9,
  },
  {
    keywords: ["pizza", "burger", "taco", "bbq", "grill", "steak", "bacon", "meat"],
    niche: "Fast Casual Dining & Savory Cuisine",
    icons: ["Pizza", "Flame", "ChefHat", "Utensils", "CookingPot", "Store", "Heart", "Clock", "Soup", "Wheat"],
    paletteIdx: 9,
  },
  {
    keywords: ["bread", "bake", "bakery", "cake", "pastry", "dough", "dessert", "sweet", "cookie"],
    niche: "Artisanal Bakery, Pastries & Confectionery",
    icons: ["Croissant", "Wheat", "ChefHat", "Utensils", "CookingPot", "Flame", "Heart", "Store", "Sparkles", "Timer"],
    paletteIdx: 9,
  },
  {
    keywords: ["food", "recipe", "cook", "kitchen", "chef", "dine", "dining", "restaurant", "bistro", "dish"],
    niche: "Culinary Arts & Restaurant Dining",
    icons: ["ChefHat", "Utensils", "Flame", "CookingPot", "Soup", "BookOpen", "Wheat", "Heart", "Store", "Timer"],
    paletteIdx: 9,
  },
  // Gaming & Esports
  {
    keywords: ["game", "gaming", "gamer", "play", "esport", "arcade", "rpg", "quest", "level", "clan"],
    niche: "Esports, Video Gaming & Interactive Play",
    icons: ["Gamepad2", "Gamepad", "Trophy", "Sword", "Crosshair", "Headphones", "Zap", "Flame", "Target", "Monitor"],
    paletteIdx: 7,
  },
  // Fitness, Gym & Sports
  {
    keywords: ["fit", "fitness", "gym", "workout", "muscle", "train", "sport", "athlete", "run", "yoga"],
    niche: "Fitness Athletics, Gym & Performance Training",
    icons: ["Dumbbell", "Trophy", "Activity", "Medal", "Flame", "Timer", "Footprints", "HeartPulse", "Target", "Award"],
    paletteIdx: 8,
  },
  // Travel, Hotels & Flights
  {
    keywords: ["travel", "hotel", "trip", "tour", "flight", "fly", "plane", "vacation", "resort", "stay", "beach", "island"],
    niche: "Travel Adventures, Hospitality & Hotel Stays",
    icons: ["Hotel", "Plane", "MapPin", "Compass", "Luggage", "Bed", "TreePalm", "Globe", "Sun", "Key"],
    paletteIdx: 4,
  },
  // Security, Privacy & Defense
  {
    keywords: ["secure", "security", "safe", "shield", "protect", "lock", "guard", "cyber", "defense", "privacy"],
    niche: "Cybersecurity, Privacy & Asset Defense",
    icons: ["Shield", "ShieldCheck", "Lock", "Key", "Fingerprint", "Eye", "KeyRound", "CircleCheck", "Zap", "Server"],
    paletteIdx: 0,
  },
  // Cloud, Hosting & Data
  {
    keywords: ["cloud", "server", "host", "hosting", "data", "database", "backup", "node", "storage"],
    niche: "Cloud Computing & Server Infrastructure",
    icons: ["Cloud", "Server", "Database", "HardDrive", "Cpu", "Globe", "Layers", "Network", "Lock", "HardHat"],
    paletteIdx: 1,
  },
  // AI, Robotics & Machine Learning
  {
    keywords: ["ai", "bot", "robot", "neural", "intel", "smart", "algorithm", "prompt", "llm", "autom"],
    niche: "Artificial Intelligence, Neural Models & Robotics",
    icons: ["Bot", "Brain", "Cpu", "Sparkles", "WandSparkles", "CircuitBoard", "Terminal", "Zap", "Layers", "Workflow"],
    paletteIdx: 2,
  },
  // Photography, Video & Cinema
  {
    keywords: ["photo", "camera", "pic", "image", "shot", "lens", "film", "cinema", "video", "movie"],
    niche: "Photography, Cinema & Visual Arts",
    icons: ["Camera", "Image", "Aperture", "ScanSearch", "Focus", "Film", "Clapperboard", "Play", "Video", "Images"],
    paletteIdx: 5,
  },
  // Music, Podcast & Audio
  {
    keywords: ["music", "song", "audio", "sound", "radio", "podcast", "beat", "track", "tune", "mic", "dj"],
    niche: "Music Production, Audio & Broadcasting",
    icons: ["Music", "Headphones", "Radio", "Mic", "Volume2", "Disc", "Play", "AudioWaveform", "AudioLines", "Podcast"],
    paletteIdx: 5,
  },
  // Fashion, Jewelry & Luxury
  {
    keywords: ["fashion", "style", "wear", "cloth", "dress", "luxury", "jewel", "diamond", "gold", "gem", "ring"],
    niche: "Haute Couture, Luxury Jewelry & Fashion",
    icons: ["Gem", "Crown", "Sparkles", "Shirt", "Award", "Star", "Heart", "ShoppingBag", "Flower2", "Eye"],
    paletteIdx: 3,
  },
  // Law & Legal
  {
    keywords: ["law", "legal", "court", "attorney", "lawyer", "justice", "jurist", "claim"],
    niche: "Legal Advocacy, Law Firm & Justice",
    icons: ["Scale", "Gavel", "Landmark", "FileText", "Shield", "Building2", "BookOpen", "CheckCheck", "Award", "Stamp"],
    paletteIdx: 0,
  },
  // Eco, Nature & Green
  {
    keywords: ["eco", "green", "bio", "nature", "tree", "plant", "solar", "earth", "garden", "flower"],
    niche: "Ecological Sustainability, Clean Energy & Nature",
    icons: ["Leaf", "TreePine", "Trees", "Sun", "Sprout", "Globe", "Wind", "Flower2", "Droplets", "Heart"],
    paletteIdx: 8,
  },
  // Maritime, Harbor, Shipping & Coastal Navigation
  {
    keywords: ["harbor", "harbour", "port", "marine", "ocean", "sea", "anchor", "ship", "sail", "coast", "bay", "tide", "reef", "wave", "nautical", "dock", "fleet"],
    niche: "Maritime, Harbor & Coastal Navigation",
    icons: ["Anchor", "Ship", "Compass", "Waves", "Sailboat", "Navigation", "Sun", "Globe", "Wind", "ShieldCheck"],
    paletteIdx: 6,
  },
  // Illumination, Energy, Clarity & Solar
  {
    keywords: ["bright", "light", "lum", "glow", "shine", "spark", "ray", "beam", "beacon", "prism", "aura"],
    niche: "Illumination, Optics & Radiant Brand Identity",
    icons: ["Sun", "Sparkles", "Lightbulb", "Zap", "Flame", "Star", "Compass", "Eye", "Aperture", "Award"],
    paletteIdx: 4,
  },
];

const CLUSTER_PALETTE_BUCKETS: Record<number, number[]> = {
  0: [0, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  1: [1, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 102],
  2: [2, 11, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
  3: [3, 13, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
  4: [4, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
  5: [5, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73],
  6: [6, 74, 75, 76, 77, 78, 79, 80, 81, 82],
  7: [7, 10, 101, 103, 104, 105, 106, 107, 108, 109],
  8: [8, 83, 84, 85, 86, 87, 88, 89, 90, 91],
  9: [9, 92, 93, 94, 95, 96, 97, 98, 99, 100],
};

function hashDomainPaletteSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickPaletteForDomainCluster(cleanedDomain: string, clusterIdx: number): ColorPalette {
  if (cleanedDomain === "adstock.org") {
    return COLOR_PALETTES[0];
  }
  const bucket = CLUSTER_PALETTE_BUCKETS[Math.abs(clusterIdx) % 10] || CLUSTER_PALETTE_BUCKETS[0];
  const idx = bucket[hashDomainPaletteSeed(cleanedDomain) % bucket.length] ?? 0;
  return COLOR_PALETTES[idx % COLOR_PALETTES.length];
}

export function matchSemanticIconsForDomain(
  rawDomain: string,
  optWord1?: string,
  optWord2?: string
): DomainMatchResult {
  const cleaned = rawDomain.trim().toLowerCase().replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];

  // 1. Check exact 223 dictionary first
  if (DOMAIN_ICON_GROUPS[cleaned]) {
    const groups = DOMAIN_ICON_GROUPS[cleaned];
    const paletteIdx = EXACT_DOMAIN_INFO[cleaned]?.paletteIdx ?? 0;
    return {
      niche: groups.niche,
      icons: flattenIconGroups(groups),
      groups,
      palette: pickPaletteForDomainCluster(cleaned, paletteIdx),
    };
  }

  // 2. Strip extension to get the domain root name
  const rootName = cleaned.replace(/\.[a-z0-9.-]+$/i, "");
  const extPart = cleaned.includes(".") ? "." + cleaned.split(".").slice(1).join(".") : "";
  const w1Label = optWord1 || (rootName.charAt(0).toUpperCase() + rootName.slice(1));
  const w2Label = optWord2 || (extPart ? extPart.replace(".", "").toUpperCase() : "Brand");
  const w1Low = (optWord1 || "").toLowerCase();
  const w2Low = (optWord2 || "").toLowerCase();

  // 3. Score against all semantic keyword rules (combine matches across w1 and w2)
  let bestRule: SemanticRule | null = null;
  let secondRule: SemanticRule | null = null;
  let bestScore = 0;
  let secondScore = 0;

  for (const rule of SEMANTIC_KEYWORD_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (rootName === kw || w1Low === kw || w2Low === kw) {
        score += 12;
      } else if (rootName.startsWith(kw) || rootName.endsWith(kw) || w1Low.startsWith(kw) || w2Low.startsWith(kw)) {
        score += 6;
      } else if (rootName.includes(kw)) {
        score += 3;
      }
    }

    if (score > bestScore) {
      secondScore = bestScore;
      secondRule = bestRule;
      bestScore = score;
      bestRule = rule;
    } else if (score > secondScore) {
      secondScore = score;
      secondRule = rule;
    }
  }

  if (bestRule && bestScore > 0) {
    const primaryIcons = bestRule.icons;
    const secondaryIcons = secondRule && secondScore > 0 ? secondRule.icons : primaryIcons;
    const mergedIcons = Array.from(new Set([...primaryIcons.slice(0, 7), ...secondaryIcons, ...primaryIcons])).slice(0, 10);
    const groups: DomainIconGroups = {
      niche: bestRule.niche,
      core: mergedIcons.slice(0, 4),
      word1: { label: w1Label, icons: mergedIcons.slice(4, 7) },
      word2: { label: w2Label, icons: mergedIcons.slice(7, 10) },
    };
    return {
      niche: bestRule.niche,
      icons: flattenIconGroups(groups),
      groups,
      palette: pickPaletteForDomainCluster(cleaned, bestRule.paletteIdx),
    };
  }

  // 4. Fallback intelligent heuristic based on words
  const fallbackIcons = ["Sparkles", "Layers", "Building2", "Globe", "ShieldCheck", "Target", "TrendingUp", "Award", "Compass", "Zap"];
  const fallbackGroups: DomainIconGroups = {
    niche: "Modern Brand Identity & Enterprise Craft",
    core: fallbackIcons.slice(0, 4),
    word1: { label: w1Label, icons: fallbackIcons.slice(4, 7) },
    word2: { label: w2Label, icons: fallbackIcons.slice(7, 10) },
  };

  return {
    niche: "Modern Brand Identity & Enterprise Craft",
    icons: flattenIconGroups(fallbackGroups),
    groups: fallbackGroups,
    palette: pickPaletteForDomainCluster(cleaned, hashDomainPaletteSeed(cleaned) % 10),
  };
}

/**
 * Semantic Morpheme Index: maps specific root words / morphemes to verified Lucide 0.546.0 icons.
 * Used to expand a domain's semantic icon pool for Remix Architectures and the Symbol Vault
 * without ever introducing random or unrelated icons.
 */
export interface MorphemeCluster {
  morphemes: string[];
  icons: string[];
}

export const SEMANTIC_MORPHEME_INDEX: MorphemeCluster[] = [
  {
    morphemes: ["ad", "ads", "adstock", "advertising", "marketing", "promo", "ppv", "ptc", "solo", "campaign", "flayer", "socialproof"],
    icons: ["Megaphone", "Tv", "Radio", "MousePointerClick", "Target", "Presentation", "ChartSpline", "ChartArea", "ChartBar", "ChartColumn", "ChartPie", "ChartNoAxesCombined", "Share2", "Rss", "Newspaper", "Eye", "Crosshair"],
  },
  {
    morphemes: ["stock", "analyze", "analytics", "estimated", "price", "pricing", "market"],
    icons: ["ChartCandlestick", "ChartLine", "TrendingUp", "TrendingDown", "ChartBar", "ChartColumn", "ChartPie", "ChartArea", "BadgeDollarSign", "Scale", "Receipt", "Percent", "Calculator", "Activity", "ScanSearch"],
  },
  {
    morphemes: ["currency", "forex", "exchanger", "endowment", "gold", "bid", "bids"],
    icons: ["Coins", "Banknote", "BadgeDollarSign", "CircleDollarSign", "Wallet", "Landmark", "PiggyBank", "HandCoins", "Vault", "Scale", "ArrowLeftRight", "RefreshCw", "Gavel", "Hammer"],
  },
  {
    morphemes: ["car", "cars", "auto", "automotive", "vehicle", "drive"],
    icons: ["CarFront", "Car", "Gauge", "Fuel", "KeyRound", "Wrench", "Compass", "Navigation", "Route", "MapPin", "Signpost", "ShieldCheck", "Cog", "Disc"],
  },
  {
    morphemes: ["busses", "bus", "transit"],
    icons: ["BusFront", "Bus", "Route", "MapPin", "Ticket", "Signpost", "Clock", "Navigation", "Compass", "Users"],
  },
  {
    morphemes: ["aff", "affiliate"],
    icons: ["Handshake", "Link", "Link2", "HandCoins", "BadgePercent", "Percent", "Share2", "Network", "ArrowLeftRight", "Award"],
  },
  {
    morphemes: ["shop", "shops", "store", "cart", "buy", "sell", "marketplace", "consumers"],
    icons: ["ShoppingCart", "ShoppingBag", "ShoppingBasket", "Store", "Package", "PackageCheck", "Boxes", "Tag", "Tags", "CreditCard", "Receipt", "Truck", "Handshake", "ArrowLeftRight"],
  },
  {
    morphemes: ["deals", "coupon", "coupons", "discounts", "offers", "saving"],
    icons: ["TicketPercent", "BadgePercent", "Percent", "Tag", "Tags", "PiggyBank", "Gift", "HandCoins", "Coins", "Wallet", "Scissors", "Ticket"],
  },
  {
    morphemes: ["pet", "pets", "puppy", "puppies", "dog", "cat", "animal"],
    icons: ["PawPrint", "Dog", "Cat", "Bone", "Fish", "Bird", "Rabbit", "Turtle", "Heart", "Stethoscope", "ShieldPlus"],
  },
  {
    morphemes: ["font", "fonts", "italic", "type", "caption", "captions"],
    icons: ["Type", "Signature", "Feather", "PenTool", "Italic", "Bold", "Underline", "CaseSensitive", "Baseline", "ALargeSmall", "Pilcrow", "Quote", "MessageSquareQuote", "Subscript", "Superscript"],
  },
  {
    morphemes: ["text", "txt", "ascii", "unicode", "symbol", "symbols", "lennyface", "lennyfaces"],
    icons: ["Type", "SquareTerminal", "Binary", "Braces", "Hash", "Omega", "Sigma", "Infinity", "Asterisk", "Ampersand", "Shapes", "Grid3x3", "Code", "Smile"],
  },
  {
    morphemes: ["writer", "writers", "writing", "blog", "blogger", "article", "post", "story", "translater", "journal"],
    icons: ["PenLine", "NotebookPen", "Feather", "Newspaper", "Rss", "FileText", "BookOpen", "MessageSquareText", "Send", "Heading", "Quote", "Languages"],
  },
  {
    morphemes: ["image", "images", "4k", "camera", "photo", "avatar", "graphics", "template", "logo", "design"],
    icons: ["Camera", "Image", "Images", "Aperture", "Focus", "ScanEye", "Frame", "Crop", "SlidersHorizontal", "Maximize2", "Proportions", "Palette", "Brush", "PenTool", "Layers", "Shapes"],
  },
  {
    morphemes: ["video", "movie", "movies", "trailer", "yt", "cutter"],
    icons: ["Film", "Clapperboard", "Video", "MonitorPlay", "Play", "Tv", "Projector", "Scissors", "Camera", "SlidersHorizontal"],
  },
  {
    morphemes: ["book", "books", "library", "read"],
    icons: ["BookOpen", "Book", "BookCopy", "BookMarked", "BookHeart", "BookText", "Library", "Bookmark", "Notebook", "GraduationCap"],
  },
  {
    morphemes: ["archive", "history"],
    icons: ["Archive", "FolderArchive", "FileClock", "History", "Database", "Library", "Cloud", "Server", "HardDrive", "Search"],
  },
  {
    morphemes: ["course", "courses", "learn", "mooc", "exams", "education", "child"],
    icons: ["GraduationCap", "School", "Presentation", "BookOpen", "Notebook", "Award", "Brain", "Lightbulb", "Pencil", "ListChecks"],
  },
  {
    morphemes: ["bread", "bake", "bakery"],
    icons: ["Croissant", "Wheat", "ChefHat", "Flame", "Sandwich", "CakeSlice", "CookingPot", "Utensils", "BookOpen", "Timer", "Store"],
  },
  {
    morphemes: ["brisket", "meat", "bbq"],
    icons: ["Beef", "Drumstick", "Ham", "Flame", "ChefHat", "Utensils", "UtensilsCrossed", "CookingPot", "Thermometer", "Timer", "BookOpen"],
  },
  {
    morphemes: ["pizza", "pasta", "egg", "potatoes", "recipe", "recipes", "cooker"],
    icons: ["ChefHat", "Utensils", "UtensilsCrossed", "CookingPot", "Flame", "Soup", "Pizza", "Egg", "EggFried", "Carrot", "Salad", "Wheat", "BookOpen", "Timer", "Microwave"],
  },
  {
    morphemes: ["code", "codes", "toolkit", "responsively", "responsivly", "webmasters"],
    icons: ["Code", "CodeXml", "SquareTerminal", "Terminal", "Braces", "Binary", "FileCode", "Wrench", "Settings", "Cog", "Layers", "Monitor", "Smartphone", "Laptop"],
  },
  {
    morphemes: ["computers", "memory", "laptop", "processor", "mouse"],
    icons: ["Cpu", "CircuitBoard", "MemoryStick", "HardDrive", "Monitor", "Laptop", "Mouse", "Keyboard", "Server", "Database", "Gauge", "Layers"],
  },
  {
    morphemes: ["automatic", "automated", "generator", "generatorify", "prompts", "mentifact"],
    icons: ["WandSparkles", "Bot", "Brain", "Workflow", "Cog", "RefreshCw", "Cpu", "CircuitBoard", "Terminal", "Layers", "Zap"],
  },
  {
    morphemes: ["barcode", "qrcode", "counter"],
    icons: ["Barcode", "ScanBarcode", "QrCode", "ScanLine", "Hash", "Tally5", "Calculator", "ListOrdered", "Tag", "CheckCheck"],
  },
  {
    morphemes: ["job", "jobs", "career", "careers", "jobseeker", "cv", "profolio"],
    icons: ["Briefcase", "BriefcaseBusiness", "IdCard", "Contact", "UserCheck", "UserCog", "Users", "GraduationCap", "Trophy", "Medal", "Target", "Route", "FileCheck", "Award"],
  },
  {
    morphemes: ["business", "businesses", "address", "cards", "empires", "list", "listing", "lists", "rank", "seo", "tracking", "urls", "domain", "hosts"],
    icons: ["Building2", "Landmark", "Briefcase", "Handshake", "Globe", "Network", "Server", "MapPin", "IdCard", "Crown", "Target", "ChartLine", "Search", "Link"],
  },
  {
    morphemes: ["music", "musics", "song", "radio", "stations"],
    icons: ["Music", "Headphones", "Radio", "Mic", "Volume2", "Disc", "Play", "AudioWaveform", "AudioLines", "Podcast"],
  },
  {
    morphemes: ["beauty", "jewelries", "nail", "women", "erotica", "erotic", "adult", "sex", "lover"],
    icons: ["Gem", "Crown", "Flower2", "Sparkle", "Heart", "Flame", "Eye", "Scissors", "Brush", "Star"],
  },
  {
    morphemes: ["home", "homewares", "walls", "decorating", "travel", "hotels", "antarctic", "sports", "canes"],
    icons: ["House", "Building2", "Bed", "Hotel", "Plane", "Compass", "MapPin", "MountainSnow", "Snowflake", "Trophy", "Dumbbell", "Medal", "PaintRoller", "Palette", "Lamp"],
  },
  {
    morphemes: ["harbor", "harbour", "port", "marine", "ocean", "sea", "anchor", "ship", "sail", "coast", "bay", "tide", "reef", "wave", "waves", "nautical", "dock", "fleet", "bright", "beacon"],
    icons: ["Anchor", "Ship", "Compass", "Waves", "Sailboat", "Navigation", "Sun", "Sparkles", "Globe", "Wind", "ShieldCheck", "MapPin", "Lightbulb", "Star", "Award"],
  },
];

export interface ExtendedDomainSemanticPool {
  core: string[];
  word1Icons: string[];
  word2Icons: string[];
  tier1: string[]; // The 10 curated domain icons (4 core + 3 word1 + 3 word2)
  tier2: string[]; // Additional morpheme-verified icons specific to this domain
  allSemantic: string[]; // Tier 1 + Tier 2 deduplicated
}

export function getExtendedSemanticIconsForDomain(
  domain: string,
  word1: string,
  word2: string,
  nicheLabel: string,
  baseIcons10: string[],
  iconGroups?: DomainIconGroups
): ExtendedDomainSemanticPool {
  const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];
  const rootName = cleaned.replace(/\.[a-z0-9.-]+$/i, "");

  const groups = iconGroups || DOMAIN_ICON_GROUPS[cleaned];
  const core = groups ? groups.core : baseIcons10.slice(0, 4);
  const word1Icons = groups ? groups.word1.icons : baseIcons10.slice(4, 7);
  const word2Icons = groups ? groups.word2.icons : baseIcons10.slice(7, 10);
  const tier1 = Array.from(new Set([...core, ...word1Icons, ...word2Icons, ...baseIcons10])).slice(0, 10);
  const tier1Set = new Set(tier1);

  // Tokenize domain, words, group labels, and niche
  const rawTokens = [
    rootName,
    word1.toLowerCase(),
    word2.toLowerCase(),
    groups?.word1.label.toLowerCase() || "",
    groups?.word2.label.toLowerCase() || "",
    ...nicheLabel.toLowerCase().split(/[^a-z0-9]+/),
  ].filter((t) => t.length >= 2);

  // Score morpheme clusters by how strongly they match the domain's root words
  const scoredClusters: { cluster: MorphemeCluster; score: number }[] = [];

  for (const cluster of SEMANTIC_MORPHEME_INDEX) {
    let score = 0;
    for (const morph of cluster.morphemes) {
      if (rawTokens.includes(morph)) {
        score += 10;
      } else if (rootName.includes(morph) && morph.length >= 3) {
        score += 6;
      } else if (rawTokens.some((t) => t.length >= 4 && (t.startsWith(morph) || morph.startsWith(t)))) {
        score += 4;
      }
    }
    if (score > 0) {
      scoredClusters.push({ cluster, score });
    }
  }

  scoredClusters.sort((a, b) => b.score - a.score);

  const tier2: string[] = [];
  const seenTier2 = new Set<string>(tier1Set);

  for (const { cluster } of scoredClusters) {
    for (const ico of cluster.icons) {
      if (!seenTier2.has(ico)) {
        seenTier2.add(ico);
        tier2.push(ico);
      }
    }
  }

  // Also check SEMANTIC_KEYWORD_RULES if needed
  for (const rule of SEMANTIC_KEYWORD_RULES) {
    if (rule.keywords.some((kw) => rawTokens.includes(kw) || (kw.length >= 4 && rootName.includes(kw)))) {
      for (const ico of rule.icons) {
        if (!seenTier2.has(ico)) {
          seenTier2.add(ico);
          tier2.push(ico);
        }
      }
    }
  }

  return {
    core,
    word1Icons,
    word2Icons,
    tier1,
    tier2: tier2.slice(0, 16),
    allSemantic: [...tier1, ...tier2.slice(0, 16)],
  };
}

/**
 * Selects 10 domain-accurate icons for the 10 concept cards when generating or remixing.
 * - seed === 0: returns the exact 10 curated icons (core[0..3], word1[0..2], word2[0..2]).
 * - seed > 0 & mode === 'core-focus': rotates the 10 curated domain icons across different container
 *   architectures while keeping core icons prominent so every Remix reveals new (Icon × Architecture) pairs.
 * - seed > 0 & mode === 'deep-semantic': blends the 4 primary core icons with morpheme-matched Tier-2
 *   semantic icons for the domain.
 */
export function selectRemixIconsForDomain(
  pool: ExtendedDomainSemanticPool,
  seed: number,
  mode: "core-focus" | "deep-semantic" = "core-focus"
): string[] {
  const { core, tier1, allSemantic } = pool;
  if (seed <= 0 || tier1.length === 0) {
    return tier1;
  }

  if (mode === "core-focus" || allSemantic.length <= 10) {
    // Rotate the 10 domain icons with a prime step (3 or 7) so each card gets a new domain icon
    // on every Remix click, while guaranteeing all 10 icons remain 100% from the domain's curated 10!
    const result: string[] = [];
    const n = tier1.length;
    const step = n === 10 ? 3 : 1; // 3 is coprime to 10, visiting all 10 unique icons
    for (let i = 0; i < 10; i++) {
      const idx = (i * step + seed) % n;
      result.push(tier1[idx]);
    }
    return result;
  }

  // Deep-semantic mode: keep all 4 core icons anchored in rotated slots, and fill the remaining 6 slots
  // from the extended domain-specific semantic pool (word1 + word2 + tier2 morpheme matches)
  const nonCore = allSemantic.filter((ico) => !core.includes(ico));
  const picked: string[] = [];

  // Place the 4 core icons rotated by seed
  for (let i = 0; i < core.length && picked.length < 4; i++) {
    picked.push(core[(i + seed) % core.length]);
  }

  // Pick 6 distinct icons from nonCore rotated by seed
  if (nonCore.length > 0) {
    for (let i = 0; i < nonCore.length && picked.length < 10; i++) {
      const candidate = nonCore[(i + seed * 3) % nonCore.length];
      if (!picked.includes(candidate)) {
        picked.push(candidate);
      }
    }
  }

  // Pad from tier1 if needed
  for (const ico of tier1) {
    if (picked.length >= 10) break;
    if (!picked.includes(ico)) picked.push(ico);
  }

  // Rotate the final 10 slots by seed so different card positions (including #1 and #10 stacked) get fresh icons
  return picked.map((_, i) => picked[(i + seed) % picked.length]);
}


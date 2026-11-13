import { ColorPalette, NicheIconPack } from '../types/logo';
import { matchSemanticIconsForDomain } from './domainSemanticIcons';
import { segmentDomainSld } from './wordSegmenter';

export const TLDWATCH_223_DOMAINS = [
  "4kimages.com","adstock.org","affcar.com","affcart.com","affpet.com","allfancyfont.com","allfancyfonts.com",
  "analyzestock.com","antarcticshop.com","apetshopz.com","applebids.com","archiveonline.net","articlegenerator.net",
  "asciiart.studio","autolisting.org","automatic.onl","automotive.ad","automotive.onl","avatardesign.net",
  "barcode.codes","barcode.onl","barcodeanalyzer.com","bestcareers.net","bid.onl","bioofy.com",
  "blackbeautychannel.com","bloggerposter.com","blogposts.net","booksshops.com","booksstore.net","breadrecipe.net",
  "brisketrecipes.com","browse.ad","businessaddress.net","businessescards.com","businessideas.us","businesslibrary.net",
  "busses.us","buyandsell.onl","canesshop.com","careermanager.net","carinform.com","childeducation.net","codes.zone",
  "comparing.us","comparisoncars.com","computersmemory.com","computersprice.com","consumersdeals.com","cooker.us",
  "coolfonts.cool","coolsymbol.cool","coolsymbols.cool","counter.onl","couponcode.one","courses.onl","courseweb.org",
  "currencyexchanger.net","cutecaptions.com","dealspalace.com","dealssaving.com","domainarchive.net",
  "domainnameservices.net","downloadicons.com","downloadicons.net","easysend.net","eggrecipes.net","empiresweb.com",
  "endowment.net","endowment.us","engineerings.net","eroticaexpress.com","eroticalover.com","eroticaplace.com",
  "eroticbooks.net","eroticwomen.net","estimated.us","extractor.email","fancyfonts.cool","feed.coupons",
  "findimage.net","findimages.net","findname.org","flayer.net","fontgenerator.onl","fontgenerator.site",
  "forexcurrency.net","foxs.co","foxs.us","foxwomen.com","freefontsgenerator.com","generatorify.com",
  "globalsportsshop.com","globalsportsstore.com","goldmarkings.com","homeadvice.net","homewaresshop.com",
  "hostsshop.com","howsblog.com","infoaddress.com","irinaana.com","italicfont.com","italicfont.net","italicfont.org",
  "jewelriesonline.com","jobs.best","jobs.country","jobscountry.com","jobsearches.org","jobseeker.onl",
  "jobslistly.com","jobssearch.us","journalgold.com","laptoppricing.com","latestprocessor.com","learn.bz",
  "learnzone.net","lennyface.cool","lennyfaces.cool","list.ad","listing.ad","listing.onl","listlyjobs.com",
  "lists.onl","logomakers.net","lowestphone.com","maildoozy.com","marketing.yt","marketmail.net","marketplace.ad",
  "mentifact.ai","mentifact.com","mooc.onl","mouseforgaming.com","movie.yt","movieschimp.com","musics.one",
  "musics.onl","musicsong.net","nailstamper.com","newestbusiness.com","nicecaptions.com","novapetstore.com",
  "offers.onl","online-exams.com","onlinearchive.net","onlineautomatic.com","onlinebarcodescan.com",
  "onlineqrcodegenerator.com","pastarecipes.net","petsaccess.com","pizzarecipes.net","postpress.org",
  "potatoesrecipes.com","ppv.ad","profolio.cv","prompts.markets","prompts.one","prompts.onl","ptc.ad","ptc.onl",
  "puppiestoys.com","puppyimages.com","quikseo.com","radiostations.world","rank.onl","readbarcode.com",
  "readbooks.us","reply.onl","responsively.dev","responsivly.com","responsivly.dev","rushcoupons.com",
  "seekcoupons.com","sexshope.com","sharevideo.net","shophome.org","shopsite.org","sitegenerator.net",
  "socialmedia.onl","socialproof.onl","solo.ad","specialsshop.com","sportsstore.us","storeadult.com","story.onl",
  "template.graphics","template.onl","text.onl","textart.studio","textfont.cool","textgenerator.net",
  "textgenerator.online","textgenerator.us","textoinvisible.net","toolkit.codes","toolkit.domains",
  "toolkitcodes.com","totalautomated.com","trackingwebsites.com","trailer.movie","translater.us","travelhotels.org",
  "txtart.com","txtcounter.com","unicodedb.com","unifiedcv.com","uniquerecipes.net","urls.onl","video.yt",
  "videocutter.net","wallsdecorating.com","webmasters-tools.com","websitestore.org","welcomediscounts.com",
  "windowscamera.com","worldstations.com","writer.onl","writerscontent.com","writingblogger.com","yeaporn.com",
  "yt.tools","zone.ad"
];

export const EXACT_SPLITS: Record<string, [string, string, string?]> = {
  "4kimages.com": ["4K", "Images"], "adstock.org": ["Ad", "Stock"], "affcar.com": ["Aff", "Car"],
  "affcart.com": ["Aff", "Cart"], "affpet.com": ["Aff", "Pet"],
  "allfancyfont.com": ["All", "Fancy", "Font"],
  "allfancyfonts.com": ["All", "Fancy", "Fonts"],
  "analyzestock.com": ["Analyze", "Stock"],
  "antarcticshop.com": ["Antarctic", "Shop"],
  "apetshopz.com": ["A", "Pet", "Shopz"],
  "applebids.com": ["Apple", "Bids"], "archiveonline.net": ["Archive", "Online"],
  "articlegenerator.net": ["Article", "Generator"], "asciiart.studio": ["Ascii", "Art"],
  "autolisting.org": ["Auto", "Listing"], "automatic.onl": ["Automatic", ""],
  "automotive.ad": ["Automotive", ""], "automotive.onl": ["Automotive", ""],
  "avatardesign.net": ["Avatar", "Design"], "barcode.codes": ["Barcode", ""],
  "barcode.onl": ["Barcode", ""], "barcodeanalyzer.com": ["Barcode", "Analyzer"],
  "bestcareers.net": ["Best", "Careers"], "bid.onl": ["Bid", ""], "bioofy.com": ["Bioofy", ""],
  "blackbeautychannel.com": ["Black", "Beauty", "Channel"],
  "bloggerposter.com": ["Blogger", "Poster"],
  "blogposts.net": ["Blog", "Posts"], "booksshops.com": ["Books", "Shops"],
  "booksstore.net": ["Books", "Store"], "breadrecipe.net": ["Bread", "Recipe"],
  "brisketrecipes.com": ["Brisket", "Recipes"], "browse.ad": ["Browse", ""],
  "businessaddress.net": ["Business", "Address"], "businessescards.com": ["Businesses", "Cards"],
  "businessideas.us": ["Business", "Ideas"], "businesslibrary.net": ["Business", "Library"],
  "busses.us": ["Busses", ""],
  "buyandsell.onl": ["Buy", "And", "Sell"],
  "canesshop.com": ["Canes", "Shop"],
  "careermanager.net": ["Career", "Manager"], "carinform.com": ["Car", "Inform"],
  "childeducation.net": ["Child", "Education"], "codes.zone": ["Codes", ""],
  "comparing.us": ["Comparing", ""], "comparisoncars.com": ["Comparison", "Cars"],
  "computersmemory.com": ["Computers", "Memory"], "computersprice.com": ["Computers", "Price"],
  "consumersdeals.com": ["Consumers", "Deals"], "cooker.us": ["Cooker", ""],
  "coolfonts.cool": ["Cool", "Fonts"], "coolsymbol.cool": ["Cool", "Symbol"],
  "coolsymbols.cool": ["Cool", "Symbols"], "counter.onl": ["Counter", ""],
  "couponcode.one": ["Coupon", "Code"], "courses.onl": ["Courses", ""],
  "courseweb.org": ["Course", "Web"], "currencyexchanger.net": ["Currency", "Exchanger"],
  "cutecaptions.com": ["Cute", "Captions"], "dealspalace.com": ["Deals", "Palace"],
  "dealssaving.com": ["Deals", "Saving"], "domainarchive.net": ["Domain", "Archive"],
  "domainnameservices.net": ["Domain", "Name", "Services"],
  "downloadicons.com": ["Download", "Icons"],
  "downloadicons.net": ["Download", "Icons"], "easysend.net": ["Easy", "Send"],
  "eggrecipes.net": ["Egg", "Recipes"], "empiresweb.com": ["Empires", "Web"],
  "endowment.net": ["Endowment", ""], "endowment.us": ["Endowment", ""],
  "engineerings.net": ["Engineerings", ""], "eroticaexpress.com": ["Erotica", "Express"],
  "eroticalover.com": ["Erotica", "Lover"], "eroticaplace.com": ["Erotica", "Place"],
  "eroticbooks.net": ["Erotic", "Books"], "eroticwomen.net": ["Erotic", "Women"],
  "estimated.us": ["Estimated", ""], "extractor.email": ["Extractor", ""],
  "fancyfonts.cool": ["Fancy", "Fonts"], "feed.coupons": ["Feed", ""],
  "findimage.net": ["Find", "Image"], "findimages.net": ["Find", "Images"],
  "findname.org": ["Find", "Name"], "flayer.net": ["Flayer", ""],
  "fontgenerator.onl": ["Font", "Generator"], "fontgenerator.site": ["Font", "Generator"],
  "forexcurrency.net": ["Forex", "Currency"], "foxs.co": ["Foxs", ""], "foxs.us": ["Foxs", ""],
  "foxwomen.com": ["Fox", "Women"],
  "freefontsgenerator.com": ["Free", "Fonts", "Generator"],
  "generatorify.com": ["Generatorify", ""],
  "globalsportsshop.com": ["Global", "Sports", "Shop"],
  "globalsportsstore.com": ["Global", "Sports", "Store"],
  "goldmarkings.com": ["Gold", "Markings"],
  "homeadvice.net": ["Home", "Advice"],
  "homewaresshop.com": ["Home", "Wares", "Shop"],
  "hostsshop.com": ["Hosts", "Shop"], "howsblog.com": ["Hows", "Blog"],
  "infoaddress.com": ["Info", "Address"], "irinaana.com": ["Irina", "Ana"],
  "italicfont.com": ["Italic", "Font"], "italicfont.net": ["Italic", "Font"],
  "italicfont.org": ["Italic", "Font"], "jewelriesonline.com": ["Jewelries", "Online"],
  "jobs.best": ["Jobs", ""], "jobs.country": ["Jobs", ""], "jobscountry.com": ["Jobs", "Country"],
  "jobsearches.org": ["Job", "Searches"], "jobseeker.onl": ["Job", "Seeker"],
  "jobslistly.com": ["Jobs", "Listly"], "jobssearch.us": ["Jobs", "Search"],
  "journalgold.com": ["Journal", "Gold"], "laptoppricing.com": ["Laptop", "Pricing"],
  "latestprocessor.com": ["Latest", "Processor"], "learn.bz": ["Learn", ""],
  "learnzone.net": ["Learn", "Zone"], "lennyface.cool": ["Lenny", "Face"],
  "lennyfaces.cool": ["Lenny", "Faces"], "list.ad": ["List", ""], "listing.ad": ["Listing", ""],
  "listing.onl": ["Listing", ""], "listlyjobs.com": ["Listly", "Jobs"], "lists.onl": ["Lists", ""],
  "logomakers.net": ["Logo", "Makers"], "lowestphone.com": ["Lowest", "Phone"],
  "maildoozy.com": ["Mail", "Doozy"], "marketing.yt": ["Marketing", ""],
  "marketmail.net": ["Market", "Mail"], "marketplace.ad": ["Market", "Place"],
  "mentifact.ai": ["Mentifact", ""], "mentifact.com": ["Mentifact", ""], "mooc.onl": ["MOOC", ""],
  "mouseforgaming.com": ["Mouse", "For", "Gaming"],
  "movie.yt": ["Movie", ""],
  "movieschimp.com": ["Movies", "Chimp"], "musics.one": ["Musics", ""], "musics.onl": ["Musics", ""],
  "musicsong.net": ["Music", "Song"], "nailstamper.com": ["Nail", "Stamper"],
  "newestbusiness.com": ["Newest", "Business"], "nicecaptions.com": ["Nice", "Captions"],
  "novapetstore.com": ["Nova", "Pet", "Store"],
  "offers.onl": ["Offers", ""],
  "online-exams.com": ["Online", "Exams"], "onlinearchive.net": ["Online", "Archive"],
  "onlineautomatic.com": ["Online", "Automatic"],
  "onlinebarcodescan.com": ["Online", "Barcode", "Scan"],
  "onlineqrcodegenerator.com": ["Online", "QRCode", "Generator"],
  "pastarecipes.net": ["Pasta", "Recipes"],
  "petsaccess.com": ["Pets", "Access"], "pizzarecipes.net": ["Pizza", "Recipes"],
  "postpress.org": ["Post", "Press"], "potatoesrecipes.com": ["Potatoes", "Recipes"],
  "ppv.ad": ["PPV", ""], "profolio.cv": ["Profolio", ""], "prompts.markets": ["Prompts", ""],
  "prompts.one": ["Prompts", ""], "prompts.onl": ["Prompts", ""], "ptc.ad": ["PTC", ""],
  "ptc.onl": ["PTC", ""], "puppiestoys.com": ["Puppies", "Toys"],
  "puppyimages.com": ["Puppy", "Images"], "quikseo.com": ["Quik", "SEO"],
  "radiostations.world": ["Radio", "Stations"], "rank.onl": ["Rank", ""],
  "readbarcode.com": ["Read", "Barcode"], "readbooks.us": ["Read", "Books"],
  "reply.onl": ["Reply", ""], "responsively.dev": ["Responsively", ""],
  "responsivly.com": ["Responsivly", ""], "responsivly.dev": ["Responsivly", ""],
  "rushcoupons.com": ["Rush", "Coupons"], "seekcoupons.com": ["Seek", "Coupons"],
  "sexshope.com": ["Sex", "Shope"], "sharevideo.net": ["Share", "Video"],
  "shophome.org": ["Shop", "Home"], "shopsite.org": ["Shop", "Site"],
  "sitegenerator.net": ["Site", "Generator"], "socialmedia.onl": ["Social", "Media"],
  "socialproof.onl": ["Social", "Proof"], "solo.ad": ["Solo", ""],
  "specialsshop.com": ["Specials", "Shop"], "sportsstore.us": ["Sports", "Store"],
  "storeadult.com": ["Store", "Adult"], "story.onl": ["Story", ""],
  "template.graphics": ["Template", ""], "template.onl": ["Template", ""],
  "text.onl": ["Text", ""], "textart.studio": ["Text", "Art"], "textfont.cool": ["Text", "Font"],
  "textgenerator.net": ["Text", "Generator"], "textgenerator.online": ["Text", "Generator"],
  "textgenerator.us": ["Text", "Generator"], "textoinvisible.net": ["Texto", "Invisible"],
  "toolkit.codes": ["Toolkit", ""], "toolkit.domains": ["Toolkit", ""],
  "toolkitcodes.com": ["Toolkit", "Codes"], "totalautomated.com": ["Total", "Automated"],
  "trackingwebsites.com": ["Tracking", "Websites"], "trailer.movie": ["Trailer", ""],
  "translater.us": ["Translater", ""], "travelhotels.org": ["Travel", "Hotels"],
  "txtart.com": ["Txt", "Art"], "txtcounter.com": ["Txt", "Counter"],
  "unicodedb.com": ["Unicode", "DB"], "unifiedcv.com": ["Unified", "CV"],
  "uniquerecipes.net": ["Unique", "Recipes"], "urls.onl": ["URLs", ""], "video.yt": ["Video", ""],
  "videocutter.net": ["Video", "Cutter"], "wallsdecorating.com": ["Walls", "Decorating"],
  "webmasters-tools.com": ["Webmasters", "Tools"], "websitestore.org": ["Website", "Store"],
  "welcomediscounts.com": ["Welcome", "Discounts"], "windowscamera.com": ["Windows", "Camera"],
  "worldstations.com": ["World", "Stations"], "writer.onl": ["Writer", ""],
  "writerscontent.com": ["Writers", "Content"], "writingblogger.com": ["Writing", "Blogger"],
  "yeaporn.com": ["Yea", "Porn"], "yt.tools": ["YT", ""], "zone.ad": ["Zone", ""]
};

export const MEANINGFUL_TLDS = new Set([
  ".onl", ".ad", ".cool", ".one", ".yt", ".studio", ".codes", ".email", ".coupons",
  ".site", ".best", ".country", ".bz", ".cv", ".markets", ".world", ".dev", ".graphics",
  ".domains", ".movie", ".tools", ".free", ".org", ".io", ".ai", ".app", ".tech", ".co"
]);

export const NICHE_ICON_PACKS: Record<string, NicheIconPack> = {
  imageSearch: {
    label: "Image Discovery & Photography",
    paletteIdx: 5,
    icons: ["ScanSearch", "Image", "Camera", "Aperture", "Images", "Focus", "ZoomIn", "Frame", "Eye", "Maximize2"]
  },
  stockFinance: {
    label: "Market Analytics, Stocks & Finance",
    paletteIdx: 0,
    icons: ["CandlestickChart", "TrendingUp", "BarChart3", "PieChart", "LineChart", "BadgeDollarSign", "ArrowUpRight", "Briefcase", "Landmark", "Coins"]
  },
  adMarketing: {
    label: "Advertising, SEO & Growth Marketing",
    paletteIdx: 1,
    icons: ["Megaphone", "TrendingUp", "Target", "BarChart2", "MousePointerClick", "Rocket", "Search", "Share2", "Globe", "Award"]
  },
  fontsTypography: {
    label: "Typography, Fonts & Calligraphy",
    paletteIdx: 2,
    icons: ["Italic", "Type", "CaseSensitive", "Feather", "PenTool", "Pilcrow", "Bold", "WandSparkles", "ALargeSmall", "Sparkles"]
  },
  invisibleUnicode: {
    label: "Stealth Text, Symbols & Unicode",
    paletteIdx: 6,
    icons: ["EyeOff", "Ghost", "Scan", "Braces", "Binary", "BoxSelect", "Hash", "Smile", "Code2", "Fingerprint"]
  },
  writingBlog: {
    label: "Content Generation, Writing & Editorial",
    paletteIdx: 7,
    icons: ["FileText", "PenLine", "Wand2", "BookOpen", "AlignLeft", "Feather", "Newspaper", "Quote", "NotebookPen", "Sparkles"]
  },
  designGraphics: {
    label: "ASCII Art, Icons, Logos & Design Studio",
    paletteIdx: 3,
    icons: ["Palette", "Paintbrush", "Shapes", "LayoutTemplate", "Grid", "PenTool", "Layers", "Compass", "Sparkles", "Frame"]
  },
  barcodeScanner: {
    label: "Barcode & QR Code Symbology",
    paletteIdx: 8,
    icons: ["ScanBarcode", "Barcode", "QrCode", "ScanLine", "Maximize", "CheckCircle2", "Tag", "Box", "SearchCode", "Cpu"]
  },
  aiDevTools: {
    label: "AI Prompts, Automation & Dev Tools",
    paletteIdx: 2,
    icons: ["Terminal", "Cpu", "Bot", "Code2", "Wrench", "WandSparkles", "Braces", "Cog", "Laptop", "Zap"]
  },
  emailMessaging: {
    label: "Email Routing, Replies & Messaging",
    paletteIdx: 1,
    icons: ["Mail", "Send", "AtSign", "Reply", "Inbox", "MailCheck", "MailSearch", "Forward", "MessageSquare", "Zap"]
  },
  videoMusicRadio: {
    label: "Video, YouTube, Cinema, Music & Radio",
    paletteIdx: 5,
    icons: ["Play", "Video", "Clapperboard", "Scissors", "Film", "Tv", "Radio", "Music", "Headphones", "Share2"]
  },
  ecommerceDeals: {
    label: "E-Commerce, Retail, Deals & Coupons",
    paletteIdx: 3,
    icons: ["ShoppingCart", "ShoppingBag", "Tag", "Percent", "Store", "Ticket", "Gavel", "Package", "Gem", "BadgeCheck"]
  },
  jobsCareers: {
    label: "Careers, Job Boards & CV Portfolios",
    paletteIdx: 1,
    icons: ["Briefcase", "UserCheck", "FileBadge", "GraduationCap", "Search", "Award", "Building2", "IdCard", "TrendingUp", "Compass"]
  },
  eduCourses: {
    label: "Online Exams, Courses & Academic",
    paletteIdx: 4,
    icons: ["GraduationCap", "BookOpenCheck", "FileCheck2", "Library", "Award", "Brain", "Languages", "Lightbulb", "Notebook", "CheckCircle"]
  },
  foodRecipes: {
    label: "Culinary Arts, Cooking & Recipes",
    paletteIdx: 9,
    icons: ["ChefHat", "Utensils", "Flame", "CookingPot", "Pizza", "Soup", "Croissant", "BookOpen", "Wheat", "Heart"]
  },
  automotiveCars: {
    label: "Automotive, Vehicles & Mobility",
    paletteIdx: 8,
    icons: ["CarFront", "Car", "Gauge", "Bus", "Wrench", "Compass", "ShieldCheck", "KeyRound", "Fuel", "Zap"]
  },
  petsAnimals: {
    label: "Pets, Puppies & Animal Care",
    paletteIdx: 3,
    icons: ["PawPrint", "Dog", "Cat", "Bone", "Heart", "ShieldPlus", "Home", "Award", "Sparkles", "ShoppingBag"]
  },
  hardwareGaming: {
    label: "PC Hardware, Processors & Gaming",
    paletteIdx: 6,
    icons: ["Cpu", "Laptop", "Smartphone", "Mouse", "HardDrive", "Monitor", "Gamepad2", "Server", "Zap", "Scale"]
  },
  homeTravelBiz: {
    label: "Business, Architecture & Travel",
    paletteIdx: 4,
    icons: ["Building2", "Home", "Plane", "Archive", "Compass", "Lightbulb", "IdCard", "Landmark", "Globe", "Crown"]
  },
  adultRomance: {
    label: "Romance, Nightlife & Lifestyle",
    paletteIdx: 5,
    icons: ["Flame", "Heart", "Sparkles", "Gem", "Lock", "Eye", "Crown", "Moon", "Star", "Wine"]
  }
};

export const COLOR_PALETTES: ColorPalette[] = [
  { name: "Institutional Emerald", primary: "#0B132B", secondary: "#00A878", accent: "#F59E0B" },
  { name: "Silicon Valley Cobalt", primary: "#0F172A", secondary: "#2563EB", accent: "#06B6D4" },
  { name: "Neural Violet & Rose", primary: "#171135", secondary: "#7C3AED", accent: "#F43F5E" },
  { name: "Craft Terracotta & Gold", primary: "#18181B", secondary: "#EA580C", accent: "#FACC15" },
  { name: "Nordic Teal & Sky", primary: "#06373A", secondary: "#0D9488", accent: "#38BDF8" },
  { name: "Editorial Crimson", primary: "#111827", secondary: "#E11D48", accent: "#FB923C" },
  { name: "Deep Ocean & Mint", primary: "#082F49", secondary: "#0284C7", accent: "#2DD4BF" },
  { name: "Obsidian & Royal Indigo", primary: "#1E1B4B", secondary: "#4F46E5", accent: "#EC4899" },
  { name: "Carbon & Electric Lime", primary: "#090D16", secondary: "#16A34A", accent: "#84CC16" },
  { name: "Warm Espresso & Amber", primary: "#271712", secondary: "#D97706", accent: "#EF4444" },
  { name: "Monochrome Platinum", primary: "#000000", secondary: "#475569", accent: "#94A3B8" },
  { name: "Cyberpunk Sunrise", primary: "#1A0933", secondary: "#FF007A", accent: "#00F0FF" },
  { name: "Alpine Slate & Jade", primary: "#0F172A", secondary: "#059669", accent: "#10B981" },
  { name: "Boutique Navy & Copper", primary: "#1B2A4A", secondary: "#C86D51", accent: "#D4AF37" }
];

export const BRAND_FONTS = [
  "Plus Jakarta Sans",
  "Outfit",
  "Space Grotesk",
  "Sora",
  "DM Sans",
  "Montserrat",
  "Syne",
  "Inter",
  "Oswald",
  "Playfair Display"
];

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

export function classifyDomain(rawInput: string): NicheIconPack {
  const d = rawInput.toLowerCase().trim();
  if (d.includes("image") || d.includes("camera") || d.includes("photo")) return NICHE_ICON_PACKS.imageSearch;
  if (d.includes("stock") || d.includes("forex") || d.includes("currency") || d.includes("endowment") || d.includes("estimated")) return NICHE_ICON_PACKS.stockFinance;
  if (d.includes("barcode") || d.includes("qrcode") || d.includes("qr")) return NICHE_ICON_PACKS.barcodeScanner;
  if (d.includes("invisible") || d.includes("unicode") || d.includes("symbol") || d.includes("lenny") || d.includes("txtcounter")) return NICHE_ICON_PACKS.invisibleUnicode;
  if (d.includes("font") || d.includes("italic")) return NICHE_ICON_PACKS.fontsTypography;
  if (d.includes("ascii") || d.includes("txtart") || d.includes("textart") || d.includes("avatar") || d.includes("icon") || d.includes("logo") || d.includes("template")) return NICHE_ICON_PACKS.designGraphics;
  if (d.includes("recipe") || d.includes("cooker") || d.includes("bread") || d.includes("brisket") || d.includes("pasta") || d.includes("pizza") || d.includes("potato") || d.includes("egg")) return NICHE_ICON_PACKS.foodRecipes;
  if (d.includes("car") || d.includes("auto") || d.includes("busses")) {
    if (!d.includes("career") && !d.includes("card") && !d.includes("cart") && !d.includes("automatic") && !d.includes("automated")) {
      return NICHE_ICON_PACKS.automotiveCars;
    }
  }
  if (d.includes("pet") || d.includes("pupp") || d.includes("fox")) return NICHE_ICON_PACKS.petsAnimals;
  if (d.includes("job") || d.includes("career") || d.endsWith(".cv") || d.includes("unifiedcv")) return NICHE_ICON_PACKS.jobsCareers;
  if (d.includes("exam") || d.includes("course") || d.includes("learn") || d.includes("mooc") || d.includes("education") || d.includes("readbooks") || d.includes("translater")) return NICHE_ICON_PACKS.eduCourses;
  if (d.includes("mail") || d.includes("email") || d.includes("easysend") || d.includes("reply")) return NICHE_ICON_PACKS.emailMessaging;
  if (d.includes("video") || d.includes("movie") || d.includes("music") || d.includes("radio") || d.includes("station") || d.includes("yt.") || d.endsWith(".yt") || d.includes("channel")) return NICHE_ICON_PACKS.videoMusicRadio;
  if (d.includes("computer") || d.includes("laptop") || d.includes("processor") || d.includes("phone") || d.includes("mouse") || d.includes("comparing") || d.includes("counter")) return NICHE_ICON_PACKS.hardwareGaming;
  if (d.includes("erotic") || d.includes("sex") || d.includes("adult") || d.includes("porn")) return NICHE_ICON_PACKS.adultRomance;
  if (d.includes("shop") || d.includes("store") || d.includes("cart") || d.includes("deal") || d.includes("coupon") || d.includes("offer") || d.includes("discount") || d.includes("bid") || d.includes("buyandsell") || d.includes("jewel")) return NICHE_ICON_PACKS.ecommerceDeals;
  if (d.includes("seo") || d.includes("rank") || d.includes("tracking") || d.includes("marketing") || d.endsWith(".ad") || d.includes("ptc") || d.includes("ppv") || d.includes("social") || d.includes("list") || d.includes("domain") || d.includes("urls") || d.includes("flayer") || d.includes("findname")) return NICHE_ICON_PACKS.adMarketing;
  if (d.includes("text") || d.includes("article") || d.includes("writer") || d.includes("writing") || d.includes("blog") || d.includes("post") || d.includes("caption") || d.includes("story") || d.includes("book")) return NICHE_ICON_PACKS.writingBlog;
  if (d.includes("prompt") || d.includes("mentifact") || d.includes("llm") || d.includes("ai") || d.includes("auto") || d.includes("generator") || d.includes("responsiv") || d.includes("toolkit") || d.includes("code") || d.includes("webmaster") || d.includes("engineer")) return NICHE_ICON_PACKS.aiDevTools;
  return NICHE_ICON_PACKS.homeTravelBiz;
}

export function parseDomainOrBrand(rawInput: string) {
  const cleaned = rawInput.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
  const low = cleaned.toLowerCase();
  const parts = cleaned.split('.');
  const namePart = parts[0] || "Brand";
  const extPart = parts.length > 1 ? '.' + parts.slice(1).join('.') : '.com';

  let word1 = "";
  let word2 = "";
  let word3 = "";

  if (EXACT_SPLITS[low]) {
    word1 = EXACT_SPLITS[low][0];
    word2 = EXACT_SPLITS[low][1];
    word3 = EXACT_SPLITS[low][2] || "";
  } else if (namePart.includes('-')) {
    const hy = namePart.split('-').filter(Boolean);
    word1 = capitalize(hy[0]);
    word2 = hy[1] ? capitalize(hy[1]) : "";
    word3 = hy.length > 2 ? hy.slice(2).map(capitalize).join('') : "";
  } else if (namePart.includes('_')) {
    const hy = namePart.split('_').filter(Boolean);
    word1 = capitalize(hy[0]);
    word2 = hy[1] ? capitalize(hy[1]) : "";
    word3 = hy.length > 2 ? hy.slice(2).map(capitalize).join('') : "";
  } else if (namePart.includes(' ')) {
    const words = namePart.split(/\s+/).filter(Boolean);
    word1 = capitalize(words[0]);
    word2 = words[1] ? capitalize(words[1]) : "";
    word3 = words.length > 2 ? words.slice(2).map(capitalize).join(' ') : "";
  } else if (namePart !== namePart.toUpperCase() && namePart !== namePart.toLowerCase()) {
    const tokens = namePart.match(/[A-Z]+(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+|[0-9]+[a-zA-Z]*/g);
    if (tokens && tokens.length >= 2) {
      word1 = capitalize(tokens[0]);
      word2 = capitalize(tokens[1]);
      word3 = tokens.length > 2 ? tokens.slice(2).map(capitalize).join('') : "";
    } else {
      const [seg1, seg2, seg3] = segmentDomainSld(namePart);
      word1 = seg1 || capitalize(namePart);
      word2 = seg2 || "";
      word3 = seg3 || "";
    }
  } else {
    const [seg1, seg2, seg3] = segmentDomainSld(namePart);
    word1 = seg1 || capitalize(namePart);
    word2 = seg2 || "";
    word3 = seg3 || "";
  }

  const isSingle = !word2 && !word3;
  const keepExt = isSingle && MEANINGFUL_TLDS.has(extPart.toLowerCase());
  const semanticSecond = [word2, word3].filter(Boolean).join('') || extPart.replace('.', '').toUpperCase();
  const match = matchSemanticIconsForDomain(cleaned, word1, semanticSecond);

  return {
    domain: cleaned,
    word1,
    word2,
    word3,
    ext: extPart,
    keepExt,
    nicheLabel: match.niche,
    icons10: match.icons,
    iconGroups: match.groups,
    palette: match.palette,
  };
}

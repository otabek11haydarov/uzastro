export interface Topic {
  slug: string;
  title: string;
  subtitle: string;
  emoji: string;
  from: string;
  to: string;
  intro: string;
  explanation: string[];
  facts: string[];
  cards: { title: string; text: string }[];
}

export const TOPICS: Topic[] = [
  {
    slug: "quyosh-tizimi",
    title: "Quyosh tizimi",
    subtitle: "Bizning kosmik uyimiz",
    emoji: "☀️",
    from: "#FFB347",
    to: "#FF5E62",
    intro:
      "Quyosh tizimi taxminan 4,6 milliard yil oldin gaz va chang bulutidan shakllangan. Uning markazida Quyosh, atrofida 8 ta sayyora, mitti sayyoralar, yuzlab yo'ldoshlar, asteroidlar va kometalar aylanadi.",
    explanation: [
      "Quyosh tizimi massasining deyarli hammasi (taxminan 99,86%) Quyoshga tegishli. Sayyoralar uning tortishish kuchi tufayli ellips shaklidagi orbitalar bo'ylab harakatlanadi.",
      "Ichki sayyoralar (Merkuriy, Venera, Yer, Mars) toshloq. Tashqi sayyoralar ikki turga bo'linadi: gaz gigantlari (Yupiter, Saturn) va muz gigantlari (Uran, Neptun).",
    ],
    facts: [
      "Quyosh nuri Yerga taxminan 8 daqiqa 20 soniyada yetib keladi.",
      "Rasman tan olingan mitti sayyoralar: Pluton, Seres, Eris, Xaumea va Makemake.",
      "Asosiy asteroidlar kamari Mars va Yupiter orbitalari orasida joylashgan.",
      "1 astronomik birlik (AB) — Yerdan Quyoshgacha o'rtacha masofa, taxminan 150 million km.",
    ],
    cards: [
      { title: "Ichki sayyoralar", text: "Merkuriy, Venera, Yer va Mars — qattiq yuzali, nisbatan kichik va zich sayyoralar." },
      { title: "Tashqi sayyoralar", text: "Yupiter va Saturn asosan vodorod va geliydan iborat; Uran va Neptunda esa suv, ammiak va metan muzlari ko'p." },
      { title: "Kuiper kamari", text: "Neptun orbitasidan tashqarida joylashgan muzli jismlar mintaqasi; Pluton shu yerda." },
    ],
  },
  {
    slug: "sayyoralar",
    title: "Sayyoralar",
    subtitle: "Sakkiz olam",
    emoji: "🪐",
    from: "#6FD6FF",
    to: "#9065FF",
    intro:
      "Har bir sayyora o'ziga xos dunyo: Venerada qo'rg'oshinni eritadigan issiqlik, Marsda Quyosh tizimidagi eng baland vulqon, Neptunda esa ovoz tezligidan tez shamollar bor.",
    explanation: [
      "Sayyora — Quyosh atrofida aylanuvchi, o'z tortishishi tufayli deyarli sharsimon shakl olgan va orbitasi atrofini boshqa jismlardan tozalagan jism.",
      "Sayyoralarni solishtirish ularning kelib chiqishi va muhitini tushunishga yordam beradi; shu orqali Yerning noyob jihatlari ham yaxshiroq anglanadi.",
    ],
    facts: [
      "Yupiterning diametri Yernikidan taxminan 11 baravar katta.",
      "Venera boshqa sayyoralarga nisbatan teskari yo'nalishda sekin aylanadi; uning bir sutkasi yilidan uzun.",
      "Merkuriy Quyosh atrofida taxminan 88 Yer sutkasida bir marta aylanadi.",
      "Mars yuzidagi Olimp tog'i balandligi taxminan 22 km — Quyosh tizimidagi eng baland ma'lum vulqonlardan biri.",
      "Uran o'z o'qi bo'ylab deyarli «yonboshlab» aylanadi.",
      "Saturnning o'rtacha zichligi suvnikidan kam.",
    ],
    cards: [
      { title: "Yupiter", text: "Eng katta sayyora. Atmosferasidagi Katta Qizil Dog' — asrlardan beri davom etayotgan ulkan bo'ron." },
      { title: "Saturn", text: "Muz va tosh zarralaridan iborat ajoyib halqalar tizimiga ega." },
      { title: "Mars", text: "Kelajakdagi inson ekspeditsiyalari uchun eng ko'p o'rganilayotgan sayyora; ko'plab robotlar ishlagan." },
    ],
  },
  {
    slug: "yulduzlar",
    title: "Yulduzlar",
    subtitle: "Osmon chiroqlari",
    emoji: "⭐",
    from: "#FFE66D",
    to: "#FF9F43",
    intro:
      "Yulduzlar — o'z tortishish kuchi bilan ushlab turilgan ulkan plazma sharlari. Ularning yadrosida vodorod geliyga aylanib, yorug'lik va issiqlik beradi.",
    explanation: [
      "Yulduzning rangi sirt haroratiga bog'liq: eng issiqlari ko'kimtir-oq, eng sovuqlari qizg'ish ko'rinadi. Quyosh sariq mitti (G2V) hisoblanadi.",
      "Yulduzning taqdiri massasiga bog'liq: Quyosh kabi yulduzlar oq mittiga aylanadi, juda massivlari esa o'ta yangi yulduz sifatida portlab, neytron yulduz yoki qora tuynuk qoldiradi.",
    ],
    facts: [
      "Quyoshdan keyin Yerga eng yaqin yulduz — Proksima Sentavra (taxminan 4,24 yorug'lik yili).",
      "Quyosh taxminan 4,6 milliard yoshda va yana taxminan 5 milliard yil barqaror yonishi kutilmoqda.",
      "Betelgeyze — Orion yulduz turkumidagi qizil o'ta gigant.",
      "Neytron yulduzlar shu qadar zich, ularning bir choy qoshiq moddasi milliardlab tonna og'irlikda bo'lardi.",
    ],
    cards: [
      { title: "Mirzo Ulug'bek va yulduzlar", text: "XV asrda Samarqandda Mirzo Ulug'bek rasadxona qurdirib, yulduzlar katalogi «Ziji Ko'ragoniy»ni tuzgan. Unda 1000 dan ortiq yulduzning o'rni aniq o'lchangan." },
      { title: "Yulduz hayoti", text: "Tumanlikda tug'ilish → asosiy ketma-ketlik → gigant bosqichi → oq mitti yoki o'ta yangi yulduz." },
      { title: "Yulduz turkumlari", text: "Qadimdan odamlar osmonni turkumlarga ajratib, yo'l topish va vaqtni o'lchashda foydalanishgan." },
    ],
  },
  {
    slug: "galaktikalar",
    title: "Galaktikalar",
    subtitle: "Yulduzlar orollari",
    emoji: "🌌",
    from: "#9065FF",
    to: "#35C8FF",
    intro:
      "Galaktika — yulduzlar, gaz, chang va qorong'u materiyadan tashkil topgan ulkan tizim. Koinotda yuz milliardlab galaktikalar bor.",
    explanation: [
      "Galaktikalar asosan spiral, elliptik va noto'g'ri shaklli turlarga bo'linadi. Somon yo'li — to'siqli spiral galaktika.",
      "Galaktikalar guruh va klasterlarga birlashadi. Somon yo'li va Andromeda galaktikasi «Mahalliy guruh»ning eng yirik a'zolaridir.",
    ],
    facts: [
      "Somon yo'lining diametri taxminan 100 000 yorug'lik yili.",
      "Andromeda galaktikasi bizdan taxminan 2,5 million yorug'lik yili uzoqlikda.",
      "Kelajakda (taxminan bir necha milliard yildan so'ng) Somon yo'li va Andromeda galaktikalari qo'shilishi kutilmoqda.",
      "Ko'pchilik yirik galaktikalar markazida o'ta massiv qora tuynuk joylashgan.",
    ],
    cards: [
      { title: "Somon yo'li", text: "Quyosh tizimi galaktikaning spiral shoxlaridan birida, markazdan chetroqda joylashgan." },
      { title: "Elliptik galaktikalar", text: "Asosan eski yulduzlardan iborat, shakli sharsimon yoki cho'zinchoq." },
      { title: "Qo'shilayotgan galaktikalar", text: "Galaktikalar to'qnashib, yangi yulduzlar tug'ilishiga sabab bo'lishi mumkin." },
    ],
  },
  {
    slug: "qora-tuynuklar",
    title: "Qora tuynuklar",
    subtitle: "Tortishishning chegarasi",
    emoji: "🕳️",
    from: "#2B2D42",
    to: "#9065FF",
    intro:
      "Qora tuynuk — tortishish kuchi shu qadar kuchli bo'lgan hududki, undan hatto yorug'lik ham qochib chiqa olmaydi.",
    explanation: [
      "Qora tuynukning chegarasi voqealar ufqi deyiladi. Undan tashqarida jismlar odatdagidek aylanib yurishi mumkin; ichkariga kirgan narsa esa tashqariga qaytmaydi.",
      "Qora tuynuklar bevosita ko'rinmaydi, lekin atrofidagi gaz nurlanishi, yulduzlar harakati va gravitatsion to'lqinlar orqali aniqlanadi.",
    ],
    facts: [
      "2019-yilda Event Horizon Telescope hamkorligi M87 galaktikasi markazidagi qora tuynukning birinchi tasvirini e'lon qildi.",
      "2022-yilda Somon yo'li markazidagi Sagittarius A* qora tuynugining tasviri e'lon qilindi.",
      "2015-yilda LIGO birinchi marta qo'shilayotgan qora tuynuklardan chiqqan gravitatsion to'lqinlarni qayd etdi.",
      "Kuchli tortishish yaqinida vaqt sekinlashadi (gravitatsion vaqt kengayishi).",
    ],
    cards: [
      { title: "Yulduz-massali", text: "Juda massiv yulduz yadrosi qulaganda hosil bo'ladi; massasi Quyoshnikidan bir necha baravardan yuzlab baravargacha." },
      { title: "O'ta massiv", text: "Galaktikalar markazida; massasi millionlab yoki milliardlab Quyosh massasiga teng." },
      { title: "Akkretsion disk", text: "Qora tuynuk atrofida aylanib, qizib nur sochuvchi gaz diski." },
    ],
  },
  {
    slug: "oy",
    title: "Oy va uning sirlari",
    subtitle: "Yerning yagona tabiiy yo'ldoshi",
    emoji: "🌙",
    from: "#CBD5E1",
    to: "#64748B",
    intro:
      "Oy Yerdan o'rtacha 384 400 km uzoqlikda. U dengizlar oqimiga ta'sir qiladi va insoniyat qadam qo'ygan yagona boshqa osmon jismidir.",
    explanation: [
      "Oy o'zi yorug'lik chiqarmaydi, Quyosh nurini qaytaradi. Faza o'zgarishi Quyosh, Yer va Oy o'zaro joylashuvining o'zgarishidan kelib chiqadi.",
      "Oyning bir tomoni doim Yerga qaragan, chunki uning o'z o'qi atrofida aylanish davri Yer atrofidagi aylanish davriga teng.",
    ],
    facts: [
      "Oy diametri Yernikining taxminan to'rtdan bir qismi.",
      "Oy har yili Yerdan taxminan 3,8 sm uzoqlashmoqda.",
      "1969-yil 20-iyulda Apollo 11 ekipaji Oyga qo'ngan.",
      "Oyning qutblaridagi doimiy soyali kraterlarda suv muzi izlari aniqlangan.",
    ],
    cards: [
      { title: "Oy fazalari", text: "Yangi oy, o'sayotgan oy, to'lin oy va so'nayotgan oy — taxminan 29,5 kunlik davr." },
      { title: "Oy tutilishi", text: "Oy Yer soyasiga kirganda sodir bo'ladi." },
      { title: "Kraterlar", text: "Oy yuzasidagi kraterlarning aksariyati asteroid va kometalar zarbidan hosil bo'lgan." },
    ],
  },
  {
    slug: "koinot-sirlari",
    title: "Koinot sirlari",
    subtitle: "Hali javobsiz savollar",
    emoji: "🔭",
    from: "#35C8FF",
    to: "#1B2A6B",
    intro:
      "Koinotning taxminan 95% qismi biz hali to'g'ridan-to'g'ri ko'ra olmaydigan qorong'u materiya va qorong'u energiyadan iborat. Bu zamonaviy fizikaning eng katta jumboqlaridan biri.",
    explanation: [
      "Koinot Katta portlashdan beri taxminan 13,8 milliard yil davomida kengayib kelmoqda. Bu kengayish galaktikalarning bir-biridan uzoqlashishida namoyon bo'ladi.",
      "Kosmik mikroto'lqinli fon nurlanishi — koinot yoshligidan qolgan eng qadimgi nur; u Katta portlash nazariyasining muhim isbotlaridan biri.",
    ],
    facts: [
      "Zamonaviy baholarga ko'ra koinotning energiya tarkibida qorong'u energiya ~68%, qorong'u materiya ~27%, oddiy materiya ~5%.",
      "Quyosh tizimidan tashqarida 6000 dan ortiq ekzosayyora tasdiqlangan.",
      "Yorug'lik tezligi vakuumda taxminan 300 000 km/s.",
      "Kuzatiladigan koinotning radiusi taxminan 46 milliard yorug'lik yili.",
    ],
    cards: [
      { title: "Qorong'u materiya", text: "Yorug'lik chiqarmaydi, lekin tortishish ta'siri orqali galaktikalar harakatida seziladi." },
      { title: "Fermi paradoksi", text: "Koinot shu qadar katta bo'lsa, nega hali boshqa sivilizatsiyalar izi topilmagan?" },
      { title: "Ekzosayyoralar", text: "Boshqa yulduzlar atrofidagi sayyoralar; ba'zilari «yashash zonasi»da joylashgan." },
    ],
  },
  {
    slug: "missiyalar",
    title: "Kosmik missiyalar",
    subtitle: "Insoniyatning kosmosga yo'li",
    emoji: "🚀",
    from: "#FF6B6B",
    to: "#9065FF",
    intro:
      "1957-yilda Sputnik-1 uchirilishi bilan kosmik davr boshlandi. Shundan beri sun'iy yo'ldoshlar, teleskoplar va zondlar koinot haqidagi bilimimizni tubdan o'zgartirdi.",
    explanation: [
      "Missiyalar turlari: orbital yo'ldoshlar, inson ekspeditsiyalari, sayyoralararo zondlar, rover va kosmik teleskoplar.",
      "Har bir missiya fan va texnologiyani oldinga suradi: aloqa, navigatsiya, iqlim kuzatuvi va tibbiyotning ko'p yutuqlari kosmik tadqiqotlar bilan bog'liq.",
    ],
    facts: [
      "Yuriy Gagarin 1961-yil 12-aprelda Yer orbitasiga chiqqan birinchi inson bo'ldi.",
      "Hubble kosmik teleskopi 1990-yilda ishga tushirilgan.",
      "James Webb kosmik teleskopi 2021-yil dekabrida uchirilgan va asosan infraqizil nurlarda kuzatadi.",
      "Voyager 1 zondi 1977-yilda uchirilgan va yulduzlararo fazoga chiqqan.",
      "Toshkent viloyatida tug'ilgan kosmonavt Vladimir Jonibekov kosmosga 5 marta uchgan.",
    ],
    cards: [
      { title: "Xalqaro kosmik stansiya", text: "Bir necha davlat hamkorligida yaratilgan orbital laboratoriya; unda mikrogravitatsiyada tajribalar o'tkaziladi." },
      { title: "Mars roverlari", text: "Perseverance kabi roverlar Marsning o'tmishda yashashga yaroqli bo'lganligini o'rganmoqda." },
      { title: "Kosmik teleskoplar", text: "Atmosfera xalaqit bermagani uchun ular juda aniq tasvir va spektrlar beradi." },
    ],
  },
];

export const TOPIC_BY_SLUG: Record<string, Topic> = Object.fromEntries(TOPICS.map((t) => [t.slug, t]));

export const UNIVERSE_FACTS: string[] = [
  "Koinotdagi yulduzlar soni Yer sohillaridagi qum donalaridan ko'p degan taxmin mavjud.",
  "Quyosh nuri Yerga 8 daqiqadan sal ko'proq vaqtda yetib keladi.",
  "Yupiter Yerning 1300 ga yaqin nusxasini sig'dira oladi (hajmi bo'yicha).",
  "Kosmosda ovoz tarqalmaydi, chunki uni uzatuvchi muhit deyarli yo'q.",
  "Oy Yerdan har yili taxminan 3,8 sm uzoqlashmoqda.",
  "Mirzo Ulug'bek Samarqandda XV asrda yulduzlar katalogini tuzgan.",
  "Venerada bir sutka (o'z o'qi atrofida aylanish) uning bir yilidan uzoqroq davom etadi.",
  "Somon yo'li galaktikasi diametri taxminan 100 000 yorug'lik yilidir.",
];

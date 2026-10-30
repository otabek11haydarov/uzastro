-- UzAstro: boshlang'ich ma'lumotlar. 001_schema.sql dan KEYIN bajaring.

insert into public.quest_templates (code,title,description,icon,difficulty,xp,topic,question_count,need_correct) values
('planets_easy','Sayyoralar sinovi','Sayyoralar haqida 3 ta savolga javob bering (kamida 2 tasi to''g''ri).','🪐','oson',20,'sayyoralar',3,2),
('solar_easy','Quyosh tizimi sinovi','Quyosh tizimi bo''yicha 3 ta savol. Kamida 2 tasi to''g''ri bo''lsin.','☀️','oson',20,'quyosh-tizimi',3,2),
('moon_easy','Oy sirlari','Oy haqida 3 ta savolga javob bering.','🌙','oson',20,'oy',3,2),
('stars_mid','Yulduzlar viktorinasi','Yulduzlar haqida 4 ta savol, kamida 3 tasi to''g''ri.','⭐','orta',40,'yulduzlar',4,3),
('galaxy_mid','Galaktikani o''rgan','Galaktikalar mavzusida 4 savol, kamida 3 tasi to''g''ri.','🌌','orta',40,'galaktikalar',4,3),
('mission_mid','Kosmik missiyalar','Kosmik missiyalar bo''yicha 4 savol, kamida 3 tasi to''g''ri.','🚀','orta',40,'missiyalar',4,3),
('secrets_mid','Koinot sirlari','Koinot sirlari bo''yicha 4 savol, kamida 3 tasi to''g''ri.','🔭','orta',40,'koinot-sirlari',4,3),
('bh_hard','Qora tuynuklar: mukammal natija','Qora tuynuklar haqida 4 savol — hammasiga to''g''ri javob bering.','🕳️','qiyin',80,'qora-tuynuklar',4,4),
('secrets_hard','Koinot sirlari: mukammal natija','4 ta savolning hammasiga to''g''ri javob bering.','🧠','qiyin',80,'koinot-sirlari',4,4),
('planets_hard','Sayyoralar ustasi','Sayyoralar bo''yicha 4 savolning hammasiga to''g''ri javob bering.','🪐','qiyin',80,'sayyoralar',4,4)
on conflict (code) do nothing;

insert into public.quiz_questions (topic,question,options,correct,explanation) values
('quyosh-tizimi','Quyosh tizimida nechta sayyora bor?','["7", "8", "9", "10"]'::jsonb,1,'Quyosh tizimida 8 ta sayyora bor: Merkuriy, Venera, Yer, Mars, Yupiter, Saturn, Uran va Neptun. Pluton 2006-yilda mitti sayyora deb tasniflangan.'),
('quyosh-tizimi','Quyoshdan Yergacha o''rtacha masofa taxminan qancha?','["15 million km", "150 million km", "1,5 milliard km", "15 milliard km"]'::jsonb,1,'O''rtacha masofa taxminan 150 million km — bu 1 astronomik birlik (AB).'),
('quyosh-tizimi','Quyosh tizimi umumiy massasining taxminan qancha qismi Quyoshga tegishli?','["50%", "75%", "90%", "99,8%"]'::jsonb,3,'Quyosh tizimi massasining taxminan 99,86% qismi Quyoshga to''g''ri keladi.'),
('quyosh-tizimi','Asteroidlar asosiy kamari qaysi sayyoralar orasida joylashgan?','["Yer va Mars", "Mars va Yupiter", "Yupiter va Saturn", "Uran va Neptun"]'::jsonb,1,'Asosiy asteroidlar kamari Mars va Yupiter orbitalari orasida joylashgan.'),
('sayyoralar','Quyosh tizimidagi eng katta sayyora qaysi?','["Saturn", "Neptun", "Yupiter", "Uran"]'::jsonb,2,'Yupiter eng katta sayyora: uning diametri Yernikidan taxminan 11 baravar katta.'),
('sayyoralar','Qaysi sayyora yuzasi eng issiq?','["Merkuriy", "Venera", "Mars", "Yupiter"]'::jsonb,1,'Venerada zich karbonat angidrid atmosferasi kuchli issiqxona effekti hosil qiladi; yuza harorati taxminan 465 °C.'),
('sayyoralar','Qaysi sayyora «Qizil sayyora» deb ataladi?','["Mars", "Venera", "Merkuriy", "Uran"]'::jsonb,0,'Mars yuzasidagi temir oksidi (zang) unga qizg''ish tus beradi.'),
('sayyoralar','Saturn halqalari asosan nimadan iborat?','["Gaz", "Suyuq metan", "Muz va tosh bo''laklari", "Qattiq metall"]'::jsonb,2,'Halqalar asosan suv muzi zarralaridan va oz miqdordagi tosh bo''laklaridan iborat.'),
('yulduzlar','Quyosh qaysi turdagi yulduz?','["Qizil gigant", "Oq mitti", "Sariq mitti", "Neytron yulduz"]'::jsonb,2,'Quyosh G2V spektral sinfiga mansub — odatda «sariq mitti» deb ataladi.'),
('yulduzlar','Yulduzlar yorug''lik va issiqlik energiyasini qanday olishadi?','["Kimyoviy yonish", "Yadro sintezi", "Radioaktiv yemirilish", "Gravitatsion sirpanish"]'::jsonb,1,'Yulduzlar yadrosida vodorod geliyga aylanadi (termoyadro sintezi) va energiya ajraladi.'),
('yulduzlar','Quyoshdan keyin Yerga eng yaqin yulduz qaysi?','["Sirius", "Proksima Sentavra", "Vega", "Betelgeyze"]'::jsonb,1,'Proksima Sentavra bizdan taxminan 4,24 yorug''lik yili uzoqlikda joylashgan.'),
('yulduzlar','Yulduzning rangi asosan nimaga bog''liq?','["Masofasiga", "Sirt haroratiga", "Aylanish tezligiga", "Faqat o''lchamiga"]'::jsonb,1,'Sirt harorati yuqori bo''lsa yulduz ko''kimtir-oq, past bo''lsa qizg''ish ko''rinadi.'),
('galaktikalar','Quyosh tizimi qaysi galaktikada joylashgan?','["Andromeda", "Somon yo''li", "Uchburchak", "Katta Magellan buluti"]'::jsonb,1,'Biz Somon yo''li galaktikasidamiz.'),
('galaktikalar','Somon yo''li qaysi turdagi galaktika?','["Elliptik", "Noto''g''ri shaklli", "To''siqli spiral", "Halqasimon"]'::jsonb,2,'Somon yo''li to''siqli spiral galaktika hisoblanadi.'),
('galaktikalar','Somon yo''liga eng yaqin yirik spiral galaktika qaysi?','["Andromeda (M31)", "Girdob (M51)", "Sombrero (M104)", "Pinwheel (M101)"]'::jsonb,0,'Andromeda galaktikasi bizdan taxminan 2,5 million yorug''lik yili uzoqlikda.'),
('galaktikalar','Ko''pchilik yirik galaktikalar markazida nima bo''ladi?','["Katta yulduz", "O''ta massiv qora tuynuk", "Bo''sh joy", "Neytron yulduzlar klasteri"]'::jsonb,1,'Ko''pchilik yirik galaktikalar markazida o''ta massiv qora tuynuk borligi kuzatilgan.'),
('qora-tuynuklar','Voqealar ufqi nima?','["Qora tuynuk yuzasidagi tog''", "Undan yorug''lik ham qochib chiqa olmaydigan chegara", "Qora tuynuk atrofidagi halqa", "Yulduzning tashqi qatlami"]'::jsonb,1,'Voqealar ufqi — bu chegara, undan o''tgan narsa (yorug''lik ham) tashqariga chiqa olmaydi.'),
('qora-tuynuklar','Event Horizon Telescope 2019-yilda qaysi galaktika markazidagi qora tuynuk tasvirini e''lon qildi?','["Somon yo''li", "Andromeda", "M87", "Uchburchak"]'::jsonb,2,'2019-yilda M87 galaktikasi markazidagi qora tuynukning birinchi tasviri e''lon qilindi.'),
('qora-tuynuklar','Somon yo''li markazidagi o''ta massiv qora tuynuk nomi nima?','["Cygnus X-1", "Sagittarius A*", "Proksima A", "Orion B"]'::jsonb,1,'Sagittarius A* massasi Quyosh massasidan taxminan 4 million marta katta.'),
('qora-tuynuklar','Yulduz-massali qora tuynuklar qanday hosil bo''lishi mumkin?','["Sayyoralar to''qnashuvidan", "Juda massiv yulduz o''z tortishish kuchi ostida qulashidan", "Kometalar yig''ilishidan", "Oy yemirilishidan"]'::jsonb,1,'Juda massiv yulduz yadrosi yonib bo''lgach qulab, qora tuynukka aylanishi mumkin.'),
('oy','Oy Yerdan o''rtacha qancha masofada?','["38 440 km", "384 400 km", "3 844 000 km", "150 000 000 km"]'::jsonb,1,'Oygacha o''rtacha masofa taxminan 384 400 km.'),
('oy','Inson Oyga birinchi marta qaysi yilda qadam qo''ygan?','["1957", "1961", "1969", "1975"]'::jsonb,2,'Apollo 11 missiyasi doirasida 1969-yil 20-iyulda Nil Armstrong Oyga qadam qo''ydi.'),
('oy','Nima uchun Oyning doim bir tomoni Yerga qaragan?','["Oy aylanmaydi", "Oyning o''z o''qi atrofida aylanish davri Yer atrofidagi aylanish davriga teng (sinxron aylanish)", "Yer Oyni ushlab turadi", "Magnit maydon tufayli"]'::jsonb,1,'Oyning o''z o''qi atrofida aylanish davri Yer atrofidagi aylanish davriga teng — bu sinxron aylanish.'),
('oy','Oy fazalari nima sababdan o''zgaradi?','["Yerning soyasi tufayli", "Oyning yorug''lik chiqarishi o''zgarishi tufayli", "Quyosh yoritgan qismini Yerdan turlicha ko''rishimiz tufayli", "Bulutlar tufayli"]'::jsonb,2,'Oy o''zi yorug''lik chiqarmaydi; faza Quyosh yoritgan qismini biz turli burchakdan ko''rishimizga bog''liq.'),
('koinot-sirlari','Katta portlashdan beri taxminan qancha vaqt o''tgan?','["13,8 million yil", "138 million yil", "13,8 milliard yil", "138 milliard yil"]'::jsonb,2,'Koinot yoshi taxminan 13,8 milliard yil deb baholanadi.'),
('koinot-sirlari','Koinot energiya tarkibining eng katta qismi nimadan iborat?','["Oddiy materiya", "Qorong''u materiya", "Qorong''u energiya", "Nurlanish"]'::jsonb,2,'Zamonaviy modelga ko''ra qorong''u energiya taxminan 68%, qorong''u materiya ~27%, oddiy materiya ~5%.'),
('koinot-sirlari','Vakuumda yorug''lik tezligi taxminan qancha?','["300 km/s", "30 000 km/s", "300 000 km/s", "3 000 000 km/s"]'::jsonb,2,'Yorug''lik tezligi taxminan 300 000 km/s.'),
('koinot-sirlari','Kosmik mikroto''lqinli fon nurlanishi nima?','["Yulduzlar nuri yig''indisi", "Katta portlashdan qolgan eng qadimgi nur", "Qora tuynuklar nurlanishi", "Quyosh shamoli"]'::jsonb,1,'Bu koinot shaffof bo''lgan davrdan qolgan eng qadimgi nurlanish (relikt nurlanish).'),
('missiyalar','Birinchi sun''iy yo''ldosh qaysi?','["Explorer-1", "Sputnik-1", "Vostok-1", "Hubble"]'::jsonb,1,'Sputnik-1 1957-yil 4-oktabrda uchirilgan.'),
('missiyalar','Yer orbitasiga chiqqan birinchi inson kim?','["Nil Armstrong", "Yuriy Gagarin", "Alan Shepard", "Valentina Tereshkova"]'::jsonb,1,'Yuriy Gagarin 1961-yil 12-aprelda «Vostok-1» kemasida kosmosga uchdi.'),
('missiyalar','Hubble kosmik teleskopi qaysi yilda orbitaga chiqarilgan?','["1975", "1990", "2001", "2021"]'::jsonb,1,'Hubble 1990-yilda uchirilgan.'),
('missiyalar','James Webb teleskopi asosan qaysi diapazonda kuzatadi?','["Rentgen", "Ultrabinafsha", "Infraqizil", "Radio"]'::jsonb,2,'James Webb teleskopi asosan infraqizil nurlarda ishlaydi.');

insert into public.achievements (code,title,description,icon,kind,threshold,xp_reward,sort) values
('birinchi_qadam','Birinchi qadam','Birinchi kunlik vazifani bajaring.','👣','quests',1,10,1),
('vazifa_10','Faol o''quvchi','10 ta kunlik vazifani bajaring.','📘','quests',10,50,2),
('kosmos_tadqiqotchisi','Kosmos tadqiqotchisi','Kashfiyotlar bo''limidagi barcha 8 ta mavzuni o''rganing.','🛰️','topics',8,100,3),
('seriya_3','3 kunlik faollik','3 kun ketma-ket faol bo''ling.','🔥','streak',3,0,4),
('seriya_7','7 kunlik faollik','7 kun ketma-ket faol bo''ling.','🔥','streak',7,0,5),
('seriya_14','14 kunlik faollik','14 kun ketma-ket faol bo''ling.','🔥','streak',14,0,6),
('seriya_30','30 kunlik faollik','30 kun ketma-ket faol bo''ling.','🌋','streak',30,0,7),
('seriya_50','50 kunlik faollik','50 kun ketma-ket faol bo''ling.','☄️','streak',50,0,8),
('seriya_100','100 kunlik faollik','100 kun ketma-ket faol bo''ling.','👑','streak',100,0,9),
('bilimdon','Bilimdon','100 ta to''g''ri javob bering.','🎓','correct',100,150,10),
('jamoa_azosi','Jamoadosh','Biror jamoaga qo''shiling.','🤝','team',1,20,11),
('jamoa_sardori','Jamoa sardori','O''z jamoangizni yarating va boshqaring.','🧭','leader',1,50,12),
('galaktika_ustasi','Galaktika ustasi','10 ta qiyin vazifani bajaring.','🌠','hard',10,200,13),
('daraja_5','Kashshof','5-darajaga yeting.','🛸','level',5,0,14),
('daraja_10','Kosmonavt','10-darajaga yeting.','🧑‍🚀','level',10,0,15)
on conflict (code) do nothing;

insert into public.space_events (kind,title,description,starts_on,note) values
('meteor','Leonidlar meteor oqimi','Leonidlar oqimi odatda noyabr o''rtalarida faollik cho''qqisiga chiqadi. Yorug'' Oy bo''lmagan, qorong''i osmonda kuzatish yaxshi.','2026-11-17'::date,'Cho''qqi sanasi taxminiy; aniq vaqtni astronomik kalendardan tekshiring.'),
('meteor','Geminidlar meteor oqimi','Yilning eng boy meteor oqimlaridan biri; odatda dekabr o''rtalarida cho''qqiga chiqadi.','2026-12-13'::date,'Cho''qqi sanasi taxminiy; aniq vaqtni astronomik kalendardan tekshiring.'),
('meteor','Kvadrantidlar meteor oqimi','Yangi yilning birinchi yirik meteor oqimi; cho''qqisi juda qisqa muddatli.','2027-01-03'::date,'Cho''qqi sanasi taxminiy; aniq vaqtni astronomik kalendardan tekshiring.'),
('eclipse','To''liq Quyosh tutilishi (2027)','2027-yil 2-avgustda Shimoliy Afrika va Yaqin Sharq hududlarida to''liq Quyosh tutilishi kutilmoqda.','2027-08-02'::date,'Ko''rinish zonasi O''zbekistondan tashqarida bo''lishi mumkin; mintaqangiz uchun tekshiring.');

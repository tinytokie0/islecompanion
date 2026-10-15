// Player stats copied from the IslePilot "Cretaceous Gone Wild" server leaderboard.
const DEFAULT_AVATAR =
  "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";

const raw = [
  { name: "TTVTurtleClub1938", hash: "a499bf31b0bbcf739c911ee742f468b1702a8246", kills: 51, deaths: 151, nests: 0 },
  { name: "Smokey", hash: "4a0f56af490a0756c661fac94647aeadafe00ae4", kills: 36, deaths: 72, nests: 18 },
  { name: "Britches shitted", hash: "13fb005db50f9f930ae9622aabac936082eafa49", kills: 31, deaths: 50, nests: 7 },
  { name: "Luhh_Grant", hash: "59305ce329204cff4d0370a0ce4f1bd025758cec", kills: 29, deaths: 45, nests: 4 },
  { name: "TtvDcgoodfellow", hash: null, kills: 24, deaths: 41, nests: 0 },
  { name: "Death_Row_Gaming", hash: null, kills: 21, deaths: 32, nests: 4 },
  { name: "BabyVenom", hash: "ce1e54201f9f4959a16b94d8a6b9b0736619d7ff", kills: 20, deaths: 103, nests: 16 },
  { name: "Toxic.rebel", hash: null, kills: 20, deaths: 79, nests: 0 },
  { name: "zeekgto", hash: "c2679f499119852828820aeb9bfb09c2d1d650d9", kills: 19, deaths: 88, nests: 0 },
  { name: "TheAllMotherTokyo", hash: "f9d430f39543a3685d37d0779b1cf73b7369de7d", kills: 18, deaths: 34, nests: 42 },
  { name: "unreadspam", hash: "6796cf53d1b12f7e70b34f2d02f69a41e1de3d81", kills: 18, deaths: 59, nests: 4 },
  { name: "MuricanWolfDen", hash: "337f2301619da853457380313a6ed102ab940ab3", kills: 15, deaths: 19, nests: 2 },
  { name: "TheAuroraDragon", hash: "842d911c89881ba5d48f6e74f5b41aba589a50c5", kills: 14, deaths: 28, nests: 10 },
  { name: "DefinitelyNotFormular", hash: "9a10f4bf606354b73297a8355345a2c7b62a73c1", kills: 12, deaths: 16, nests: 0 },
  { name: "MajorRebelSass", hash: "8c34d57230ced75396fd7449fb0fe4d0e4249205", kills: 9, deaths: 24, nests: 0 },
  { name: "WonderCatxx", hash: "0b2febdead253dbeed26c68930af541034d003d8", kills: 8, deaths: 14, nests: 2 },
  { name: "Loki3825", hash: "579387d4baf5abad1d5dccb581b1c9e322bb581b", kills: 8, deaths: 10, nests: 0 },
  { name: "Balakay626", hash: null, kills: 7, deaths: 15, nests: 0 },
  { name: "aident091913", hash: null, kills: 7, deaths: 14, nests: 0 },
  { name: "Koruka-chan", hash: "64447d566156337e94c594bf336e061e6cb3e407", kills: 7, deaths: 0, nests: 0 },
  { name: "lordLUMPS", hash: "353fbf319b4d6be576a60468f889bbe5432f8758", kills: 6, deaths: 16, nests: 0 },
  { name: "l0wCal", hash: "96fa7f84d239fdc1dbdbf795e3121d95447dce9b", kills: 5, deaths: 23, nests: 0 },
  { name: "Squatchy", hash: "f84283f3b5abcb4f3ffb28967f660b4a3c2a8fdc", kills: 4, deaths: 3, nests: 0 },
  { name: "silent4038", hash: null, kills: 3, deaths: 11, nests: 0 },
  { name: "moncheri19", hash: null, kills: 3, deaths: 3, nests: 4 },
  { name: "Tom D Lizard Core", hash: "055a039eb0f471890affcef241f618fe40175ad0", kills: 2, deaths: 12, nests: 0 },
  { name: "Enternal_Soul7", hash: "4d96f65d7c2b6c54e7ffe4e4e8c65ad1e45dc082", kills: 2, deaths: 7, nests: 0 },
  { name: "lucaswoodrow36", hash: null, kills: 2, deaths: 2, nests: 2 },
  { name: "B7C-haprocanteam", hash: "f89e44d6d468a69e4394d632c4fbe11d4353a899", kills: 2, deaths: 2, nests: 0 },
  { name: "aparre", hash: "1b790bb3d9dca8650c15fe2fbb48a520d7a80369", kills: 2, deaths: 1, nests: 0 },
  { name: "Static", hash: "e6fc56508d02ac39a931e9a0c2e5608960915bfd", kills: 1, deaths: 22, nests: 0 },
  { name: "JROB", hash: null, kills: 1, deaths: 16, nests: 0 },
  { name: "ShadowCrowns", hash: "c2c51159307ac0e5c3960f0df31732a07cd85cd0", kills: 1, deaths: 3, nests: 0 },
  { name: "GloriousJack", hash: "b698f81978cd408b5e210f5b5c09d308ae75165b", kills: 1, deaths: 3, nests: 0 },
];

export const ISLE_PLAYERS = raw.map((p) => ({
  ...p,
  avatar: p.hash
    ? `https://avatars.steamstatic.com/${p.hash}_full.jpg`
    : DEFAULT_AVATAR,
  kd: p.deaths > 0 ? p.kills / p.deaths : p.kills,
}));

export const ISLE_TOTALS = ISLE_PLAYERS.reduce(
  (t, p) => ({
    kills: t.kills + p.kills,
    deaths: t.deaths + p.deaths,
    nests: t.nests + p.nests,
  }),
  { kills: 0, deaths: 0, nests: 0 }
);
ISLE_TOTALS.kd = ISLE_TOTALS.kills / ISLE_TOTALS.deaths;
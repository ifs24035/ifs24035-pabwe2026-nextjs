// Modul kosong.
//
// Next.js mengimpor "next/dist/build/polyfills/polyfill-module" tanpa syarat
// dari next/dist/client/app-globals.js. Modul itu menambal API yang SUDAH
// tersedia di seluruh browser target resmi Next.js sendiri
// (MODERN_BROWSERSLIST_TARGET = chrome 111, edge 111, firefox 111, safari 16.4):
//   Array.prototype.at (Chrome 92/Safari 15.4), Object.hasOwn (Chrome 93),
//   Object.fromEntries (Chrome 73), Array.prototype.flat/flatMap (Chrome 69),
//   String.prototype.trimStart/trimEnd (Chrome 66).
// Karena itu polyfill tersebut hanya menambah byte yang tidak terpakai dan
// memicu audit Lighthouse "Avoid serving legacy JavaScript to modern browsers".
// Berkas ini menggantikannya dengan modul kosong lewat turbopack.resolveAlias.
export {};

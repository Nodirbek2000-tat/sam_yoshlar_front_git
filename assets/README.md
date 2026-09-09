# assets/

Asl (siqilmagan) fayllar. Bu papka saytga chiqmaydi — Next faqat `public/`
ichidagini beradi.

## yonalish/

Yo'nalish ikonkalarining asl PNG nusxalari. Saytga chiqadigan siqilgan
`.webp` nusxalari `public/yonalish/` da turadi.

Ikonkani yangilash:

    node -e "require('sharp')('assets/yonalish/ekologiya.png').resize(900,900,{fit:'inside'}).webp({quality:88}).toFile('public/yonalish/eco.webp')"

Fayl nomi yo'nalish kaliti bo'lishi shart: eco, fintech, ai, edu, social,
agro, energy, industry, startup, creative, culture, smartcity, science, water.

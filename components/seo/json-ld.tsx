/**
 * Strukturált adat beillesztése.
 *
 * A `JSON.stringify` kimenetét **escapelni kell**, mielőtt `<script>`-be kerül:
 * egy `</script>` részlet bármelyik szövegmezőben (például egy leírásban)
 * lezárná a blokkot, és onnantól a maradék JSON mint HTML értelmeződne. Ez a
 * klasszikus, néma XSS-vektor a JSON-LD körül.
 *
 * A `<` escapelése elég és biztonságos: a JSON szabvány szerint a `\u003c` a
 * `<` érvényes alakja, tehát az elemzők ugyanazt az objektumot kapják.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, '\u003c');

  return (
    <script
      type="application/ld+json"
      // A tartalom a saját forrásunkból épül, nem felhasználói bemenetből, és
      // a fenti escapelés a maradék kockázatot is elzárja.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

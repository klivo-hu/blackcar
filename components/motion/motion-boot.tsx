/**
 * A mozgásrendszer indítója.
 *
 * Egyetlen, a `<head>`-be ágyazott szkript, ami **az első festés előtt** fut le,
 * és két jelzőt tesz ki a `<html>` elemre:
 *
 * - `data-motion="ready"` — innen tudja a CSS, hogy a görgetésre megjelenő
 *   tartalmat el kell rejtenie. Enélkül minden látszik, tehát kikapcsolt
 *   JavaScript vagy hibás betöltés esetén sem tűnhet el a szöveg.
 * - `data-intro="run"` — a nyitó függöny csak a **főoldal** teljes
 *   betöltésekor fut le. Aloldalon nem: ott a látogató már bent van, és egy
 *   megismételt bevezető csak várakoztatná. Oldalon belüli navigáció nem
 *   indítja újra, mert ez a szkript csak dokumentumbetöltéskor fut.
 *
 * Miért beágyazott szkript és nem `useEffect`: az effekt a festés *után* fut.
 * Onnan indítva a látogató először a kész oldalt látná, aztán tűnne el belőle
 * minden, hogy újra megjelenhessen — pontosan az a villanás, amit el akarunk
 * kerülni. Ez az egyik olyan eset, ahol a beágyazott szkript a helyes válasz.
 *
 * Csökkentett mozgás esetén egyik jelző sem kerül ki: nincs függöny, és nincs
 * mit felfedni.
 */

const BOOT = `try{
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
var d=document.documentElement;d.dataset.motion='ready';
if(location.pathname==='/'){d.dataset.intro='run';}
}}catch(e){}`;

export function MotionBoot() {
  return <script dangerouslySetInnerHTML={{ __html: BOOT }} />;
}

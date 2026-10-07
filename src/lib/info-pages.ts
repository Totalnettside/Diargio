export type InfoSection = { h: string; p: string[] };
export type InfoPage = { title: string; lead: string; sections: InfoSection[]; cta?: { label: string; to: "/selg" | "/kunst" } };

export const infoPages: Record<string, InfoPage> = {
  "om-oss": {
    title: "Om oss",
    lead: "Diargio er en norsk markedsplass for kjøp og salg av kunst fra kunstnere, gallerier og private selgere.",
    sections: [
      { h: "Hvorfor Diargio", p: ["Vi vil gjøre det enkelt å finne kunst du blir glad i, og enkelt for kunstnere å nå frem til kjøpere."] },
      { h: "Kunstnerne først", p: ["Hver kunstner får egen profil med historie, atelierbilder og verk, slik at kjøperen forstår menneskene bak kunsten."] },
      { h: "Kontakt", p: ["Spørsmål? Send oss en e-post på post@diargio.com."] },
    ],
  },
  "slik-fungerer-diargio": {
    title: "Slik fungerer Diargio",
    lead: "Fra første klikk til verket henger på veggen.",
    sections: [
      { h: "For kjøpere", p: ["Bla gjennom kunst, bruk filtrene og lagre favoritter. Du kan kjøpe direkte med «Kjøp nå» eller gi bud.", "Du kan snakke med selger i meldinger og i dealroom."] },
      { h: "For selgere", p: ["Opprett bruker, legg ut bilder og informasjon om verket, og publiser. Du får varsel når noen gir bud eller sender melding.", "Du godkjenner eller avslår bud selv under «Min side → Bud»."] },
    ],
    cta: { label: "Utforsk kunst", to: "/kunst" },
  },
  "trygg-kunsthandel": {
    title: "Trygg kunsthandel",
    lead: "Vi vil at både kjøper og selger skal føle seg trygge.",
    sections: [
      { h: "Sikker betaling", p: ["Betaling skal gå gjennom Diargio med Stripe, slik at pengene ikke utveksles direkte mellom partene. Betalingsløsningen kobles på snart."] },
      { h: "Ekte brukere", p: ["Alle annonser kommer fra registrerte brukere. Kun de som har kjøpt av en selger kan skrive omtale."] },
      { h: "Tips", p: ["Hold kommunikasjon og betaling inne på Diargio, og kontakt oss på post@diargio.com ved mistanke om svindel."] },
    ],
  },
  "betaling-og-levering": {
    title: "Betaling og levering",
    lead: "Slik fungerer betaling og frakt.",
    sections: [
      { h: "Betaling", p: ["Betaling skal skje trygt gjennom Diargio. Kortbetaling via Stripe er under oppkobling."] },
      { h: "Levering", p: ["Selger oppgir om verket kan sendes eller må hentes. Ved forsendelse avtaler partene transport, for eksempel med Posten eller Bring, og bør velge forsikring.", "For verdifull kunst anbefaler vi spesialisert kunsttransport."] },
    ],
  },
  "priser-og-gebyrer": {
    title: "Priser og gebyrer",
    lead: "Det er gratis å opprette bruker og legge ut annonser.",
    sections: [
      { h: "Gebyr ved salg", p: ["Ved hver handel tar Diargio 20 % i gebyr, pluss 5 % kunstavgift. Totalt 25 % per handel.", "Du betaler ingenting hvis verket ikke selges."] },
    ],
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
  "ofte-stilte-sporsmal": {
    title: "Ofte stilte spørsmål",
    lead: "Svar på det mange lurer på.",
    sections: [
      { h: "Koster det noe å legge ut kunst?", p: ["Nei. Gebyret på 25 % tas først når et verk selges."] },
      { h: "Hvordan gir jeg bud?", p: ["Åpne annonsen og trykk «Gi bud». Selger får varsel og kan godkjenne eller avslå."] },
      { h: "Kan jeg endre eller slette annonsen min?", p: ["Ja, under «Min side → Mine annonser»."] },
      { h: "Hvem kan skrive omtale?", p: ["Kun de som har kjøpt kunst av selgeren."] },
    ],
  },
  "for-kunstnere": {
    title: "For kunstnere",
    lead: "Vis frem kunsten din og fortellingen bak den.",
    sections: [
      { h: "Din egen profil", p: ["Legg til biografi, historien bak kunsten, atelierbilder og teknikker under «Min side → Min profil»."] },
      { h: "Følgere", p: ["Brukere kan følge deg og får varsel når du legger ut nye verk."] },
    ],
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
  "for-gallerier": {
    title: "For gallerier",
    lead: "Nå nye kjøpere med utvalget deres.",
    sections: [
      { h: "Slik kommer du i gang", p: ["Opprett en bruker for galleriet, fyll ut profilen og legg ut verkene. Ta kontakt på post@diargio.com for spørsmål om større utvalg."] },
    ],
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
  "for-private-selgere": {
    title: "For private selgere",
    lead: "Har du kunst som fortjener et nytt hjem?",
    sections: [
      { h: "Enkelt å selge", p: ["Ta gode bilder, beskriv verket og sett pris. Du kan ta imot bud og snakke med kjøper i meldinger."] },
    ],
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
  "guide-til-a-selge-kunst": {
    title: "Guide til å selge kunst",
    lead: "Fem råd for en god annonse.",
    sections: [
      { h: "1. Gode bilder", p: ["Bruk dagslys og vis hele verket, pluss detaljer."] },
      { h: "2. Riktige opplysninger", p: ["Oppgi kunstner, teknikk, mål og stand nøyaktig."] },
      { h: "3. Fortell historien", p: ["Hva inspirerte verket? Det hjelper kjøperen å velge akkurat dette."] },
      { h: "4. Realistisk pris", p: ["Husk at gebyret er 25 % ved salg."] },
      { h: "5. Svar raskt", p: ["Raske svar på meldinger og bud gir flere salg."] },
    ],
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
};

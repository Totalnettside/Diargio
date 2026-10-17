export type InfoSection = { h: string; p: string[] };
export type InfoPage = { title: string; lead: string; sections: InfoSection[]; cta?: { label: string; to: "/selg" | "/kunst" } };

export const infoPages: Record<string, InfoPage> = {
  "om-oss": {
    title: "Om oss",
    lead: "Velkommen til et kunstunivers hvor alle har sin plass.",
    sections: [
      {
        h: "Vår visjon",
        p: [
          "Vi brenner for kunst, skulpturer og malerier – men mest av alt brenner vi for skapergleden og menneskene bak verkene.",
          "Vi vet at det finnes uendelig mye talent der ute. Rundt om i de tusen hjem sitter det fantastiske skapere som tryller frem unike verk på kjøkkenbordet, i garasjen eller på et lite hobbyrom. Likevel er det altfor mange som aldri tar steget ut for å vise frem eller selge det de lager. Kanskje føles de tradisjonelle galleriene for dyre, for ekskluderende, eller kanskje føles terskelen ganske enkelt for høy og skummel.",
          "Det ønsker vi å gjøre noe med. Denne markedsplassen ble til ut fra en klar visjon: Kunst skal ikke bare være for de få utvalgte eller de veletablerte proffene. Kunst handler om følelser, lidenskap og personlige uttrykk – og det tilhører oss alle.",
          "Her bygger vi et levende fellesskap der etablerte kunstnere og uoppdagede talenter står side om side. Vi vil fjerne barrierene og gi alle muligheten til å skinne, uavhengig av bakgrunn eller CV.",
        ],
      },
      {
        h: "For deg som skaper",
        p: ["Dette er ditt trygge rom. Ta steget ut av skyggen, vis frem det du er stolt av, og nå ut til folk som vil elske det du gjør."],
      },
      {
        h: "For deg som elsker kunst",
        p: ["Utforsk et unikt mangfold av malerier og skulpturer du ikke finner i de vanlige galleriene – laget av mennesker med ekte lidenskap."],
      },
      {
        h: "Historien bak navnet",
        p: [
          "Navnet DIARGIO er et nyskapt ord bygget på en sammensmelting av to av naturens mest fascinerende skapninger. Det klinger som et prestisjetungt, internasjonalt galleri med hundre års historie.",
          "DIA kommer fra Diaethria, slektsnavnet til «88-sommerfuglen». Sommerfuglen representerer ekstrem estetikk, transformasjon og frihet – den trekker publikum inn med sin luksuriøse skjønnhet.",
          "ARGIO kommer fra Argiope, slektsnavnet til hjulspinner-edderkoppene. Edderkoppen representerer arkitektur, tålmodighet, struktur og det å bygge et massivt, uendelig nett – fundamentet som holder konseptet sammen.",
          "Sammen skaper de den ultimate balansen mellom den frie, visuelle kunsten og det strukturerte, solide forretningsgrunnlaget.",
        ],
      },
      {
        h: "Energiene i merkevaren",
        p: [
          "Edderkoppens 8 bein og sommerfuglens 88-mønster danner selve uendelighetssymbolet – trygge, tidløse røtter. Sommerfuglens symmetri gir harmoni og kjærlighet til verket, og det nyskapende uttrykket formidler kunstens historie.",
          "Kjernestikkordene våre er nyskapende, tidløst, og kjærlighet, energi og visdom – drivkraften bak hvert eneste kunstverk og møtet med publikum.",
        ],
      },
      { h: "Kontakt", p: ["Spørsmål? Send oss en e-post på post@diargio.com, eller følg oss på LinkedIn."] },
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
      { h: "Gebyr ved salg", p: ["Diargios provisjon er 20 % av ønsket utbetaling til selger. Kunstavgiften er 5 % av beløpet inkludert provisjon, kun når ønsket utbetaling er over 2 000 kr. Kjøperens annonsepris inkluderer disse beløpene; frakt kommer separat.", "Du betaler ingenting hvis verket ikke selges."] },
    ],
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
  "ofte-stilte-sporsmal": {
    title: "Ofte stilte spørsmål",
    lead: "Svar på det mange lurer på.",
    sections: [
      { h: "Koster det noe å legge ut kunst?", p: ["Nei. Provisjon og eventuell kunstavgift er inkludert i annonseprisen og gjelder når verket selges."] },
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
      { h: "4. Realistisk pris", p: ["Prisberegneren viser ønsket utbetaling, provisjon, eventuell kunstavgift og totalprisen kjøper ser."] },
      { h: "5. Svar raskt", p: ["Raske svar på meldinger og bud gir flere salg."] },
    ],
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
};

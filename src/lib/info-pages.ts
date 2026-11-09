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
      { h: "Kontakt", p: ["Spørsmål? Send e-post til post@diargio.com. Følg oss på LinkedIn, Instagram & Facebook."] },
    ],
  },
  "slik-fungerer-diargio": {
    title: "Slik fungerer Diargio",
    lead: "Et sted å vise frem, oppdage og handle kunst.",
    sections: [
      {
        h: "Et sted å vise frem, oppdage og handle kunst",
        p: [
          "Diargio knytter sammen mennesker som skaper kunst, og mennesker som ønsker å gi den en plass i livet sitt. Her kan både etablerte kunstnere, hobbykunstnere, gallerier og private selgere vise frem og selge malerier, skulpturer og andre kunstverk. Du trenger ikke være profesjonell for å dele det du skaper.",
        ],
      },
      {
        h: "For kjøpere",
        p: [
          "Utforsk kunst, finn dine favoritter og bli kjent med verkene og menneskene bak. Kjøp direkte med «Kjøp nå», eller gi et bud. Har du spørsmål om verket eller leveringen, kan du kontakte selger gjennom meldingstjenesten.",
          "Betalingen håndteres trygt gjennom Stripe. Levering avtales med selger, slik at dere finner en løsning som passer verket.",
        ],
      },
      {
        h: "For selgere",
        p: [
          "Opprett en bruker og presenter verket ditt med gode bilder, en beskrivelse og ønsket pris. Fortell om materialene, størrelsen, vekt og historien bak – det gjør det lettere for kjøperen å bli kjent med det du selger.",
          "Du får varsel når noen sender en melding eller gir et bud. Du bestemmer selv hvilke bud du vil godta, og administrerer dem under «Min side → Bud».",
        ],
      },
      {
        h: "Frakt og overlevering",
        p: [
          "Kunst kommer i mange former og størrelser. Du kan velge sending med Posten/Bring der det passer, eller avtale henting, personlig overlevering eller annen transport direkte med kjøperen eller selgeren.",
          "Noen verk trenger ekstra omtanke underveis. Selger er ansvarlig for å pakke sin kunst slik at den kommer trygt og uskadet fram til kjøper. Diargio kan hjelpe med veiledning, slik at dere finner en egnet løsning for pakking og levering – post@diargio.com.",
        ],
      },
      {
        h: "En felles plass for kunst",
        p: [
          "Diargio er en markedsplass og formidler mellom kjøper og selger. Selve handelen skjer mellom dere, mens vi legger til rette for enkel kontakt, trygg betaling og en oversiktlig prosess.",
          "Enten du selger ditt første verk eller har skapt kunst i mange år, er du velkommen. Hos Diargio har alle sin plass.",
        ],
      },
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
    lead: "En god presentasjon gjør det lettere å oppdage kunsten din – og tryggere å kjøpe den. Enten du skal selge ditt første verk eller har lang erfaring, hjelper denne guiden deg med å lage en tydelig og innbydende annonse på Diargio.",
    sections: [
      {
        h: "1. Vis verket fra sin beste side",
        p: [
          "Bruk skarpe bilder i jevnt dagslys, og unngå gjenskinn, sterke skygger og filtre som endrer fargene. En mobiltelefon er ofte tilstrekkelig når lyset er godt.",
          "La hovedbildet vise hele verket. Suppler gjerne med nærbilder av struktur, signatur og detaljer. Vis ramme, kanter og bakside der det er relevant, og fotografer skulpturer fra flere vinkler.",
          "Et bilde av verket i et rom kan hjelpe kjøperen å forstå størrelsen. Hvis du bruker en digital romvisning, merk den tydelig som en illustrasjon og vis verket i realistisk skala.",
        ],
      },
      {
        h: "2. Gi presise og ærlige opplysninger",
        p: [
          "En god annonse svarer på det kjøperen trenger å vite. Ta med:",
          "• Kunstnerens navn og verkets tittel.",
          "• Teknikk, materialer og årstall, hvis kjent.",
          "• Høyde, bredde og eventuell dybde i centimeter, samt vekt når det er relevant for transport.",
          "• Om verket er et originalverk, et trykk eller en reproduksjon. Oppgi opplag og nummerering der det finnes.",
          "• Om verket er signert, innrammet og klart til å henges opp eller stilles ut.",
          "• Verkets tilstand, inkludert eventuelle skader, slitasje eller reparasjoner.",
          "Oppgi mål både med og uten ramme. Selger du et verk av en annen kunstner, bør du også beskrive det du kjenner til om verkets opprinnelse og eventuell dokumentasjon. Vær tydelig dersom opplysninger er ukjente.",
        ],
      },
      {
        h: "3. Fortell historien bak verket",
        p: [
          "Gi kjøperen et innblikk i det som gjør verket spesielt. Hva inspirerte motivet? Hvordan har du arbeidet med materialene? Hvilket uttrykk ønsket du å skape?",
          "Skriv personlig, enkelt og konkret. Du trenger ikke bruke kunstfaglige begreper – noen få gjennomtenkte setninger kan gjøre det lettere å få et forhold til verket.",
          "Selger du kunst du selv har kjøpt, kan du fortelle om verkets historie og ditt forhold til det, uten å gjette på kunstnerens intensjon.",
        ],
      },
      {
        h: "4. Sett en gjennomtenkt pris",
        p: [
          "Ta utgangspunkt i materialer, tidsbruk, størrelse, teknikk og tidligere salg. Sammenlign gjerne med lignende verk av kunstnere med tilsvarende erfaring, men husk at en annonsert pris ikke nødvendigvis er en oppnådd salgspris.",
          "Bruk prisberegneren på Diargio for å se ønsket utbetaling, provisjon, eventuell kunstavgift og totalprisen som vises til kjøperen. Kontroller også hvordan frakt og emballasje påvirker regnestykket.",
          "Bestem gjerne på forhånd hvilke bud du er villig til å godta.",
        ],
      },
      {
        h: "5. Planlegg pakking og levering",
        p: [
          "Tenk gjennom hvordan verket kan leveres allerede før du publiserer annonsen. Posten/Bring kan være et alternativ der størrelse, vekt og innhold passer. For store, tunge eller skjøre verk kan henting, personlig overlevering eller annen transport være mer egnet.",
          "Som selger har du ansvar for å emballere verket forsvarlig. Tilpass beskyttelsen til materialene, overflaten og eventuelle skjøre deler. Kontroller transportørens vilkår for kunst, emballasje og eventuell transportforsikring før du sender.",
          "Ta bilder av verkets tilstand og innpakkingen før sending, og ta vare på kvittering og sporingsinformasjon. Avtal leveringsmåte, kostnader og forventet sendetid med kjøperen.",
        ],
      },
      {
        h: "6. Følg opp interessen",
        p: [
          "Svar så raskt du har anledning på spørsmål og bud. Vær imøtekommende, gi tydelige svar og tilby flere bilder hvis kjøperen ønsker det.",
          "Bruk meldingstjenesten på Diargio til å samle dialogen og avtalene. Betalingen gjennomføres via Stripe i Diargios betalingsløsning. Kontroller at betalingen er bekreftet i løsningen før du sender eller overleverer verket.",
          "Hold annonsen oppdatert, og marker verket som solgt eller fjern det fra salg dersom det blir solgt et annet sted.",
        ],
      },
      {
        h: "Før du publiserer",
        p: [
          "Se gjennom annonsen med kjøperens øyne: Viser bildene verket slik det faktisk er? Er mål, tilstand, pris og levering tydelig beskrevet? Jo bedre informasjon du gir, desto enklere blir det å ta et godt valg.",
          "Trenger du hjelp med annonsen, pakking eller levering? Kontakt oss på post@diargio.com, så hjelper vi deg videre.",
          "Hos Diargio er det plass til både ditt første verk og ditt neste kapittel som kunstner.",
        ],
      },
    ],
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
};

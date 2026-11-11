export type InfoSection = { h: string; p: string[] };
export type InfoPage = { title: string; lead: string; description?: string; intro?: string[]; sections: InfoSection[]; outro?: string; cta?: { label: string; to: "/selg" | "/kunst" }; template?: { h: string; lines: string[] }; sources?: { label: string; href: string }[] };

export const infoPages: Record<string, InfoPage> = {
  "om-oss": {
    title: "Om oss",
    lead: "Velkommen til et kunstunivers hvor alle har sin plass.",
    description: "Diargio AS er markedsplassen der kunstnere, gallerier og private selgere kan vise frem og selge kunst.",
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
    description: "Slik kjøper og selger du kunst på Diargio, fra presentasjon av verket til bud, betaling og levering.",
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
          "Vi gjennomgår alle nye annonser før de publiseres, slik at opplysningene er tydelige og presentasjonen følger Diargios retningslinjer. Du får beskjed når annonsen er publisert, eller dersom vi trenger flere opplysninger.",
          "Gjennomgangen innebærer ikke en verdivurdering eller bekreftelse av verkets ekthet. Som selger er du ansvarlig for at opplysningene er riktige, og at du har rett til å selge verket.",
          "Enten du selger ditt første verk eller har skapt kunst i mange år, er du velkommen. Hos Diargio har alle sin plass.",
        ],
      },
    ],
    cta: { label: "Utforsk kunst", to: "/kunst" },
  },
  "trygg-kunsthandel": {
    title: "Trygg kunsthandel",
    lead: "Vi vil at både kjøper og selger skal føle seg trygge.",
    description: "Betaling gjennom Diargio, registrerte brukere og tips for trygg handel mellom kjøper og selger.",
    sections: [
      { h: "Sikker betaling", p: ["Betaling skal gå gjennom Diargio med Stripe, slik at pengene ikke utveksles direkte mellom partene. Betalingsløsningen kobles på snart."] },
      { h: "Ekte brukere", p: ["Alle annonser kommer fra registrerte brukere. Kun de som har kjøpt av en selger kan skrive omtale."] },
      { h: "Tips", p: ["Hold kommunikasjon og betaling inne på Diargio, og kontakt oss på post@diargio.com ved mistanke om svindel."] },
    ],
  },
  "betaling-og-levering": {
    title: "Betaling og levering",
    lead: "Slik fungerer betaling og frakt.",
    description: "Betaling gjennom Diargio og levering som kjøper og selger avtaler, med sending eller henting.",
    sections: [
      { h: "Betaling", p: ["Betaling skal skje trygt gjennom Diargio. Kortbetaling via Stripe er under oppkobling."] },
      { h: "Levering", p: ["Selger oppgir om verket kan sendes eller må hentes. Ved forsendelse avtaler partene transport, for eksempel med Posten eller Bring, og bør velge forsikring.", "For verdifull kunst anbefaler vi spesialisert kunsttransport."] },
    ],
  },
  "priser-og-gebyrer": {
    title: "Priser og gebyrer",
    lead: "En oversikt over kostnadene når du kjøper eller selger kunst gjennom Diargio.",
    sections: [
      {
        h: "Provisjon ved salg",
        p: [
          "Diargios provisjon er 20 % av verkets avtalte salgspris ved gjennomført salg. Provisjonen trekkes fra selgerens oppgjør via Stripe.",
          "Provisjonen beregnes av salgsprisen før kunstavgift, frakt og eventuell transportforsikring.",
        ],
      },
      {
        h: "Kunstavgift",
        p: [
          "Ved salg av kunstverk som omfattes av kunstavgiftsordningen, med en salgspris over 2 000 kr, legges det normalt til 5 % kunstavgift. Avgiften beregnes av hele salgsprisen og betales av kjøperen i tillegg til denne.",
          "Kunstavgiften er en lovpålagt avgift som går til kunstnere og rettighetshavere gjennom kunstavgiftsordningen. Den er ikke en del av Diargios provisjon. Ved enkelte videresalg med høy salgssum kan andre satser gjelde.",
        ],
      },
      {
        h: "Frakt og eventuell forsikring",
        p: [
          "Frakt og eventuell transportforsikring kommer i tillegg. Kostnaden avhenger av verkets størrelse, vekt, verdi og valgt leveringsmåte.",
          "Kjøper og selger avtaler sending med Posten/Bring der det passer, henting, personlig overlevering eller annen egnet transport. Leveringsmåte og kostnader avklares før handelen fullføres.",
        ],
      },
      {
        h: "Se hva du betaler og får utbetalt",
        p: [
          "Bruk prisberegneren på Diargio for å få oversikt over salgspris, provisjon, eventuell kunstavgift og beregnet utbetaling. Ta også høyde for avtalt frakt og eventuell forsikring.",
          "Har du spørsmål om priser, gebyrer eller levering? Kontakt oss på post@diargio.com, så hjelper vi deg.",
        ],
      },
    ],
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
  "ofte-stilte-sporsmal": {
    title: "Ofte stilte spørsmål",
    lead: "Svar på det mange lurer på.",
    description: "Svar om å legge ut kunst, gi bud, endre annonser og skrive omtale på Diargio.",
    sections: [
      { h: "Koster det noe å legge ut kunst?", p: ["Nei. Provisjon og eventuell kunstavgift er inkludert i annonseprisen og gjelder når verket selges."] },
      { h: "Hvordan gir jeg bud?", p: ["Åpne annonsen og trykk «Gi bud». Selger får varsel og kan godkjenne eller avslå."] },
      { h: "Kan jeg endre eller slette annonsen min?", p: ["Ja, under «Min side → Mine annonser»."] },
      { h: "Hvem kan skrive omtale?", p: ["Kun de som har kjøpt kunst av selgeren."] },
    ],
  },
  "for-kunstnere": {
    title: "For kunstnere",
    lead: "Gi kunsten din en plass – og muligheten til å finne et nytt hjem.",
    intro: [
      "Diargio er for deg som skaper. Enten du lever av kunsten, utforsker et nytt uttrykk eller ønsker å selge ditt aller første verk, er du velkommen. Her kan du vise frem malerier, skulpturer og andre kunstverk og komme i kontakt med mennesker som setter pris på det du lager.",
    ],
    sections: [
      {
        h: "Vis frem det du skaper",
        p: [
          "Presenter verkene dine med gode bilder, tydelige opplysninger og noen ord om historien bak. Fortell gjerne om inspirasjonen, materialene og arbeidsprosessen. Det gir kjøperen mulighet til å bli kjent med både kunsten og deg som står bak.",
          "Oppgi størrelse, eventuell vekt, teknikk og pris, og vær tydelig på om verket er unikt eller del av et opplag. Du trenger ikke ha en lang merittliste – en ærlig og gjennomtenkt presentasjon er et godt utgangspunkt.",
        ],
      },
      {
        h: "Ha direkte kontakt med kjøperen",
        p: [
          "På Diargio kan interesserte stille spørsmål, kjøpe direkte eller gi bud. Du følger opp henvendelser gjennom meldingstjenesten og bestemmer selv hvilke bud du vil godta.",
          "Bruk prisberegneren for å få oversikt over utbetaling, provisjon og eventuelle avgifter før du publiserer.",
        ],
      },
      {
        h: "Avtal en god levering",
        p: [
          "Betalingen håndteres gjennom Stripe i Diargios betalingsløsning. Levering avtales med kjøperen: Posten/Bring der det passer, eller henting, personlig overlevering eller annen egnet transport.",
          "Du sørger for forsvarlig emballasje som beskytter verket underveis. Trenger du veiledning om pakking eller levering, hjelper vi deg gjerne.",
        ],
      },
      {
        h: "Kom i gang",
        p: [
          "Opprett en bruker, legg til ditt første verk og fortell historien bak. Se vår «Guide til å selge kunst» for praktiske råd om bilder, beskrivelse og pris.",
        ],
      },
    ],
    outro: "Hos Diargio er det plass til både nye uttrykk og lang erfaring.",
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
  "for-gallerier": {
    title: "For gallerier",
    lead: "Gjør kunsten, kunstnerne og galleriet deres synlig for flere.",
    intro: [
      "Diargio gir gallerier en ekstra arena for å presentere kunst og komme i kontakt med interesserte kjøpere. Vis frem et utvalg fra galleriet, fortell om kunstnerne dere representerer, og skap interesse for både verkene og opplevelsene rundt dem.",
    ],
    sections: [
      {
        h: "Presenter kunsten med galleriets faglige blikk",
        p: [
          "En god presentasjon gir kjøperen mer enn et bilde. Del kunstnerens bakgrunn, sett verkene i sammenheng og fortell om teknikk, materialer og kunstnerisk uttrykk.",
          "Bruk gode fotografier og presise opplysninger om mål, tilstand, signatur, opplag og eventuell dokumentasjon. Hold utvalget oppdatert når verk selges eller ikke lenger er tilgjengelige.",
        ],
      },
      {
        h: "Bygg kontakt med interesserte kjøpere",
        p: [
          "Bruk meldingstjenesten til å svare på spørsmål, følge opp bud og gi kjøperen den informasjonen som trengs for å ta et godt valg. Ved behov kan dere avtale en nærmere visning i galleriet.",
          "Betalingen håndteres gjennom Stripe i Diargios betalingsløsning. Frakt, henting eller annen overlevering avtales med kjøperen, tilpasset verkets størrelse, verdi og behov for beskyttelse.",
        ],
      },
      {
        h: "Skap interesse for kunstkvelder og arrangementer",
        p: [
          "Gallerier vil også få mulighet til å annonsere kommende kunstkvelder, utstillinger, eventer og andre arrangementer på Diargios nettside.",
          "Presenter programmet med en innbydende beskrivelse, relevante bilder og tydelig informasjon om tid, sted og eventuell påmelding. Slik kan den digitale presentasjonen bli en invitasjon til å oppleve kunsten og møte menneskene bak.",
        ],
      },
      {
        h: "Kom i gang",
        p: [
          "Opprett en bruker og presenter et utvalg av galleriets verk. Ønsker dere mer informasjon om arrangementsannonsering eller hjelp til å komme i gang, kontakt oss på post@diargio.com.",
        ],
      },
    ],
    outro: "La flere oppdage galleriet deres – og kunsten dere brenner for.",
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
  "for-private-selgere": {
    title: "For private selgere",
    lead: "La kunst du har hatt glede av, finne et nytt hjem.",
    intro: [
      "Har du et maleri, en skulptur eller et annet kunstverk du ønsker å selge? På Diargio kan privatpersoner presentere kunst de eier og komme i kontakt med interesserte kjøpere. Enten du gjør plass til noe nytt eller ønsker å selge et verk du har arvet, hjelper en god presentasjon kunsten videre.",
    ],
    sections: [
      {
        h: "Presenter verket og historien",
        p: [
          "Legg ut tydelige bilder av hele verket, detaljer, signatur og eventuell ramme. Oppgi kunstner, teknikk, mål og årstall dersom du kjenner til dette.",
          "Beskriv tilstanden ærlig, og vis eventuell slitasje, skader eller tidligere reparasjoner. Fortell gjerne hvor og når verket ble kjøpt, og om kvittering, ekthetsbevis eller annen dokumentasjon følger med. Er noe ukjent, skriver du det tydelig.",
        ],
      },
      {
        h: "Sett en gjennomtenkt pris",
        p: [
          "Ta utgangspunkt i det du vet om verket, tilstanden og relevante tidligere salg. Husk at priser i andre annonser ikke nødvendigvis viser hva verkene faktisk blir solgt for.",
          "Bruk prisberegneren for å få oversikt over utbetaling, provisjon og eventuelle avgifter. Du kan svare på spørsmål gjennom meldingstjenesten og velger selv hvilke bud du vil godta.",
        ],
      },
      {
        h: "Avtal en god levering",
        p: [
          "Betalingen håndteres gjennom Stripe i Diargios betalingsløsning. Sammen med kjøperen avtaler du sending med Posten/Bring der det passer, henting eller annen egnet transport.",
          "Som selger sørger du for forsvarlig emballasje. Ta gjerne bilder av verket og innpakkingen før sending, og avklar leveringsmåte og kostnader før handelen fullføres.",
        ],
      },
      {
        h: "Kom i gang",
        p: [
          "Opprett en bruker og legg ut verket med bilder, beskrivelse og pris. Se vår «Guide til å selge kunst» for hjelp med presentasjonen, eller kontakt oss på post@diargio.com hvis du trenger veiledning.",
        ],
      },
    ],
    outro: "Et verk som har vært en del av din historie, kan bli starten på en annens.",
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
        ],
      },
      {
        h: "Annonsen sendes til gjennomgang",
        p: [
          "Vi gjennomgår alle nye annonser før de publiseres, slik at opplysningene er tydelige og presentasjonen følger Diargios retningslinjer. Du får beskjed når annonsen er publisert, eller dersom vi trenger flere opplysninger.",
          "Gjennomgangen innebærer ikke en verdivurdering eller bekreftelse av verkets ekthet. Som selger er du ansvarlig for at opplysningene er riktige, og at du har rett til å selge verket.",
          "Trenger du hjelp med annonsen, pakking eller levering? Kontakt oss på post@diargio.com, så hjelper vi deg videre.",
          "Hos Diargio er det plass til både ditt første verk og ditt neste kapittel som kunstner.",
        ],
      },
    ],
    cta: { label: "Legg ut kunst", to: "/selg" },
  },
  kjopsvilkaar: {
    title: "Kjøpsvilkår",
    lead: "Kjøpsvilkår og rettigheter ved kjøp av kunst.",
    description:
      "Kjøpsvilkår for Diargio: hvem du handler med, hva annonsen dekker, bud og avtale, pris og levering, hva som gjelder hvis verket ikke er som avtalt, og angrerett ved kjøp fra privatperson eller næringsdrivende.",
    sections: [
      {
        h: "Hvem du handler med",
        p: [
          "Diargio er en markedsplass som formidler kontakt mellom kjøpere og selgere av kunst. Selgeren som er oppgitt i annonsen, er avtalepart for kjøpet, med mindre det uttrykkelig står at Diargio AS er selger.",
          "Før kjøpet skal det fremgå om selgeren opptrer som privatperson eller næringsdrivende. Dette er viktig fordi angrerett og andre rettigheter avhenger av hvem du handler med.",
          "Diargio AS",
          "Org.nr. 938 724 148",
          "E-post: post@diargio.com",
          "Postadresse: Magnus Lagabøters veg 8, 7047 Trondheim",
        ],
      },
      {
        h: "Om verket og annonsen",
        p: [
          "Kunstverk kan være brukt, ha tegn på alder eller ha andre forhold som påvirker tilstanden. Les annonsen nøye, og spør selgeren om det du lurer på før kjøpet.",
          "Annonsen bør beskrive verkets kunstner, teknikk, mål, tilstand og eventuell dokumentasjon så godt selger kjenner til dette. Eventuelle skader, slitasje, reparasjoner eller usikkerhet rundt opphav og dokumentasjon bør oppgis tydelig.",
          "Selger er ansvarlig for at opplysningene i annonsen og dialogen med kjøper er riktige. Bilder kan gjengi farger noe annerledes enn verket ser ut i virkeligheten.",
        ],
      },
      {
        h: "Bud og avtale",
        p: [
          "Et bud er et tilbud til selgeren. Selgeren kan godta eller avslå budet. Når selger godtar budet, eller kjøper bekrefter et kjøp til oppgitt pris, inngås en bindende avtale mellom kjøper og selger.",
          "Annonsen og meldingene mellom partene inngår i avtalegrunnlaget. Ta vare på dem til handelen er fullført.",
        ],
      },
      {
        h: "Pris, avgifter og levering",
        p: [
          "Prisen som vises i annonsen, er det samlede kjøpesummen for deg som kjøper. Den inkluderer Diargios provisjon og eventuell kunstavgift, og provisjonen trekkes derfor fra selgerens oppgjør i stedet for å komme som et eget gebyr til kjøper. Kunstavgift kommer i tillegg for verk over 2 000 kr.",
          "Eventuell kunstavgift, frakt og transportforsikring skal opplyses før kjøpet bekreftes.",
          "Kjøper og selger avtaler om verket skal sendes, hentes eller overleveres personlig. De skal også avklare fraktkostnad og eventuell forsikring før handelen fullføres. Ved sending bør verket pakkes forsvarlig og sendes sporbart. For verdifulle eller skjøre verk bør partene vurdere transportforsikring eller spesialisert kunsttransport.",
        ],
      },
      {
        h: "Hvis verket ikke er som avtalt",
        p: [
          "Hvis verket avviker fra annonsen eller avtalen, bør kjøper først kontakte selger skriftlig og forklare hva avviket gjelder. Legg gjerne ved bilder. Kjøper kan også kontakte Diargio på post@diargio.com for hjelp med å komme i kontakt med selgeren.",
          "Mulig løsning avhenger av hva som er avtalt, hvor stort avviket er, og om selger er privatperson eller næringsdrivende. Partene kan for eksempel bli enige om et passende prisavslag eller en retur. For et unikt kunstverk er det ikke alltid mulig å bytte det mot et tilsvarende verk. Heving av kjøpet kan være aktuelt dersom vilkårene i loven er oppfylt.",
          "Hvis kjøper og selger avtaler en frivillig retur, bør de skriftlig avklare hvem som betaler returfrakten og hvordan verket skal sendes. Lovfestede rettigheter gjelder uansett og begrenses ikke av disse vilkårene.",
        ],
      },
      {
        h: "Angrerett",
        p: [
          "Kjøp fra privatperson: Lovbestemt angrerett gjelder normalt ikke ved kjøp fra en privat selger. Kjøper kan derfor ikke returnere verket bare fordi kjøper ombestemmer seg, ikke liker det hjemme eller forventet at det skulle se annerledes ut, når annonsen beskrev det korrekt. Kjøper og selger kan likevel avtale retur eller åpent kjøp. Forbrukerrådet bekrefter at kjøpsloven regulerer kjøp mellom privatpersoner, og at slike nettkjøp normalt ikke gir angrerett.",
          "Kjøp fra næringsdrivende: Når en forbruker kjøper på nett fra en næringsdrivende, gjelder som hovedregel 14 dagers angrerett. Fristen regnes vanligvis fra dagen etter at kjøper mottar verket. Kjøper må gi selger tydelig beskjed innen fristen og returnere verket innen 14 dager etter at beskjed er gitt. Kjøper kan måtte betale returfrakten dersom dette ble opplyst før kjøpet. Loven har enkelte unntak, blant annet for varer som er laget spesielt etter kjøperens ønsker.",
          "Send melding om angrerett til selger via kontaktinformasjonen i kjøpsbekreftelsen eller Diargios meldingsfunksjon. Du kan også sende kopi til post@diargio.com.",
        ],
      },
    ],
    template: {
      h: "Slik kan du melde fra om angrerett",
      lines: [
        "Jeg gir beskjed om at jeg ønsker å benytte angreretten for kjøpet av [verkets navn].",
        "Bestilt: [dato]",
        "Mottatt: [dato]",
        "Navn: [navn]",
        "Adresse: [adresse]",
        "Dato: [dato]",
      ],
    },
    sources: [
      { label: "Forbrukerrådet", href: "https://www.forbrukerradet.no" },
      { label: "Forbrukertilsynet", href: "https://www.forbrukertilsynet.no" },
    ],
  },
};

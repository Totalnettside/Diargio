# Annonsegodkjenning – kontroll

## Implementert
- Eksisterende annonser beholdes publisert; nye annonser starter upublisert.
- Utkast, forhåndsvisning, innsending, eieroversikt og privat dokumentasjon.
- Administratorkø med teller, søk, filtre, bilder, opplysninger og beslutninger.
- Eier-/administratorbegrensede lesinger, rolleautoriserte og låste beslutninger, blokkering av direkte skriverettigheter, bud og reservasjoner for upubliserte verk.
- Separat sist godkjent offentlig versjon; innholdsendringer får ny gjennomgang. Pris og levering oppdateres separat.
- Historikk med aktør, tidspunkt, versjon og øyeblikksbilde. Interne notater er administratorbeskyttet.
- Plattformvarsler og hendelsesbaserte e-poster med bekreftet sendestatus, feilstatus og manuell retry med samme idempotensnøkkel.

## Kontrollert
- 34 tester bestått; siste automatiske bygg uten feil.
- Innlogget eier/admin: ekte eksisterende verk «G» sendt inn, endringer bedt om, sendt inn på nytt og godkjent; status lest tilbake i Min side.
- Fire e-postvarsler bekreftet sendt av e-posttjenesten, både til administrasjon og selger. Dette bekrefter akseptert utsending, ikke mottak i innboksen.
- Upublisert kontrollkopi av eget eksisterende verk: skjult i offentlig lesing og direkte lenke, ingen offentlig tilgang til versjoner, bud avvist.
- Direkte publiseringsskriving avvist, innsendt innhold låst, begrunnelse påkrevd, avslag lagret, dobbeltvedtak avvist og tilbaketrukket versjon kan ikke publiseres.
- Kontrollkopien og tilhørende kontrollhistorikk fjernet etter testen; ekte annonser beholdt.
- Administratorkø kontrollert på 1280 px og 390 px uten sideveis overflyt eller nettleserfeil.

## Gjenstår å bekrefte
- Full ende-til-ende-kontroll med en separat vanlig selgerkonto: verktøytilgangen tillater bare innlogging som forespørrende bruker, som allerede er administrator. Ingen andre kontoer eller roller er endret.
- Vedleggsopplasting, faktisk bud/kasse fra en annen innlogget kjøper, og samtidig behandling fra to administratorkontoer er ikke nettlesertestet. Rettighetene og låsene er implementert i databasen.
- Tidligere blokkere for ekte Stripe-betaling og kunstnerutbetaling er uendret.

## Manuell prøve
1. Logg inn som vanlig selger, legg inn eget ekte verk, lagre utkast og last opp eventuell dokumentasjon fra redigeringen.
2. Forhåndsvis og send inn. Kontroller status «Til godkjenning» på Min side.
3. Åpne direkte lenke utlogget og som en annen bruker: annonsen skal ikke vises.
4. Administrator åpner Kontrollsenter → Annonser til godkjenning og ber om endringer med begrunnelse.
5. Selger leser beskjed, redigerer og sender inn på nytt. Administrator godkjenner eller avslår med begrunnelse.
6. Kontroller varsler, e-poststatus og at interne notater ikke vises for selger.
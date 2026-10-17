# Sikker kunsthandel og komplette kontoflyter

## Avklart omfang

- Kunstkjøp først. Galleriplasser forblir gratis forhåndsvisning; ingen abonnement eller automatisk fornyelse innføres.
- Selger oppgir fraktbeløp før betaling. Kjøper betaler annonsens eksisterende totalpris og frakt én gang.
- Kjøpers mottaksbekreftelse kreves før selgeroppgjør. Ved tvist eller manglende bekreftelse avgjør admin; ingen automatisk tidsfrist.
- BankID integreres senere, ikke nå. Vipps skal ikke kunne brukes.
- Moms og mottaker av kunstavgiften er ikke avklart. Ekte betalinger holdes stengt til dette og Stripe-oppgjøret er avklart; testkjøp skilles fra ekte salg.

## Funn som rettes

1. Kjøpsknappen kan registrere salg uten betaling. Kasse og betalingsbekreftelse mangler selv om Stripe-testmiljøet er tilkoblet.
2. Tilgangsregler tillater manipulering av verifisering, meldingsinnhold og samtaledeltakere; private profilfelt kan leses offentlig.
3. Glemt passord og sikker endring av e-post/passord mangler. Flere kontosider viser seg uten innlogging.
4. Salg kan ikke reserveres sikkert, historiske beløp mangler, og kontosletting kan fjerne handelshistorikk.
5. Publisering og enkelte kontooppdateringer viser for lite feilhåndtering. Favoritter/lagrede søk er ikke kontoavhengige; flere tall og varslingsløfter er ikke reelle.
6. Frakt, ordreoversikt, mottak, tvister, refusjoner og selleroppgjør mangler. Aksepterte bud har ingen betalingskobling. Auksjoner mangler oppgjørsregler.

## Gjennomføring

### 1. Steng falske salg og sikre kontoer

- Fjern simulert betaling og kjøpsregistrering fra nettleseren. Ingen handling får vise «betalt» eller «fullført» uten bekreftet betaling.
- Begrens verifiseringsfelt til betrodde handlinger; fjern gjenværende Vipps-innlogging og feilaktige BankID-påstander.
- Skill offentlig kunstnerinformasjon fra private kontoopplysninger. Behold fungerende eier- og adminvisning.
- Lås samtaledeltakere og meldingsinnhold etter oppretting; mottaker får bare endre lesestatus.
- Rett innloggingsbeskyttelse og retur til ønsket side. Legg til glemt-passord, tilbakestilling, passordendring og bekreftet e-postendring uten å overstyre ukjente kontoinnstillinger.
- Gjør adminoppdateringer og konto-/bildeendringer etterprøvbare med korrekt feilhåndtering. Ikke gjeninnfør selvbetjent kontosletting, tidligere fjernet etter ønske.

### 2. Gjør annonser og priser autoritative

- Lagre og validere kunstverkets eier, tilgjengelighet, prisgrunnlag og frakt på tjenersiden. Avvent vellykket lagring før navigasjon og suksessmelding.
- Behold dagens prisregel: 20 % av ønsket utbetaling, samt 5 % av beløpet inkludert provisjon bare når ønsket utbetaling overstiger 2 000 kr.
- Lagre prisdelene én gang ved ordreoppretting; ikke rekonstruer eller legg på gebyrer i kassen. Bruk hele øre internt.
- Gi aksepterte bud en kjøperautorisert betalingsvei med tydelig total og ingen dobbeltgebyrer. Uavklarte auksjoner/prisforespørsler får ikke ordinær fastpriskasse.
- Vis solgt/utilgjengelig status likt på kort, annonseside, kasse og utstilling. Investorverk forblir utenfor handel.

### 3. Bygg Stripe-kasse og verifisert testkjøp

- Monter Stripes innebygde betalingsside i Diargio gjennom Lovables eksisterende Stripe-tilkobling; ingen eget kortskjema eller ekstern betalingsomdirigering.
- Vis testvarsel og tydelig konfigurasjonsfeil ved manglende betalingsoppsett.
- Opprett kunde knyttet til innlogget bruker og en lagret ordre. Reserver kunstverket atomisk; hindre egenkjøp, dobbeltkjøp og manipulert pris.
- Bekreft betaling gjennom signerte betalingshendelser og autorisert statusoppslag. Håndter avslag, ekstra kortbekreftelse, avbrudd, forsinket betaling og gjentatte hendelser.
- Gi kjøper og selger ordreoversikt, kvittering/bekreftelse og varige betalingsstatuser. Testkjøp må ikke skjule ekte annonser eller telle som ekte inntekter.

### 4. Levering, refusjon og oppgjør

- Selger registrerer sending/henting; kjøper bekrefter mottak eller åpner tvist. Admin behandler uavklarte saker med sporbar begrunnelse.
- Bygg refusjonsbehandling med faktisk Stripe-resultat, ikke bare lokal statusendring.
- Kontroller om eksisterende Stripe-oppsett støtter nødvendige kunstnerkontoer, overføringer og oppbevarings-/utbetalingsinnstillinger. Sett opp støttede onboarding- og kapabilitetssjekker før selgeroverføring.
- Utbetaling kan ikke skje før godkjenning og klar kunstnerkonto. Hvis betalingsleverandøren eller kontooppsettet ikke støtter dette, blokker utbetaling/ekte kasse og rapporter den konkrete avhengigheten; ikke fall tilbake til umiddelbar utbetaling.
- Oppgjøret beskrives som utsatt overføring, ikke juridisk escrow. Moms, kunstavgiftsmottaker og nødvendig regnskapsmessig behandling må avklares før lansering.

### 5. Kontooversikt og drift

- Bevar uforanderlige salgs-/betalingsopplysninger når kontoer eller annonser slettes/endres. Gjør sletting kontrollert og rydd privat lagring uten å fjerne andre parters nødvendige historikk.
- Gjør favoritter, samlinger og lagrede søk kontoavhengige og varige; samordne følgeroversikten med faktisk lagrede følgerdata.
- Erstatt oppdiktede statistikker med målte hendelser eller ærlige tomtilstander. Ikke lov søkevarsler på e-post uten implementert levering.
- Rett adminøkonomi til faktiske bekreftede beløp; skill provisjon, kunstavgift, selgerkrav, frakt, moms og betalingskostnader. Unngå beregning av historikk fra dagens annonsepris.
- Behold galleriplasser som forhåndsvisning. Booking, kalender, betalt aktivering/utløp og gallerirefusjoner dokumenteres som senere funksjoner, ikke ferdige kjøp.

## Teknisk gjennomføring

- TanStack Start-serverfunksjoner med eksisterende bearer-mellomlag og tjenersideautorisering; eksterne Stripe-hendelser på `/api/public/payments/webhook` med signaturkontroll.
- Lovable Cloud-migreringer med eksplisitte rettigheter og eieravgrenset tilgang. Beskytt finansielle felt mot klientskriving.
- Separate miljøavgrensede ordre-, reservasjon-, hendelse- og oppgjørsposter med unike betalingsnøkler, transaksjonelle overganger og lagrede prisøyeblikksbilder.
- Stripe SDK via felles gatewayverktøy og festede versjoner. Avstem eksisterende webhook-versjon med behandlingen; håndter duplikater og hendelser i ulik rekkefølge.
- Bevar eksisterende design, logo, bildevisning og prisregler. Ingen nye demobrukere eller salgsannonser.
- Dokumenter strukturelle regler og vedlikehold oppgavelisten; dokumenter konkrete eksterne blokkeringer fremfor å markere dem ferdige.

## Verifisering og din test i forhåndsvisningen

- Automatiske tester: 2 000-kronersgrensen, konkret prisoppdeling, frakt uten dobbeltgebyrer, eierskap, prismanipulasjon, melding-/profilmanipulasjon, samtidige kjøpere, gjentatte/forsinkede betalingshendelser, refusjon og historikkbevaring.
- Test hele kjøpsflyten med en faktisk kjøperkonto og en annen faktisk selgerkonto, samt et avtalt virkelig kunstverk. Ingen ekte betaling eller automatisk utbetaling i testmiljøet.
- Kontroller lagring ved å laste siden på nytt og lese resultatet tilbake i profil, ordre og adminoversikt.
- **Vellykket kort:** `4242 4242 4242 4242`, framtidig utløp som `12/30`, valgfri tresifret CVC. Bruk aldri et ekte kort i forhåndsvisningen.
- **Avslag:** `4000 0000 0000 0002`; ingen betalt ordre, kvittering eller salgsrettighet.
- **Ekstra kortbekreftelse:** `4000 0025 0000 3155`.
- Test avbrudd, nytt forsøk og sideoppdatering: høyst én belastning/oppgjørsføring; ubetalte reservasjoner frigjøres.
- Test kontoendring, passordgjenoppretting, ikke-admin-tilgang, mottak og tvist. Rapporter hva som faktisk ble kontrollert og hva som krever eierens aktivering/avklaring.

## Før ekte betalinger

Eierne fullfører Stripe-aktivering i Betalinger. Moms/kunstavgift og utsatt kunstneroppgjør må være avklart. Stripe kan beregne/kreve inn relevant avgift, men fysisk kunst kvalifiserer ikke for full digitalprodukt-avgiftshåndtering; Diargio må avklare melding/innbetaling. Automatisk avgiftsberegning har en tilleggskostnad på 0,5 % når den brukes. Ingen publisering utføres automatisk.
# Sletting og dialoger – kontroll 10. november 2026

## Årsak og retting
- Tidligere «sletting» kalte kun `withdrawn`; annonsen ble værende i Mine annonser uten suksessbekreftelse. Det var ingen egen arkivmarkør eller separat slettehandling. Redigeringssiden fjernet bilder kun lokalt frem til senere lagring.
- Eierskap og godkjenning hindrer direkte skriving/sletting; ny låst RPC arkiverer med `deleted_at`, bevarer filer og referanser, og blokkerer pågående ordre/aksepterte bud. Trekking er en separat handling.
- Testen viste også at admin som sletter egen annonse ble avvist av kravet om administrativ begrunnelse; eierhandlinger er nå unntatt dette kravet, andre administrative slettinger krever begrunnelse.
- Alle nettstedets browser alert/confirm/prompt er erstattet. Dialoger låser gjentatte innsendinger og viser trygge feil, ikke rå databasefeil.

## Bekreftet
- Innlogget eier/admin i Chromium: avbryt uten endring, slett kontrollannonse, retur til Mine annonser og bekreftelse etter lagring.
- Fjern hovedbilde fra kontrollutkast, nytt hovedbilde valgt, siste bilde stoppet, arkivering og gammel direktelenke viser «Fant ikke annonsen».
- Dialogen kontrollert visuelt ved 1280 px og 390 × 844 px; ingen registrerte sidefeil. Adminhistorikk åpnet gjennom kontrollsenteret.
- Tilbakerullede databasetester: vanlig eier kan slette eget innhold, annen bruker avvises; aktiv testordre stopper sletting; admin kan avpublisere mens ordre og snapshot bevares; profilsperring stopper nye meldinger og kan oppheves.
- 31 relevante automatiske tester bestod. Ingen native nettleserdialoger igjen. Siste automatisk kontroll: build OK.
- Alle tre midlertidige utkast og deres kontrollhistorikk er fjernet. Ingen ekte annonser slettet eller endret under nettleserkontrollen.

## Avgrensninger
- Ikke kjørt på fysisk iPhone/Safari. Full nettleserflyt med separat vanlig bruker/adminkonto, profilens permanente sletting og ekte oppgjør er ikke testet; rettighetskontrollene for vanlig/annen bruker ble kjørt i tilbake­rullede databasetransaksjoner.
- Adminredigering tilbyr tittel/profilnavn og bilde­fjerning; et komplett skjema for alle annonse- og profilfelter gjenstår.
- Begrunnelser til selger kan leses i varsler; interne notater og snapshots vises kun til administrator. Et separat felt for interne notater ved hver ny handling gjenstår (RPC støtter allerede notat).
- Permanent profil-/filsletting er blokkert når annonser, bud, samtaler, betalingskonto eller handel krever bevaring. Separat personvernbehandling og filopprydding er ikke automatisert.
- Nye/endrede bilder lagres som ny versjon, og den eksisterende offentlige godkjente versjonen beholdes inntil gjennomgang. Filer fjernes ikke permanent ved vanlig bildesletting.
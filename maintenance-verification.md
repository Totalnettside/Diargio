# Venteside og vedlikeholdsmodus

- Bildet er lagret som varig ressurs og vises i sin helhet uten menyer på mobil og PC.
- Vedlikeholdsmodus er aktivert gjennom den eksisterende administratorens innloggede kontrollsenter etter uttrykkelig godkjenning. Handelsstansen gjelder også publisert nettsted fordi databasen er felles; visuell venteside er ikke publisert.
- Slå av under `/diargioadmin007` → Innstillinger → Vedlikeholdsmodus. Innlogging er fortsatt tilgjengelig via `/auth?next=/diargioadmin007`.
- Administratoradgang verifiseres på serveren mot eksisterende rolle. URL og nettleserverdier gir ikke administratorrettigheter.
- Kontrollerte forsiden, kunstoversikten og direkte konto-/adminlenker utlogget: venteside uten knapper eller lenker. Kontrollert 1280 × 1800 og 390 × 844, uten horisontal rulling.
- Eksisterende administratorkonto kunne åpne innstillinger og aktivere modusen. Innloggingsskjemaet er tilgjengelig; ny innlogging med passord/OAuth ble ikke gjennomført.
- Uautorisert forsøk på å deaktivere modusen ble avvist. Vanlig/ukjent bruker-ID har ingen handelsadgang.
- Migrasjonens transaksjonelle kontroll bekreftet at nye bud, ordre og annonser avvises før innsetting. Ingen testdata ble lagret.
- Filopplastinger og erstatninger har restriktive tilgangsregler; faktisk filopplasting fra separat vanlig konto ble ikke gjennomført.
- Eksisterende ordreoppdateringer, betalingsvarsler og refusjonskode er uendret. Betalingsendepunktet svarte 400 på usignert hendelse i stedet for venteside; 19 tilgangs-/betalings-/signaturtester bestod. Ingen ekte betaling eller signert ekstern betalingshendelse ble sendt.
- Intet domene, DNS, Stripe-oppsett, originalinnhold eller brukerdata er fjernet. Ingen automatisk publisering.
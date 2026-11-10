export function actionError(error: unknown, fallback = 'Handlingen kunne ikke gjennomføres. Prøv igjen.'): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/last_image/i.test(message)) return 'Legg til et nytt bilde før du sletter det siste, eller trekk annonsen fra salg.';
  if (/unauthorized|session|jwt|401/i.test(message)) return 'Økten din har utløpt. Logg inn på nytt.';
  if (/forbidden|permission|42501/i.test(message)) return 'Du har ikke tilgang til å endre eller slette dette innholdet.';
  if (/active order|aktiv ordre|pågående handel/i.test(message)) return 'Annonsen er knyttet til en pågående handel. Handelen må avklares før annonsen kan slettes.';
  if (/sperret/i.test(message)) return 'Profilen er sperret. Kontakt post@diargio.com for hjelp.';
  if (/allerede solgt|solgte annonser/i.test(message)) return 'Verket er allerede solgt. Historikken må bevares.';
  if (/utkast før redigering/i.test(message)) return 'Trekk den innsendte versjonen tilbake til utkast før du endrer bildene.';
  return fallback;
}
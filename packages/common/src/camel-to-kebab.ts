/**
 * A simple camel to kebab function
 */
function camelToKebab(camel: string) {
  const normalized = camel.replace(/[^a-z0-9.]*/gi, '');

  const [firstCharacter, ...rest] = normalized.split('');

  const withDashes = rest
    .map((character) => (/[A-Z]/.test(character) ? `-${character}` : character))
    .join('')
    .toLowerCase();

  return `${firstCharacter}${withDashes}`.trim().toLowerCase();
}

export default camelToKebab;

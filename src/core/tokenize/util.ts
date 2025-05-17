import type { Grammar } from '../../types';
import type LanguageRegistry from '../classes/language-registry';

export function resolve (
	languageRegistry: LanguageRegistry,
	reference: Grammar | string | null | undefined
): Grammar | undefined {
	if (typeof reference === 'string') {
		return languageRegistry.getLanguage(reference)?.grammar;
	}

	return reference ?? undefined;
}

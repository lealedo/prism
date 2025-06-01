import csharp from './csharp';
import markup from './markup';
import type { Grammar, GrammarToken, LanguageProto } from '../types';

export default {
	id: 'aspnet',
	require: csharp,
	base: markup,
	grammar ({ base }): Grammar {
		const pageDirectiveInside: Grammar = {
			'page-directive': {
				pattern:
					/<%\s*@\s*(?:Assembly|Control|Implements|Import|Master(?:Type)?|OutputCache|Page|PreviousPageType|Reference|Register)?|%>/i,
				alias: 'tag',
			},
		};

		const directive: GrammarToken = {
			pattern: /<%.*%>/,
			alias: 'tag',
			inside: {
				'directive': {
					pattern: /<%\s*?[$=%#:]{0,2}|%>/,
					alias: 'tag',
				},
				$rest: 'csharp',
			} as unknown as Grammar,
		};

		pageDirectiveInside.$rest = (base!['tag'] as GrammarToken).inside;

		return {
			'page-directive': {
				pattern: /<%\s*@.*%>/,
				alias: 'tag',
				inside: pageDirectiveInside,
			},
			'directive': directive,
			$merge: {
				'tag': {
					pattern: /<(?!%)\/?[^\s>\/]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/,
				},
			},
			$insertBefore: {
				'comment': {
					'asp-comment': {
						pattern: /<%--[\s\S]*?--%>/,
						alias: ['asp', 'comment'],
					},
				},
				'tag/attr-value/punctuation': {
					// match directives of attribute value foo="<% Bar %>"
					'directive': directive,
				} as unknown as GrammarToken,
				// script runat="server" contains csharp, not javascript
				['script' in base! ? 'script' : 'tag']: {
					'asp-script': {
						pattern: /(<script(?=.*runat=['"]?server\b)[^>]*>)[\s\S]*?(?=<\/script>)/i,
						lookbehind: true,
						alias: ['asp', 'script'],
						inside: 'csharp',
					},
				},
			},
		};
	},
} as LanguageProto<'aspnet'>;

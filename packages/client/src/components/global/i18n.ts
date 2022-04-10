import { h, defineComponent, computed } from 'vue';

export default defineComponent({
	props: {
		src: {
			type: String,
			required: true,
		},
		tag: {
			type: String,
			required: false,
			default: 'span',
		},
		class: {
			type: String,
			required: false,
			default: '',
		},
		textTag: {
			type: String,
			required: false,
			default: null,
		},
	},
	setup(props, { slots }) {
		const parsed = computed<(string | { arg: string; })[]>(() => {
			let str = props.src;
			const _parsed: (string | { arg: string; })[] = [];
			while (true) {
				const nextBracketOpen = str.indexOf('{');
				const nextBracketClose = str.indexOf('}');

				if (nextBracketOpen === -1) {
					_parsed.push(str);
					break;
				} else {
					if (nextBracketOpen > 0) _parsed.push(str.substr(0, nextBracketOpen));
					_parsed.push({
						arg: str.substring(nextBracketOpen + 1, nextBracketClose)
					});
				}

				str = str.substr(nextBracketClose + 1);
			}
			return _parsed;
		})

		return () => h(
			props.tag,
			{
				class: props.class
			},
			parsed.value.map(x => typeof x === 'string' ?
				(props.textTag ? h(props.textTag, x) : x) :
				slots[x.arg]()
			)
		);
	}
});

<template>
<transition :name="$store.state.animation ? 'zoom' : ''" appear>
	<div class="_section">
		<div class="mjndxjch _content">
			<img src="https://xn--931a.moe/assets/error.jpg" class="_ghost"/>
			<p><i class="fas fa-exclamation-triangle"></i> {{ $ts.pageLoadError }}</p>
			<p>{{ $ts.pageLoadErrorDescription }}</p>
		</div>
	</div>
</transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkButton from '@client/components/ui/button.vue';
import * as symbols from '@client/symbols';

export default defineComponent({
	components: {
		MkButton,
	},
	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.error,
				icon: 'fas fa-exclamation-triangle'
			},
		};
	},
});
</script>

<style lang="scss" scoped>
.mjndxjch {
	text-align: center;

	> p {
		margin: 0 0 8px 0;
	}

	> .button {
		margin: 0 auto;
	}

	> img {
		vertical-align: bottom;
		height: 128px;
		margin-bottom: 16px;
		border-radius: 16px;
	}
}
</style>

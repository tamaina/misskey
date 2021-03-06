<template>
<MkModal ref="modal" @click="$emit('click')" @closed="$emit('closed')">
	<div class="hrmcaedk _popup _narrow_" :style="{ width: `${width}px`, height: (height ? `min(${height}px, 100%)` : '100%') }">
		<div class="header" @contextmenu="onContextmenu">
			<button class="_button" @click="back()" v-if="history.length > 0"><i class="fas fa-chevron-left"></i></button>
			<button class="_button" style="pointer-events: none;" v-else><!-- マージンのバランスを取るためのダミー --></button>
			<span class="title">
				<XHeader :info="pageInfo" :with-back="false"/>
			</span>
			<button class="_button" @click="$refs.modal.close()"><i class="fas fa-times"></i></button>
		</div>
		<div class="body _flat_">
			<keep-alive>
				<component :is="component" v-bind="props" :ref="changePage"/>
			</keep-alive>
		</div>
	</div>
</MkModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkModal from '@client/components/ui/modal.vue';
import XHeader from '@client/ui/_common_/header.vue';
import { popout } from '@client/scripts/popout';
import copyToClipboard from '@client/scripts/copy-to-clipboard';
import { resolve } from '@client/router';
import { url } from '@client/config';
import * as symbols from '@client/symbols';
import * as os from '@client/os';

export default defineComponent({
	components: {
		MkModal,
		XHeader,
	},

	inject: {
		sideViewHook: {
			default: null
		}
	},

	provide() {
		return {
			navHook: (path) => {
				this.navigate(path);
			}
		};
	},

	props: {
		initialPath: {
			type: String,
			required: true,
		},
		initialComponent: {
			type: Object,
			required: true,
		},
		initialProps: {
			type: Object,
			required: false,
			default: () => {},
		},
	},

	emits: ['closed'],

	data() {
		return {
			width: 860,
			height: 660,
			pageInfo: null,
			path: this.initialPath,
			component: this.initialComponent,
			props: this.initialProps,
			history: [],
		};
	},

	computed: {
		url(): string {
			return url + this.path;
		},

		contextmenu() {
			return [{
				type: 'label',
				text: this.path,
			}, {
				icon: 'fas fa-expand-alt',
				text: this.$ts.showInPage,
				action: this.expand
			}, this.sideViewHook ? {
				icon: 'fas fa-columns',
				text: this.$ts.openInSideView,
				action: () => {
					this.sideViewHook(this.path);
					this.$refs.window.close();
				}
			} : undefined, {
				icon: 'fas fa-external-link-alt',
				text: this.$ts.popout,
				action: this.popout
			}, null, {
				icon: 'fas fa-external-link-alt',
				text: this.$ts.openInNewTab,
				action: () => {
					window.open(this.url, '_blank');
					this.$refs.window.close();
				}
			}, {
				icon: 'fas fa-link',
				text: this.$ts.copyLink,
				action: () => {
					copyToClipboard(this.url);
				}
			}];
		},
	},

	methods: {
		changePage(page) {
			if (page == null) return;
			if (page[symbols.PAGE_INFO]) {
				this.pageInfo = page[symbols.PAGE_INFO];
			}
		},

		navigate(path, record = true) {
			if (record) this.history.push(this.path);
			this.path = path;
			const { component, props } = resolve(path);
			this.component = component;
			this.props = props;
		},

		back() {
			this.navigate(this.history.pop(), false);
		},

		expand() {
			this.$router.push(this.path);
			this.$refs.window.close();
		},

		popout() {
			popout(this.path, this.$el);
			this.$refs.window.close();
		},

		onContextmenu(e) {
			os.contextMenu(this.contextmenu, e);
		}
	},
});
</script>

<style lang="scss" scoped>
.hrmcaedk {
	overflow: hidden;
	display: flex;
	flex-direction: column;
	contain: content;

	--root-margin: 24px;

	@media (max-width: 500px) {
		--root-margin: 16px;
	}

	> .header {
		$height: 52px;
		$height-narrow: 42px;
		display: flex;
		flex-shrink: 0;
		box-shadow: 0px 1px var(--divider);

		> button {
			height: $height;
			width: $height;

			@media (max-width: 500px) {
				height: $height-narrow;
				width: $height-narrow;
			}
		}

		> .title {
			flex: 1;
			line-height: $height;
			padding-left: 32px;
			font-weight: bold;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			pointer-events: none;

			@media (max-width: 500px) {
				line-height: $height-narrow;
				padding-left: 16px;
			}
		}

		> button + .title {
			padding-left: 0;
		}
	}

	> .body {
		overflow: auto;
		background: var(--bg);
	}
}
</style>

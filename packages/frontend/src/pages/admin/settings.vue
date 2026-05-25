<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px; --MI_SPACER-max: 32px;">
		<SearchMarker path="/admin/settings" :label="$locale.env.general" :keywords="['general', 'settings']" icon="ti ti-settings">
			<div class="_gaps_m">
				<SearchMarker v-slot="slotProps" :keywords="['information', 'meta']">
					<MkFolder :defaultOpen="true">
						<template #icon><SearchIcon><i class="ti ti-info-circle"></i></SearchIcon></template>
						<template #label><SearchLabel>{{ $locale.env.info }}</SearchLabel></template>
						<template v-if="infoForm.modified.value" #footer>
							<MkFormFooter :form="infoForm"/>
						</template>

						<div class="_gaps">
							<SearchMarker :keywords="['name']">
								<MkInput v-model="infoForm.state.name">
									<template #label><SearchLabel>{{ $locale.env.instanceName }}</SearchLabel><span v-if="infoForm.modifiedStates.name" class="_modified">{{ $locale.env.modified }}</span></template>
								</MkInput>
							</SearchMarker>

							<SearchMarker :keywords="['shortName']">
								<MkInput v-model="infoForm.state.shortName">
									<template #label><SearchLabel>{{ $locale.env._serverSettings.shortName }}</SearchLabel> ({{ $locale.env.optional }})<span v-if="infoForm.modifiedStates.shortName" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #caption><SearchText>{{ $locale.env._serverSettings.shortNameDescription }}</SearchText></template>
								</MkInput>
							</SearchMarker>

							<SearchMarker :keywords="['description']">
								<MkTextarea v-model="infoForm.state.description">
									<template #label><SearchLabel>{{ $locale.env.instanceDescription }}</SearchLabel><span v-if="infoForm.modifiedStates.description" class="_modified">{{ $locale.env.modified }}</span></template>
								</MkTextarea>
							</SearchMarker>

							<FormSplit :minWidth="300">
								<SearchMarker :keywords="['maintainer', 'name']">
									<MkInput v-model="infoForm.state.maintainerName">
										<template #label><SearchLabel>{{ $locale.env.maintainerName }}</SearchLabel><span v-if="infoForm.modifiedStates.maintainerName" class="_modified">{{ $locale.env.modified }}</span></template>
									</MkInput>
								</SearchMarker>

								<SearchMarker :keywords="['maintainer', 'email', 'contact']">
									<MkInput v-model="infoForm.state.maintainerEmail" type="email">
										<template #label><SearchLabel>{{ $locale.env.maintainerEmail }}</SearchLabel><span v-if="infoForm.modifiedStates.maintainerEmail" class="_modified">{{ $locale.env.modified }}</span></template>
										<template #prefix><i class="ti ti-mail"></i></template>
									</MkInput>
								</SearchMarker>
							</FormSplit>

							<SearchMarker :keywords="['tos', 'termsOfService']">
								<MkInput v-model="infoForm.state.tosUrl" type="url">
									<template #label><SearchLabel>{{ $locale.env.tosUrl }}</SearchLabel><span v-if="infoForm.modifiedStates.tosUrl" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #prefix><i class="ti ti-link"></i></template>
								</MkInput>
							</SearchMarker>

							<SearchMarker :keywords="['privacyPolicy']">
								<MkInput v-model="infoForm.state.privacyPolicyUrl" type="url">
									<template #label><SearchLabel>{{ $locale.env.privacyPolicyUrl }}</SearchLabel><span v-if="infoForm.modifiedStates.privacyPolicyUrl" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #prefix><i class="ti ti-link"></i></template>
								</MkInput>
							</SearchMarker>

							<SearchMarker :keywords="['inquiry', 'contact']">
								<MkInput v-model="infoForm.state.inquiryUrl" type="url">
									<template #label><SearchLabel>{{ $locale.env._serverSettings.inquiryUrl }}</SearchLabel><span v-if="infoForm.modifiedStates.inquiryUrl" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #caption><SearchText>{{ $locale.env._serverSettings.inquiryUrlDescription }}</SearchText></template>
									<template #prefix><i class="ti ti-link"></i></template>
								</MkInput>
							</SearchMarker>

							<SearchMarker :keywords="['repository', 'url']">
								<MkInput v-model="infoForm.state.repositoryUrl" type="url">
									<template #label><SearchLabel>{{ $locale.env.repositoryUrl }}</SearchLabel><span v-if="infoForm.modifiedStates.repositoryUrl" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #caption><SearchText>{{ $locale.env.repositoryUrlDescription }}</SearchText></template>
									<template #prefix><i class="ti ti-link"></i></template>
								</MkInput>
							</SearchMarker>

							<MkInfo v-if="!instance.providesTarball && !infoForm.state.repositoryUrl" warn>
								{{ $locale.env.repositoryUrlOrTarballRequired }}
							</MkInfo>

							<SearchMarker :keywords="['impressum', 'legalNotice']">
								<MkInput v-model="infoForm.state.impressumUrl" type="url">
									<template #label><SearchLabel>{{ $locale.env.impressumUrl }}</SearchLabel><span v-if="infoForm.modifiedStates.impressumUrl" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #caption><SearchText>{{ $locale.env.impressumDescription }}</SearchText></template>
									<template #prefix><i class="ti ti-link"></i></template>
								</MkInput>
							</SearchMarker>
						</div>
					</MkFolder>
				</SearchMarker>

				<SearchMarker v-slot="slotProps" :keywords="['pinned', 'users']">
					<MkFolder :defaultOpen="slotProps.isParentOfTarget">
						<template #icon><SearchIcon><i class="ti ti-user-star"></i></SearchIcon></template>
						<template #label><SearchLabel>{{ $locale.env.pinnedUsers }}</SearchLabel></template>
						<template v-if="pinnedUsersForm.modified.value" #footer>
							<MkFormFooter :form="pinnedUsersForm"/>
						</template>

						<MkTextarea v-model="pinnedUsersForm.state.pinnedUsers">
							<template #label>{{ $locale.env.pinnedUsers }}<span v-if="pinnedUsersForm.modifiedStates.pinnedUsers" class="_modified">{{ $locale.env.modified }}</span></template>
							<template #caption><SearchText>{{ $locale.env.pinnedUsersDescription }}</SearchText></template>
						</MkTextarea>
					</MkFolder>
				</SearchMarker>

				<SearchMarker v-slot="slotProps" :keywords="['serviceWorker']">
					<MkFolder :defaultOpen="slotProps.isParentOfTarget">
						<template #icon><SearchIcon><i class="ti ti-world-cog"></i></SearchIcon></template>
						<template #label><SearchLabel>ServiceWorker</SearchLabel></template>
						<template v-if="serviceWorkerForm.modified.value" #footer>
							<MkFormFooter :form="serviceWorkerForm"/>
						</template>

						<div class="_gaps">
							<SearchMarker>
								<MkSwitch v-model="serviceWorkerForm.state.enableServiceWorker">
									<template #label><SearchLabel>{{ $locale.env.enableServiceworker }}</SearchLabel><span v-if="serviceWorkerForm.modifiedStates.enableServiceWorker" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #caption><SearchText>{{ $locale.env.serviceworkerInfo }}</SearchText></template>
								</MkSwitch>
							</SearchMarker>

							<template v-if="serviceWorkerForm.state.enableServiceWorker">
								<SearchMarker>
									<MkInput v-model="serviceWorkerForm.state.swPublicKey">
										<template #label><SearchLabel>Public key</SearchLabel><span v-if="serviceWorkerForm.modifiedStates.swPublicKey" class="_modified">{{ $locale.env.modified }}</span></template>
										<template #prefix><i class="ti ti-key"></i></template>
									</MkInput>
								</SearchMarker>

								<SearchMarker>
									<MkInput v-model="serviceWorkerForm.state.swPrivateKey">
										<template #label><SearchLabel>Private key</SearchLabel><span v-if="serviceWorkerForm.modifiedStates.swPrivateKey" class="_modified">{{ $locale.env.modified }}</span></template>
										<template #prefix><i class="ti ti-key"></i></template>
									</MkInput>
								</SearchMarker>
							</template>
						</div>
					</MkFolder>
				</SearchMarker>

				<SearchMarker v-slot="slotProps" :keywords="['ads']">
					<MkFolder :defaultOpen="slotProps.isParentOfTarget">
						<template #icon><SearchIcon><i class="ti ti-ad"></i></SearchIcon></template>
						<template #label><SearchLabel>{{ $locale.env._ad.adsSettings }}</SearchLabel></template>
						<template v-if="adForm.modified.value" #footer>
							<MkFormFooter :form="adForm"/>
						</template>

						<div class="_gaps">
							<div class="_gaps_s">
								<SearchMarker>
									<MkInput v-model="adForm.state.notesPerOneAd" :min="0" type="number">
										<template #label><SearchLabel>{{ $locale.env._ad.notesPerOneAd }}</SearchLabel><span v-if="adForm.modifiedStates.notesPerOneAd" class="_modified">{{ $locale.env.modified }}</span></template>
										<template #caption>{{ $locale.env._ad.setZeroToDisable }}</template>
									</MkInput>
								</SearchMarker>

								<MkInfo v-if="adForm.state.notesPerOneAd > 0 && adForm.state.notesPerOneAd < 20" :warn="true">
									{{ $locale.env._ad.adsTooClose }}
								</MkInfo>
							</div>
						</div>
					</MkFolder>
				</SearchMarker>

				<SearchMarker v-slot="slotProps" :keywords="['url', 'preview']">
					<MkFolder :defaultOpen="slotProps.isParentOfTarget">
						<template #icon><SearchIcon><i class="ti ti-world-search"></i></SearchIcon></template>
						<template #label><SearchLabel>{{ $locale.env._urlPreviewSetting.title }}</SearchLabel></template>
						<template v-if="urlPreviewForm.modified.value" #footer>
							<MkFormFooter :form="urlPreviewForm"/>
						</template>

						<div class="_gaps">
							<SearchMarker>
								<MkSwitch v-model="urlPreviewForm.state.urlPreviewEnabled">
									<template #label><SearchLabel>{{ $locale.env._urlPreviewSetting.enable }}</SearchLabel><span v-if="urlPreviewForm.modifiedStates.urlPreviewEnabled" class="_modified">{{ $locale.env.modified }}</span></template>
								</MkSwitch>
							</SearchMarker>

							<template v-if="urlPreviewForm.state.urlPreviewEnabled">
								<SearchMarker :keywords="['allow', 'redirect']">
									<MkSwitch v-model="urlPreviewForm.state.urlPreviewAllowRedirect">
										<template #label><SearchLabel>{{ $locale.env._urlPreviewSetting.allowRedirect }}</SearchLabel><span v-if="urlPreviewForm.modifiedStates.urlPreviewAllowRedirect" class="_modified">{{ $locale.env.modified }}</span></template>
										<template #caption>{{ $locale.env._urlPreviewSetting.allowRedirectDescription }}</template>
									</MkSwitch>
								</SearchMarker>

								<SearchMarker :keywords="['contentLength']">
									<MkSwitch v-model="urlPreviewForm.state.urlPreviewRequireContentLength">
										<template #label><SearchLabel>{{ $locale.env._urlPreviewSetting.requireContentLength }}</SearchLabel><span v-if="urlPreviewForm.modifiedStates.urlPreviewRequireContentLength" class="_modified">{{ $locale.env.modified }}</span></template>
										<template #caption>{{ $locale.env._urlPreviewSetting.requireContentLengthDescription }}</template>
									</MkSwitch>
								</SearchMarker>

								<SearchMarker :keywords="['contentLength']">
									<MkInput v-model="urlPreviewForm.state.urlPreviewMaximumContentLength" type="number">
										<template #label><SearchLabel>{{ $locale.env._urlPreviewSetting.maximumContentLength }}</SearchLabel><span v-if="urlPreviewForm.modifiedStates.urlPreviewMaximumContentLength" class="_modified">{{ $locale.env.modified }}</span></template>
										<template #caption>{{ $locale.env._urlPreviewSetting.maximumContentLengthDescription }}</template>
									</MkInput>
								</SearchMarker>

								<SearchMarker :keywords="['timeout']">
									<MkInput v-model="urlPreviewForm.state.urlPreviewTimeout" type="number">
										<template #label><SearchLabel>{{ $locale.env._urlPreviewSetting.timeout }}</SearchLabel><span v-if="urlPreviewForm.modifiedStates.urlPreviewTimeout" class="_modified">{{ $locale.env.modified }}</span></template>
										<template #caption>{{ $locale.env._urlPreviewSetting.timeoutDescription }}</template>
									</MkInput>
								</SearchMarker>

								<SearchMarker :keywords="['userAgent']">
									<MkInput v-model="urlPreviewForm.state.urlPreviewUserAgent" type="text">
										<template #label><SearchLabel>{{ $locale.env._urlPreviewSetting.userAgent }}</SearchLabel><span v-if="urlPreviewForm.modifiedStates.urlPreviewUserAgent" class="_modified">{{ $locale.env.modified }}</span></template>
										<template #caption>{{ $locale.env._urlPreviewSetting.userAgentDescription }}</template>
									</MkInput>
								</SearchMarker>

								<div>
									<SearchMarker :keywords="['proxy']">
										<MkInput v-model="urlPreviewForm.state.urlPreviewSummaryProxyUrl" type="text">
											<template #label><SearchLabel>{{ $locale.env._urlPreviewSetting.summaryProxy }}</SearchLabel><span v-if="urlPreviewForm.modifiedStates.urlPreviewSummaryProxyUrl" class="_modified">{{ $locale.env.modified }}</span></template>
											<template #caption>[{{ $locale.env.notUsePleaseLeaveBlank }}] {{ $locale.env._urlPreviewSetting.summaryProxyDescription }}</template>
										</MkInput>
									</SearchMarker>

									<div :class="$style.subCaption">
										{{ $locale.env._urlPreviewSetting.summaryProxyDescription2 }}
										<ul style="padding-left: 20px; margin: 4px 0">
											<li>{{ $locale.env._urlPreviewSetting.timeout }} / key:timeout</li>
											<li>{{ $locale.env._urlPreviewSetting.maximumContentLength }} / key:contentLengthLimit</li>
											<li>{{ $locale.env._urlPreviewSetting.requireContentLength }} / key:contentLengthRequired</li>
											<li>{{ $locale.env._urlPreviewSetting.userAgent }} / key:userAgent</li>
										</ul>
									</div>
								</div>
							</template>
						</div>
					</MkFolder>
				</SearchMarker>

				<SearchMarker v-slot="slotProps" :keywords="['federation']">
					<MkFolder :defaultOpen="slotProps.isParentOfTarget">
						<template #icon><SearchIcon><i class="ti ti-planet"></i></SearchIcon></template>
						<template #label><SearchLabel>{{ $locale.env.federation }}</SearchLabel></template>
						<template v-if="federationForm.savedState.federation === 'all'" #suffix>{{ $locale.env.all }}</template>
						<template v-else-if="federationForm.savedState.federation === 'specified'" #suffix>{{ $locale.env.specifyHost }}</template>
						<template v-else-if="federationForm.savedState.federation === 'none'" #suffix>{{ $locale.env.none }}</template>
						<template v-if="federationForm.modified.value" #footer>
							<MkFormFooter :form="federationForm"/>
						</template>

						<div class="_gaps">
							<SearchMarker>
								<MkRadios
									v-model="federationForm.state.federation"
									:options="[
										{ value: 'all', label: $locale.env.all },
										{ value: 'specified', label: $locale.env.specifyHost },
										{ value: 'none', label: $locale.env.none },
									]"
								>
									<template #label><SearchLabel>{{ $locale.env.behavior }}</SearchLabel><span v-if="federationForm.modifiedStates.federation" class="_modified">{{ $locale.env.modified }}</span></template>
								</MkRadios>
							</SearchMarker>

							<SearchMarker :keywords="['hosts']">
								<MkTextarea v-if="federationForm.state.federation === 'specified'" v-model="federationForm.state.federationHosts">
									<template #label><SearchLabel>{{ $locale.env.federationAllowedHosts }}</SearchLabel><span v-if="federationForm.modifiedStates.federationHosts" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #caption>{{ $locale.env.federationAllowedHostsDescription }}</template>
								</MkTextarea>
							</SearchMarker>

							<SearchMarker :keywords="['suspended', 'software']">
								<MkFolder>
									<template #icon><i class="ti ti-list"></i></template>
									<template #label><SearchLabel>{{ $locale.env._serverSettings.deliverSuspendedSoftware }}</SearchLabel></template>
									<template #footer>
										<div class="_buttons">
											<MkButton @click="federationForm.state.deliverSuspendedSoftware.push({software: '', versionRange: ''})"><i class="ti ti-plus"></i> {{ $locale.env.add }}</MkButton>
										</div>
									</template>

									<div :class="$style.metadataRoot" class="_gaps_s">
										<MkInfo>{{ $locale.env._serverSettings.deliverSuspendedSoftwareDescription }}</MkInfo>
										<div v-for="(element, index) in federationForm.state.deliverSuspendedSoftware" :key="index" v-panel :class="$style.fieldDragItem">
											<button class="_button" :class="$style.dragItemRemove" @click="federationForm.state.deliverSuspendedSoftware.splice(index, 1)"><i class="ti ti-x"></i></button>
											<div :class="$style.dragItemForm">
												<FormSplit :minWidth="200">
													<MkInput v-model="element.software" small :placeholder="$locale.env.softwareName">
													</MkInput>
													<MkInput v-model="element.versionRange" small :placeholder="$locale.env.version">
													</MkInput>
												</FormSplit>
											</div>
										</div>
									</div>
								</MkFolder>
							</SearchMarker>

							<SearchMarker :keywords="['sign', 'get']">
								<MkSwitch v-model="federationForm.state.signToActivityPubGet">
									<template #label><SearchLabel>{{ $locale.env._serverSettings.signToActivityPubGet }}</SearchLabel><span v-if="federationForm.modifiedStates.signToActivityPubGet" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #caption><SearchText>{{ $locale.env._serverSettings.signToActivityPubGet_description }}</SearchText></template>
								</MkSwitch>
							</SearchMarker>

							<SearchMarker :keywords="['proxy', 'remote', 'files']">
								<MkSwitch v-model="federationForm.state.proxyRemoteFiles">
									<template #label><SearchLabel>{{ $locale.env._serverSettings.proxyRemoteFiles }}</SearchLabel><span v-if="federationForm.modifiedStates.proxyRemoteFiles" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #caption><SearchText>{{ $locale.env._serverSettings.proxyRemoteFiles_description }}</SearchText></template>
								</MkSwitch>
							</SearchMarker>

							<SearchMarker :keywords="['allow', 'external', 'redirect']">
								<MkSwitch v-model="federationForm.state.allowExternalApRedirect">
									<template #label><SearchLabel>{{ $locale.env._serverSettings.allowExternalApRedirect }}</SearchLabel><span v-if="federationForm.modifiedStates.allowExternalApRedirect" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #caption>
										<div><SearchText>{{ $locale.env._serverSettings.allowExternalApRedirect_description }}</SearchText></div>
										<div>{{ $locale.env.needToRestartServerToApply }}</div>
									</template>
								</MkSwitch>
							</SearchMarker>

							<SearchMarker :keywords="['cache', 'remote', 'files']">
								<MkSwitch v-model="federationForm.state.cacheRemoteFiles">
									<template #label><SearchLabel>{{ $locale.env.cacheRemoteFiles }}</SearchLabel><span v-if="federationForm.modifiedStates.cacheRemoteFiles" class="_modified">{{ $locale.env.modified }}</span></template>
									<template #caption><SearchText>{{ $locale.env.cacheRemoteFilesDescription }}</SearchText>{{ $locale.env.youCanCleanRemoteFilesCache }}</template>
								</MkSwitch>
							</SearchMarker>

							<template v-if="federationForm.state.cacheRemoteFiles">
								<SearchMarker :keywords="['cache', 'remote', 'sensitive', 'files']">
									<MkSwitch v-model="federationForm.state.cacheRemoteSensitiveFiles">
										<template #label><SearchLabel>{{ $locale.env.cacheRemoteSensitiveFiles }}</SearchLabel><span v-if="federationForm.modifiedStates.cacheRemoteSensitiveFiles" class="_modified">{{ $locale.env.modified }}</span></template>
										<template #caption><SearchText>{{ $locale.env.cacheRemoteSensitiveFilesDescription }}</SearchText></template>
									</MkSwitch>
								</SearchMarker>
							</template>
						</div>
					</MkFolder>
				</SearchMarker>

				<SearchMarker v-slot="slotProps" :keywords="['proxy', 'account']">
					<MkFolder :defaultOpen="slotProps.isParentOfTarget">
						<template #icon><SearchIcon><i class="ti ti-ghost"></i></SearchIcon></template>
						<template #label><SearchLabel>{{ $locale.env.proxyAccount }}</SearchLabel></template>
						<template v-if="proxyAccountForm.modified.value" #footer>
							<MkFormFooter :form="proxyAccountForm"/>
						</template>

						<div class="_gaps">
							<MkInfo>{{ $locale.env.proxyAccountDescription }}</MkInfo>

							<SearchMarker :keywords="['description']">
								<MkTextarea v-model="proxyAccountForm.state.description" :max="500" tall mfmAutocomplete :mfmPreview="true">
									<template #label><SearchLabel>{{ $locale.env._profile.description }}</SearchLabel></template>
									<template #caption>{{ $locale.env._profile.youCanIncludeHashtags }}</template>
								</MkTextarea>
							</SearchMarker>
						</div>
					</MkFolder>
				</SearchMarker>

				<MkButton primary @click="openSetupWizard">
					Open setup wizard
				</MkButton>
			</div>
		</SearchMarker>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { computed } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkInput from '@/components/MkInput.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkInfo from '@/components/MkInfo.vue';
import FormSplit from '@/components/form/split.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { fetchInstance, instance } from '@/instance.js';
import { definePage } from '@/page.js';
import MkButton from '@/components/MkButton.vue';
import MkFolder from '@/components/MkFolder.vue';
import { useForm } from '@/composables/use-form.js';
import MkFormFooter from '@/components/MkFormFooter.vue';
import MkRadios from '@/components/MkRadios.vue';

const meta = await misskeyApi('admin/meta');

const proxyAccount = await misskeyApi('users/show', { userId: meta.proxyAccountId });

const infoForm = useForm({
	name: meta.name ?? '',
	shortName: meta.shortName ?? '',
	description: meta.description ?? '',
	maintainerName: meta.maintainerName ?? '',
	maintainerEmail: meta.maintainerEmail ?? '',
	tosUrl: meta.tosUrl ?? '',
	privacyPolicyUrl: meta.privacyPolicyUrl ?? '',
	inquiryUrl: meta.inquiryUrl ?? '',
	repositoryUrl: meta.repositoryUrl ?? '',
	impressumUrl: meta.impressumUrl ?? '',
}, async (state) => {
	await os.apiWithDialog('admin/update-meta', {
		name: state.name,
		shortName: state.shortName === '' ? null : state.shortName,
		description: state.description,
		maintainerName: state.maintainerName,
		maintainerEmail: state.maintainerEmail,
		tosUrl: state.tosUrl,
		privacyPolicyUrl: state.privacyPolicyUrl,
		inquiryUrl: state.inquiryUrl,
		repositoryUrl: state.repositoryUrl,
		impressumUrl: state.impressumUrl,
	});
	fetchInstance(true);
});

const pinnedUsersForm = useForm({
	pinnedUsers: meta.pinnedUsers.join('\n'),
}, async (state) => {
	await os.apiWithDialog('admin/update-meta', {
		pinnedUsers: state.pinnedUsers.split('\n'),
	});
	fetchInstance(true);
});

const serviceWorkerForm = useForm({
	enableServiceWorker: meta.enableServiceWorker,
	swPublicKey: meta.swPublickey ?? '',
	swPrivateKey: meta.swPrivateKey ?? '',
}, async (state) => {
	await os.apiWithDialog('admin/update-meta', {
		enableServiceWorker: state.enableServiceWorker,
		swPublicKey: state.swPublicKey,
		swPrivateKey: state.swPrivateKey,
	});
	fetchInstance(true);
});

const adForm = useForm({
	notesPerOneAd: meta.notesPerOneAd,
}, async (state) => {
	await os.apiWithDialog('admin/update-meta', {
		notesPerOneAd: state.notesPerOneAd,
	});
	fetchInstance(true);
});

const urlPreviewForm = useForm({
	urlPreviewEnabled: meta.urlPreviewEnabled,
	urlPreviewAllowRedirect: meta.urlPreviewAllowRedirect,
	urlPreviewTimeout: meta.urlPreviewTimeout,
	urlPreviewMaximumContentLength: meta.urlPreviewMaximumContentLength,
	urlPreviewRequireContentLength: meta.urlPreviewRequireContentLength,
	urlPreviewUserAgent: meta.urlPreviewUserAgent ?? '',
	urlPreviewSummaryProxyUrl: meta.urlPreviewSummaryProxyUrl ?? '',
}, async (state) => {
	await os.apiWithDialog('admin/update-meta', {
		urlPreviewEnabled: state.urlPreviewEnabled,
		urlPreviewAllowRedirect: state.urlPreviewAllowRedirect,
		urlPreviewTimeout: state.urlPreviewTimeout,
		urlPreviewMaximumContentLength: state.urlPreviewMaximumContentLength,
		urlPreviewRequireContentLength: state.urlPreviewRequireContentLength,
		urlPreviewUserAgent: state.urlPreviewUserAgent,
		urlPreviewSummaryProxyUrl: state.urlPreviewSummaryProxyUrl,
	});
	fetchInstance(true);
});

const federationForm = useForm({
	federation: meta.federation,
	federationHosts: meta.federationHosts.join('\n'),
	deliverSuspendedSoftware: meta.deliverSuspendedSoftware,
	signToActivityPubGet: meta.signToActivityPubGet,
	proxyRemoteFiles: meta.proxyRemoteFiles,
	allowExternalApRedirect: meta.allowExternalApRedirect,
	cacheRemoteFiles: meta.cacheRemoteFiles,
	cacheRemoteSensitiveFiles: meta.cacheRemoteSensitiveFiles,
}, async (state) => {
	await os.apiWithDialog('admin/update-meta', {
		federation: state.federation,
		federationHosts: state.federationHosts.split('\n'),
		deliverSuspendedSoftware: state.deliverSuspendedSoftware,
		signToActivityPubGet: state.signToActivityPubGet,
		proxyRemoteFiles: state.proxyRemoteFiles,
		allowExternalApRedirect: state.allowExternalApRedirect,
		cacheRemoteFiles: state.cacheRemoteFiles,
		cacheRemoteSensitiveFiles: state.cacheRemoteSensitiveFiles,
	});
	fetchInstance(true);
});

const proxyAccountForm = useForm({
	description: proxyAccount.description,
}, async (state) => {
	await os.apiWithDialog('admin/update-proxy-account', {
		description: state.description,
	});
	fetchInstance(true);
});

async function openSetupWizard() {
	const { canceled } = await os.confirm({
		type: 'warning',
		title: localeRef.value.env._serverSettings.restartServerSetupWizardConfirm_title,
		text: localeRef.value.env._serverSettings.restartServerSetupWizardConfirm_text,
	});
	if (canceled) return;

	const { dispose } = await os.popupAsyncWithDialog(import('@/components/MkServerSetupWizardDialog.vue').then(x => x.default), {
	}, {
		closed: () => dispose(),
	});
}

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.general,
	icon: 'ti ti-settings',
}));
</script>

<style lang="scss" module>
.subCaption {
	font-size: 0.85em;
	color: color(from var(--MI_THEME-fg) srgb r g b / 0.75);
}

.metadataRoot {
	container-type: inline-size;
}

.fieldDragItem {
	display: flex;
	padding: 10px;
	align-items: flex-end;
	border-radius: 6px;

	/* (drag button) 32px + (drag button margin) 8px + (input width) 200px * 2 + (input gap) 12px = 452px */
	@container (max-width: 452px) {
		align-items: center;
	}
}

.dragItemHandle {
	cursor: grab;
	width: 32px;
	height: 32px;
	margin: 0 8px 0 0;
	opacity: 0.5;
	flex-shrink: 0;

	&:active {
		cursor: grabbing;
	}
}

.dragItemRemove {
	@extend .dragItemHandle;

	color: #ff2a2a;
	opacity: 1;
	cursor: pointer;

	&:hover, &:focus {
		opacity: .7;
	}

	&:active {
		cursor: pointer;
	}
}

.dragItemForm {
	flex-grow: 1;
}
</style>

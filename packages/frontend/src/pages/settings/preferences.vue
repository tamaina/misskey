<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/preferences" :label="$locale.env.preferences" :keywords="['general', 'preferences']" icon="ti ti-adjustments">
	<div class="_gaps_m">
		<MkFeatureBanner icon="/client-assets/gear_3d.png" color="#00ff9d">
			<SearchText>{{ $locale.env._settings.preferencesBanner }}</SearchText>
		</MkFeatureBanner>

		<div class="_gaps_s">
			<SearchMarker v-slot="slotProps" :keywords="['general']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ $locale.env.general }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-settings"></i></SearchIcon></template>

					<div class="_gaps_m">
						<SearchMarker :keywords="['language']">
							<MkSelect v-model="lang" :items="langs.map(x => ({ label: x[1], value: x[0] }))">
								<template #label><SearchLabel>{{ $locale.env.uiLanguage }}</SearchLabel></template>
								<template #caption>
									<I18n :src="$locale.env.i18nInfo" tag="span">
										<template #link>
											<MkLink url="https://crowdin.com/project/misskey">Crowdin</MkLink>
										</template>
									</I18n>
								</template>
							</MkSelect>
						</SearchMarker>

						<SearchMarker :keywords="['device', 'type', 'kind', 'smartphone', 'tablet', 'desktop']">
							<MkRadios
								v-model="overridedDeviceKind"
								:options="[
									{ value: null, label: $locale.env.auto },
									{ value: 'smartphone', label: $locale.env.smartphone, icon: 'ti ti-device-mobile' },
									{ value: 'tablet', label: $locale.env.tablet, icon: 'ti ti-device-tablet' },
									{ value: 'desktop', label: $locale.env.desktop, icon: 'ti ti-device-desktop' },
								]"
							>
								<template #label><SearchLabel>{{ $locale.env.overridedDeviceKind }}</SearchLabel></template>
							</MkRadios>
						</SearchMarker>

						<SearchMarker :keywords="['realtimemode']">
							<MkSwitch v-model="realtimeMode">
								<template #label><i class="ti ti-bolt"></i> <SearchLabel>{{ $locale.env.realtimeMode }}</SearchLabel></template>
								<template #caption><SearchText>{{ $locale.env._settings.realtimeMode_description }}</SearchText></template>
							</MkSwitch>
						</SearchMarker>

						<MkDisableSection :disabled="realtimeMode">
							<SearchMarker :keywords="['polling', 'interval']">
								<MkPreferenceContainer k="pollingInterval">
									<MkRange v-model="pollingInterval" :min="1" :max="3" :step="1" easing :showTicks="true" :textConverter="(v) => v === 1 ? $locale.env.low : v === 2 ? $locale.env.middle : v === 3 ? $locale.env.high : ''">
										<template #label><SearchLabel>{{ $locale.env._settings.contentsUpdateFrequency }}</SearchLabel></template>
										<template #caption><SearchText>{{ $locale.env._settings.contentsUpdateFrequency_description }}</SearchText><br><SearchText>{{ $locale.env._settings.contentsUpdateFrequency_description2 }}</SearchText></template>
										<template #prefix><i class="ti ti-player-play"></i></template>
										<template #suffix><i class="ti ti-player-track-next"></i></template>
									</MkRange>
								</MkPreferenceContainer>
							</SearchMarker>
						</MkDisableSection>

						<div class="_gaps_s">
							<SearchMarker :keywords="['titlebar', 'show']">
								<MkPreferenceContainer k="showTitlebar">
									<MkSwitch v-model="showTitlebar">
										<template #label><SearchLabel>{{ $locale.env.showTitlebar }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['avatar', 'icon', 'decoration', 'show']">
								<MkPreferenceContainer k="showAvatarDecorations">
									<MkSwitch v-model="showAvatarDecorations">
										<template #label><SearchLabel>{{ $locale.env.showAvatarDecorations }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['follow', 'confirm', 'always']">
								<MkPreferenceContainer k="alwaysConfirmFollow">
									<MkSwitch v-model="alwaysConfirmFollow">
										<template #label><SearchLabel>{{ $locale.env.alwaysConfirmFollow }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['highlight', 'sensitive', 'nsfw', 'image', 'photo', 'picture', 'media', 'thumbnail']">
								<MkPreferenceContainer k="highlightSensitiveMedia">
									<MkSwitch v-model="highlightSensitiveMedia">
										<template #label><SearchLabel>{{ $locale.env.highlightSensitiveMedia }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['sensitive', 'nsfw', 'media', 'image', 'photo', 'picture', 'attachment', 'confirm']">
								<MkPreferenceContainer k="confirmWhenRevealingSensitiveMedia">
									<MkSwitch v-model="confirmWhenRevealingSensitiveMedia">
										<template #label><SearchLabel>{{ $locale.env.confirmWhenRevealingSensitiveMedia }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['mfm', 'enable', 'show', 'advanced']">
								<MkPreferenceContainer k="advancedMfm">
									<MkSwitch v-model="advancedMfm">
										<template #label><SearchLabel>{{ $locale.env.enableAdvancedMfm }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['auto', 'load', 'auto', 'more', 'scroll']">
								<MkPreferenceContainer k="enableInfiniteScroll">
									<MkSwitch v-model="enableInfiniteScroll">
										<template #label><SearchLabel>{{ $locale.env.enableInfiniteScroll }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>

						<SearchMarker :keywords="['emoji', 'style', 'native', 'system', 'fluent', 'twemoji']">
							<MkPreferenceContainer k="emojiStyle">
								<div>
									<MkRadios
										v-model="emojiStyle"
										:options="[
											{ value: 'native', label: $locale.env.native },
											{ value: 'fluentEmoji', label: 'Fluent Emoji' },
											{ value: 'twemoji', label: 'Twemoji' },
										]"
									>
										<template #label><SearchLabel>{{ $locale.env.emojiStyle }}</SearchLabel></template>
									</MkRadios>
									<div style="margin: 8px 0 0 0; font-size: 1.5em;"><Mfm :key="emojiStyle" text="🍮🍦🍭🍩🍰🍫🍬🥞🍪"/></div>
								</div>
							</MkPreferenceContainer>
						</SearchMarker>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker v-slot="slotProps" :keywords="['timeline', 'note']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ $locale.env._settings.timelineAndNote }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-notes"></i></SearchIcon></template>

					<div class="_gaps_m">
						<div class="_gaps_s">
							<SearchMarker :keywords="['post', 'form', 'timeline']">
								<MkPreferenceContainer k="showFixedPostForm">
									<MkSwitch v-model="showFixedPostForm">
										<template #label><SearchLabel>{{ $locale.env.showFixedPostForm }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['post', 'form', 'timeline', 'channel']">
								<MkPreferenceContainer k="showFixedPostFormInChannel">
									<MkSwitch v-model="showFixedPostFormInChannel">
										<template #label><SearchLabel>{{ $locale.env.showFixedPostFormInChannel }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['renote']">
								<MkPreferenceContainer k="collapseRenotes">
									<MkSwitch v-model="collapseRenotes">
										<template #label><SearchLabel>{{ $locale.env.collapseRenotes }}</SearchLabel></template>
										<template #caption><SearchText>{{ $locale.env.collapseRenotesDescription }}</SearchText></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['pinned', 'list']">
								<MkFolder>
									<template #label><SearchLabel>{{ $locale.env.pinnedList }}</SearchLabel></template>
									<!-- 複数ピン止め管理できるようにしたいけどめんどいので一旦ひとつのみ -->
									<MkButton v-if="prefer.r.pinnedUserLists.value.length === 0" @click="setPinnedList()">{{ $locale.env.add }}</MkButton>
									<MkButton v-else danger @click="removePinnedList()"><i class="ti ti-trash"></i> {{ $locale.env.remove }}</MkButton>
								</MkFolder>
							</SearchMarker>
						</div>

						<hr>

						<div class="_gaps_m">
							<div class="_gaps_s">
								<SearchMarker :keywords="['hover', 'show', 'footer', 'action']">
									<MkPreferenceContainer k="showNoteActionsOnlyHover">
										<MkSwitch v-model="showNoteActionsOnlyHover">
											<template #label><SearchLabel>{{ $locale.env.showNoteActionsOnlyHover }}</SearchLabel></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['footer', 'action', 'clip', 'show']">
									<MkPreferenceContainer k="showClipButtonInNoteFooter">
										<MkSwitch v-model="showClipButtonInNoteFooter">
											<template #label><SearchLabel>{{ $locale.env.showClipButtonInNoteFooter }}</SearchLabel></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['reaction', 'count', 'show']">
									<MkPreferenceContainer k="showReactionsCount">
										<MkSwitch v-model="showReactionsCount">
											<template #label><SearchLabel>{{ $locale.env.showReactionsCount }}</SearchLabel></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['reaction', 'confirm']">
									<MkPreferenceContainer k="confirmOnReact">
										<MkSwitch v-model="confirmOnReact">
											<template #label><SearchLabel>{{ $locale.env.confirmOnReact }}</SearchLabel></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['image', 'photo', 'picture', 'media', 'thumbnail', 'quality', 'raw', 'attachment']">
									<MkPreferenceContainer k="loadRawImages">
										<MkSwitch v-model="loadRawImages">
											<template #label><SearchLabel>{{ $locale.env.loadRawImages }}</SearchLabel></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['reaction', 'picker', 'contextmenu', 'open']">
									<MkPreferenceContainer k="useReactionPickerForContextMenu">
										<MkSwitch v-model="useReactionPickerForContextMenu">
											<template #label><SearchLabel>{{ $locale.env.useReactionPickerForContextMenu }}</SearchLabel></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>

								<SearchMarker :keywords="['reaction', 'order']">
									<MkPreferenceContainer k="showAvailableReactionsFirstInNote">
										<MkSwitch v-model="showAvailableReactionsFirstInNote">
											<template #label><SearchLabel>{{ $locale.env._settings.showAvailableReactionsFirstInNote }}</SearchLabel></template>
										</MkSwitch>
									</MkPreferenceContainer>
								</SearchMarker>
							</div>

							<SearchMarker :keywords="['reaction', 'size', 'scale', 'display']">
								<MkPreferenceContainer k="reactionsDisplaySize">
									<MkRadios
										v-model="reactionsDisplaySize"
										:options="[
											{ value: 'small', label: $locale.env.small },
											{ value: 'medium', label: $locale.env.medium },
											{ value: 'large', label: $locale.env.large },
										]"
									>
										<template #label><SearchLabel>{{ $locale.env.reactionsDisplaySize }}</SearchLabel></template>
									</MkRadios>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['reaction', 'size', 'scale', 'display', 'width', 'limit']">
								<MkPreferenceContainer k="limitWidthOfReaction">
									<MkSwitch v-model="limitWidthOfReaction">
										<template #label><SearchLabel>{{ $locale.env.limitWidthOfReaction }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'list', 'size', 'height']">
								<MkPreferenceContainer k="mediaListWithOneImageAppearance">
									<MkRadios
										v-model="mediaListWithOneImageAppearance"
										:options="[
											{ value: 'expand', label: $locale.env.default },
											{ value: '16_9', label: $l.env.limitTo({ x: '16:9' }) },
											{ value: '1_1', label: $l.env.limitTo({ x: '1:1' }) },
											{ value: '2_3', label: $l.env.limitTo({ x: '2:3' }) },
										]"
									>
										<template #label><SearchLabel>{{ $locale.env.mediaListWithOneImageAppearance }}</SearchLabel></template>
									</MkRadios>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'grid', 'wide', 'area']">
								<MkPreferenceContainer k="showMediaListByGridInWideArea">
									<MkSwitch v-model="showMediaListByGridInWideArea">
										<template #label><SearchLabel>{{ $locale.env.showMediaListByGridInWideArea }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<template v-if="instance.federation !== 'none'">
								<SearchMarker :keywords="['ticker', 'information', 'label', 'instance', 'server', 'host', 'federation']">
									<MkPreferenceContainer k="instanceTicker">
										<MkSelect
											v-model="instanceTicker"
											:items="[
												{ label: $locale.env._instanceTicker.none, value: 'none' },
												{ label: $locale.env._instanceTicker.remote, value: 'remote' },
												{ label: $locale.env._instanceTicker.always, value: 'always' },
											]"
										>
											<template #label><SearchLabel>{{ $locale.env.instanceTicker }}</SearchLabel></template>
										</MkSelect>
									</MkPreferenceContainer>
								</SearchMarker>
							</template>

							<SearchMarker :keywords="['attachment', 'image', 'photo', 'picture', 'media', 'thumbnail', 'nsfw', 'sensitive', 'display', 'show', 'hide', 'visibility']">
								<MkPreferenceContainer k="nsfw">
									<MkSelect
										v-model="nsfw"
										:items="[
											{ label: $locale.env._displayOfSensitiveMedia.respect, value: 'respect' },
											{ label: $locale.env._displayOfSensitiveMedia.ignore, value: 'ignore' },
											{ label: $locale.env._displayOfSensitiveMedia.force, value: 'force' },
										]"
									>
										<template #label><SearchLabel>{{ $locale.env.displayOfSensitiveMedia }}</SearchLabel></template>
									</MkSelect>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker v-slot="slotProps" :keywords="['post', 'form']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ $locale.env.postForm }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-edit"></i></SearchIcon></template>

					<div class="_gaps_m">
						<div class="_gaps_s">
							<SearchMarker :keywords="['remember', 'keep', 'note', 'cw']">
								<MkPreferenceContainer k="keepCw">
									<MkSwitch v-model="keepCw">
										<template #label><SearchLabel>{{ $locale.env.keepCw }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['remember', 'keep', 'note', 'visibility']">
								<MkPreferenceContainer k="rememberNoteVisibility">
									<MkSwitch v-model="rememberNoteVisibility">
										<template #label><SearchLabel>{{ $locale.env.rememberNoteVisibility }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['mfm', 'enable', 'show', 'advanced', 'picker', 'form', 'function', 'fn']">
								<MkPreferenceContainer k="enableQuickAddMfmFunction">
									<MkSwitch v-model="enableQuickAddMfmFunction">
										<template #label><SearchLabel>{{ $locale.env.enableQuickAddMfmFunction }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>

						<SearchMarker :keywords="['default', 'note', 'visibility']">
							<MkDisableSection :disabled="rememberNoteVisibility">
								<MkFolder>
									<template #label><SearchLabel>{{ $locale.env.defaultNoteVisibility }}</SearchLabel></template>
									<template v-if="defaultNoteVisibility === 'public'" #suffix>{{ $locale.env._visibility.public }}</template>
									<template v-else-if="defaultNoteVisibility === 'home'" #suffix>{{ $locale.env._visibility.home }}</template>
									<template v-else-if="defaultNoteVisibility === 'followers'" #suffix>{{ $locale.env._visibility.followers }}</template>
									<template v-else-if="defaultNoteVisibility === 'specified'" #suffix>{{ $locale.env._visibility.specified }}</template>

									<div class="_gaps_m">
										<MkPreferenceContainer k="defaultNoteVisibility">
											<MkSelect
												v-model="defaultNoteVisibility"
												:items="[
													{ label: $locale.env._visibility.public, value: 'public' },
													{ label: $locale.env._visibility.home, value: 'home' },
													{ label: $locale.env._visibility.followers, value: 'followers' },
													{ label: $locale.env._visibility.specified, value: 'specified' },
												]"
											>
											</MkSelect>
										</MkPreferenceContainer>

										<MkPreferenceContainer k="defaultNoteLocalOnly">
											<MkSwitch v-model="defaultNoteLocalOnly">{{ $locale.env._visibility.disableFederation }}</MkSwitch>
										</MkPreferenceContainer>
									</div>
								</MkFolder>
							</MkDisableSection>
						</SearchMarker>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker v-slot="slotProps" :keywords="['notification']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ $locale.env.notifications }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-bell"></i></SearchIcon></template>

					<div class="_gaps_m">
						<SearchMarker :keywords="['group']">
							<MkPreferenceContainer k="useGroupedNotifications">
								<MkSwitch v-model="useGroupedNotifications">
									<template #label><SearchLabel>{{ $locale.env.useGroupedNotifications }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['position']">
							<MkPreferenceContainer k="notificationPosition">
								<MkRadios
									v-model="notificationPosition"
									:options="[
										{ value: 'leftTop', label: $locale.env.leftTop, icon: 'ti ti-align-box-left-top' },
										{ value: 'rightTop', label: $locale.env.rightTop, icon: 'ti ti-align-box-right-top' },
										{ value: 'leftBottom', label: $locale.env.leftBottom, icon: 'ti ti-align-box-left-bottom' },
										{ value: 'rightBottom', label: $locale.env.rightBottom, icon: 'ti ti-align-box-right-bottom' },
									]"
								>
									<template #label><SearchLabel>{{ $locale.env.position }}</SearchLabel></template>
								</MkRadios>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['stack', 'axis', 'direction']">
							<MkPreferenceContainer k="notificationStackAxis">
								<MkRadios
									v-model="notificationStackAxis"
									:options="[
										{ value: 'vertical', label: $locale.env.vertical, icon: 'ti ti-carousel-vertical' },
										{ value: 'horizontal', label: $locale.env.horizontal, icon: 'ti ti-carousel-horizontal' },
									]"
								>
									<template #label><SearchLabel>{{ $locale.env.stackAxis }}</SearchLabel></template>
								</MkRadios>
							</MkPreferenceContainer>
						</SearchMarker>

						<MkButton @click="testNotification">{{ $locale.env._notification.checkNotificationBehavior }}</MkButton>
					</div>
				</MkFolder>
			</SearchMarker>

			<template v-if="$i.policies.chatAvailability !== 'unavailable'">
				<SearchMarker v-slot="slotProps" :keywords="['chat', 'messaging']">
					<MkFolder :defaultOpen="slotProps.isParentOfTarget">
						<template #label><SearchLabel>{{ $locale.env.directMessage }}</SearchLabel></template>
						<template #icon><SearchIcon><i class="ti ti-messages"></i></SearchIcon></template>

						<div class="_gaps_s">
							<SearchMarker :keywords="['show', 'sender', 'name']">
								<MkPreferenceContainer k="chat.showSenderName">
									<MkSwitch v-model="chatShowSenderName">
										<template #label><SearchLabel>{{ $locale.env._settings._chat.showSenderName }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['send', 'enter', 'newline']">
								<MkPreferenceContainer k="chat.sendOnEnter">
									<MkSwitch v-model="chatSendOnEnter">
										<template #label><SearchLabel>{{ $locale.env._settings._chat.sendOnEnter }}</SearchLabel></template>
										<template #caption>
											<div class="_gaps_s">
												<div>
													<b>{{ $locale.env._settings.ifOn }}:</b>
													<div>{{ $locale.env._chat.send }}: Enter</div>
													<div>{{ $locale.env._chat.newline }}: Shift + Enter</div>
												</div>
												<div>
													<b>{{ $locale.env._settings.ifOff }}:</b>
													<div>{{ $locale.env._chat.send }}: Ctrl + Enter</div>
													<div>{{ $locale.env._chat.newline }}: Enter</div>
												</div>
											</div>
										</template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>
					</MkFolder>
				</SearchMarker>
			</template>

			<SearchMarker v-slot="slotProps" :keywords="['accessibility']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ $locale.env.accessibility }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-accessible"></i></SearchIcon></template>

					<div class="_gaps_m">
						<MkFeatureBanner icon="/client-assets/mens_room_3d.png" color="#0011ff">
							<SearchText>{{ $locale.env._settings.accessibilityBanner }}</SearchText>
						</MkFeatureBanner>

						<div class="_gaps_s">
							<SearchMarker :keywords="['animation', 'motion', 'reduce']">
								<MkPreferenceContainer k="animation">
									<MkSwitch v-model="reduceAnimation">
										<template #label><SearchLabel>{{ $locale.env.reduceUiAnimation }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['disable', 'animation', 'image', 'photo', 'picture', 'media', 'thumbnail', 'gif']">
								<MkPreferenceContainer k="disableShowingAnimatedImages">
									<MkSwitch v-model="disableShowingAnimatedImages">
										<template #label><SearchLabel>{{ $locale.env.disableShowingAnimatedImages }}</SearchLabel></template>
										<template #caption>{{ $locale.env.disableShowingAnimatedImages_caption }}</template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['mfm', 'enable', 'show', 'animated']">
								<MkPreferenceContainer k="animatedMfm">
									<MkSwitch v-model="animatedMfm">
										<template #label><SearchLabel>{{ $locale.env.enableAnimatedMfm }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['tabs', 'tabbar', 'bottom', 'under']">
								<MkPreferenceContainer k="showPageTabBarBottom">
									<MkSwitch v-model="showPageTabBarBottom">
										<template #label><SearchLabel>{{ $locale.env._settings.showPageTabBarBottom }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['swipe', 'horizontal', 'tab']">
								<MkPreferenceContainer k="enableHorizontalSwipe">
									<MkSwitch v-model="enableHorizontalSwipe">
										<template #label><SearchLabel>{{ $locale.env.enableHorizontalSwipe }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['swipe', 'pull', 'refresh']">
								<MkPreferenceContainer k="enablePullToRefresh">
									<MkSwitch v-model="enablePullToRefresh">
										<template #label><SearchLabel>{{ $locale.env._settings.enablePullToRefresh }}</SearchLabel></template>
										<template #caption><SearchText>{{ $locale.env._settings.enablePullToRefresh_description }}</SearchText></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['keep', 'screen', 'display', 'on']">
								<MkPreferenceContainer k="keepScreenOn">
									<MkSwitch v-model="keepScreenOn">
										<template #label><SearchLabel>{{ $locale.env.keepScreenOn }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['native', 'system', 'video', 'audio', 'player', 'media']">
								<MkPreferenceContainer k="useNativeUiForVideoAudioPlayer">
									<MkSwitch v-model="useNativeUiForVideoAudioPlayer">
										<template #label><SearchLabel>{{ $locale.env.useNativeUIForVideoAudioPlayer }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['text', 'selectable']">
								<MkPreferenceContainer k="makeEveryTextElementsSelectable">
									<MkSwitch v-model="makeEveryTextElementsSelectable">
										<template #label><SearchLabel>{{ $locale.env._settings.makeEveryTextElementsSelectable }}</SearchLabel></template>
										<template #caption>{{ $locale.env._settings.makeEveryTextElementsSelectable_description }}</template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>

						<SearchMarker :keywords="['menu', 'style', 'popup', 'drawer']">
							<MkPreferenceContainer k="menuStyle">
								<MkSelect
									v-model="menuStyle"
									:items="[
										{ label: $locale.env.auto, value: 'auto' },
										{ label: $locale.env.popup, value: 'popup' },
										{ label: $locale.env.drawer, value: 'drawer' },
									]"
								>
									<template #label><SearchLabel>{{ $locale.env.menuStyle }}</SearchLabel></template>
								</MkSelect>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['contextmenu', 'system', 'native']">
							<MkPreferenceContainer k="contextMenu">
								<MkSelect
									v-model="contextMenu"
									:items="[
										{ label: $locale.env._contextMenu.app, value: 'app' },
										{ label: $locale.env._contextMenu.appWithShift, value: 'appWithShift' },
										{ label: $locale.env._contextMenu.native, value: 'native' },
									]"
								>
									<template #label><SearchLabel>{{ $locale.env._contextMenu.title }}</SearchLabel></template>
								</MkSelect>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['font', 'size']">
							<MkRadios
								v-model="fontSize"
								:options="[
									{ value: null, label: 'Aa', labelStyle: 'font-size: 14px;' },
									{ value: '1', label: 'Aa', labelStyle: 'font-size: 15px;' },
									{ value: '2', label: 'Aa', labelStyle: 'font-size: 16px;' },
									{ value: '3', label: 'Aa', labelStyle: 'font-size: 17px;' },
								]"
							>
								<template #label><SearchLabel>{{ $locale.env.fontSize }}</SearchLabel></template>
							</MkRadios>
						</SearchMarker>

						<SearchMarker :keywords="['font', 'system', 'native']">
							<MkSwitch v-model="useSystemFont">
								<template #label><SearchLabel>{{ $locale.env.useSystemFont }}</SearchLabel></template>
							</MkSwitch>
						</SearchMarker>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker v-slot="slotProps" :keywords="['performance']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ $locale.env.performance }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-battery-vertical-eco"></i></SearchIcon></template>

					<div class="_gaps_s">
						<SearchMarker :keywords="['animation', 'motion', 'reduce']">
							<MkPreferenceContainer k="animation">
								<MkSwitch :modelValue="!reduceAnimation" @update:modelValue="v => reduceAnimation = !v">
									<template #label><SearchLabel>{{ $locale.env._settings.uiAnimations }}</SearchLabel></template>
									<template #caption><SearchText>{{ $locale.env.turnOffToImprovePerformance }}</SearchText></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['animation', 'image', 'photo', 'picture', 'media', 'thumbnail', 'gif']">
							<MkPreferenceContainer k="disableShowingAnimatedImages">
								<MkSwitch :modelValue="!disableShowingAnimatedImages" @update:modelValue="v => disableShowingAnimatedImages = !v">
									<template #label><SearchLabel>{{ $locale.env._settings.enableAnimatedImages }}</SearchLabel></template>
									<template #caption>
										<SearchText>{{ $locale.env.turnOffToImprovePerformance }}</SearchText>
										<div>{{ $locale.env.disableShowingAnimatedImages_caption }}</div>
									</template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['blur']">
							<MkPreferenceContainer k="useBlurEffect">
								<MkSwitch v-model="useBlurEffect">
									<template #label><SearchLabel>{{ $locale.env.useBlurEffect }}</SearchLabel></template>
									<template #caption><SearchText>{{ $locale.env.turnOffToImprovePerformance }}</SearchText></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['blur', 'modal']">
							<MkPreferenceContainer k="useBlurEffectForModal">
								<MkSwitch v-model="useBlurEffectForModal">
									<template #label><SearchLabel>{{ $locale.env.useBlurEffectForModal }}</SearchLabel></template>
									<template #caption><SearchText>{{ $locale.env.turnOffToImprovePerformance }}</SearchText></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['blurhash', 'image', 'photo', 'picture', 'thumbnail', 'placeholder']">
							<MkPreferenceContainer k="enableHighQualityImagePlaceholders">
								<MkSwitch v-model="enableHighQualityImagePlaceholders">
									<template #label><SearchLabel>{{ $locale.env._settings.enableHighQualityImagePlaceholders }}</SearchLabel></template>
									<template #caption><SearchText>{{ $locale.env.turnOffToImprovePerformance }}</SearchText></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['sticky']">
							<MkPreferenceContainer k="useStickyIcons">
								<MkSwitch v-model="useStickyIcons">
									<template #label><SearchLabel>{{ $locale.env._settings.useStickyIcons }}</SearchLabel></template>
									<template #caption><SearchText>{{ $locale.env.turnOffToImprovePerformance }}</SearchText></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<MkInfo>
							<div class="_gaps_s">
								<div>{{ $locale.env._clientPerformanceIssueTip.title }}:</div>
								<div>
									<div><b>{{ $locale.env._clientPerformanceIssueTip.makeSureDisabledAdBlocker }}</b></div>
									<div>{{ $locale.env._clientPerformanceIssueTip.makeSureDisabledAdBlocker_description }}</div>
								</div>
								<div>
									<div><b>{{ $locale.env._clientPerformanceIssueTip.makeSureDisabledCustomCss }}</b></div>
									<div>{{ $locale.env._clientPerformanceIssueTip.makeSureDisabledCustomCss_description }}</div>
								</div>
								<div>
									<div><b>{{ $locale.env._clientPerformanceIssueTip.makeSureDisabledAddons }}</b></div>
									<div>{{ $locale.env._clientPerformanceIssueTip.makeSureDisabledAddons_description }}</div>
								</div>
							</div>
						</MkInfo>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker v-slot="slotProps" :keywords="['datasaver']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ $locale.env.dataSaver }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-antenna-bars-3"></i></SearchIcon></template>

					<div class="_gaps_m">
						<MkInfo>{{ $locale.env.reloadRequiredToApplySettings }}</MkInfo>

						<div class="_buttons">
							<MkButton inline @click="enableAllDataSaver">{{ $locale.env.enableAll }}</MkButton>
							<MkButton inline @click="disableAllDataSaver">{{ $locale.env.disableAll }}</MkButton>
						</div>
						<div class="_gaps_m">
							<MkSwitch v-model="dataSaver.media">
								{{ $locale.env._dataSaver._media.title }}
								<template #caption>{{ $locale.env._dataSaver._media.description }}</template>
							</MkSwitch>
							<MkSwitch v-model="dataSaver.avatar">
								{{ $locale.env._dataSaver._avatar.title }}
								<template #caption>{{ $locale.env._dataSaver._avatar.description }}</template>
							</MkSwitch>
							<MkSwitch v-model="dataSaver.disableUrlPreview" :disabled="!instance.enableUrlPreview">
								{{ $locale.env._dataSaver._disableUrlPreview.title }}
								<template #caption>{{ $locale.env._dataSaver._disableUrlPreview.description }}</template>
							</MkSwitch>
							<MkSwitch v-model="dataSaver.urlPreviewThumbnail" :disabled="!instance.enableUrlPreview || dataSaver.disableUrlPreview">
								{{ $locale.env._dataSaver._urlPreviewThumbnail.title }}
								<template #caption>{{ $locale.env._dataSaver._urlPreviewThumbnail.description }}</template>
							</MkSwitch>
							<MkSwitch v-model="dataSaver.code">
								{{ $locale.env._dataSaver._code.title }}
								<template #caption>{{ $locale.env._dataSaver._code.description }}</template>
							</MkSwitch>
						</div>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker v-slot="slotProps" :keywords="['other']">
				<MkFolder :defaultOpen="slotProps.isParentOfTarget">
					<template #label><SearchLabel>{{ $locale.env.other }}</SearchLabel></template>
					<template #icon><SearchIcon><i class="ti ti-settings-cog"></i></SearchIcon></template>

					<div class="_gaps_m">
						<div class="_gaps_s">
							<SearchMarker :keywords="['avatar', 'icon', 'square']">
								<MkPreferenceContainer k="squareAvatars">
									<MkSwitch v-model="squareAvatars">
										<template #label><SearchLabel>{{ $locale.env.squareAvatars }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['effect', 'show']">
								<MkPreferenceContainer k="enableSeasonalScreenEffect">
									<MkSwitch v-model="enableSeasonalScreenEffect">
										<template #label><SearchLabel>{{ $locale.env.seasonalScreenEffect }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['image', 'photo', 'picture', 'media', 'thumbnail', 'new', 'tab']">
								<MkPreferenceContainer k="imageNewTab">
									<MkSwitch v-model="imageNewTab">
										<template #label><SearchLabel>{{ $locale.env.openImageInNewTab }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>

							<SearchMarker :keywords="['follow', 'replies']">
								<MkPreferenceContainer k="defaultFollowWithReplies">
									<MkSwitch v-model="defaultFollowWithReplies">
										<template #label><SearchLabel>{{ $locale.env.withRepliesByDefaultForNewlyFollowed }}</SearchLabel></template>
									</MkSwitch>
								</MkPreferenceContainer>
							</SearchMarker>
						</div>

						<SearchMarker :keywords="['server', 'disconnect', 'reconnect', 'reload', 'streaming']">
							<MkPreferenceContainer k="serverDisconnectedBehavior">
								<MkSelect
									v-model="serverDisconnectedBehavior"
									:items="[
										{ label: $locale.env._serverDisconnectedBehavior.reload, value: 'reload' },
										{ label: $locale.env._serverDisconnectedBehavior.dialog, value: 'dialog' },
										{ label: $locale.env._serverDisconnectedBehavior.quiet, value: 'quiet' },
									]"
								>
									<template #label><SearchLabel>{{ $locale.env.whenServerDisconnected }}</SearchLabel></template>
								</MkSelect>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['cache', 'page']">
							<MkPreferenceContainer k="numberOfPageCache">
								<MkRange v-model="numberOfPageCache" :min="1" :max="10" :step="1" easing>
									<template #label><SearchLabel>{{ $locale.env.numberOfPageCache }}</SearchLabel></template>
									<template #caption>{{ $locale.env.numberOfPageCacheDescription }}</template>
								</MkRange>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['ad', 'show']">
							<MkPreferenceContainer k="forceShowAds">
								<MkSwitch v-model="forceShowAds">
									<template #label><SearchLabel>{{ $locale.env.forceShowAds }}</SearchLabel></template>
								</MkSwitch>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker>
							<MkPreferenceContainer k="hemisphere">
								<MkRadios
									v-model="hemisphere"
									:options="[
										{ value: 'N', label: $locale.env._hemisphere.N },
										{ value: 'S', label: $locale.env._hemisphere.S },
									]"
								>
									<template #label><SearchLabel>{{ $locale.env.hemisphere }}</SearchLabel></template>
									<template #caption>{{ $locale.env._hemisphere.caption }}</template>
								</MkRadios>
							</MkPreferenceContainer>
						</SearchMarker>

						<SearchMarker :keywords="['emoji', 'dictionary', 'additional', 'extra']">
							<MkFolder>
								<template #label><SearchLabel>{{ $locale.env.additionalEmojiDictionary }}</SearchLabel></template>
								<div class="_buttons">
									<template v-for="lang in emojiIndexLangs" :key="lang">
										<MkButton v-if="store.r.additionalUnicodeEmojiIndexes.value[lang]" danger @click="removeEmojiIndex(lang)"><i class="ti ti-trash"></i> {{ $locale.env.remove }} ({{ getEmojiIndexLangName(lang) }})</MkButton>
										<MkButton v-else @click="downloadEmojiIndex(lang)"><i class="ti ti-download"></i> {{ getEmojiIndexLangName(lang) }}{{ store.r.additionalUnicodeEmojiIndexes.value[lang] ? ` (${ $locale.env.installed })` : '' }}</MkButton>
									</template>
								</div>
							</MkFolder>
						</SearchMarker>
					</div>
				</MkFolder>
			</SearchMarker>
		</div>

		<hr>

		<div class="_gaps_s">
			<FormLink to="/settings/navbar"><template #icon><i class="ti ti-list"></i></template>{{ $locale.env.navbar }}</FormLink>
			<FormLink to="/settings/statusbar"><template #icon><i class="ti ti-list"></i></template>{{ $locale.env.statusbar }}</FormLink>
			<FormLink to="/settings/deck"><template #icon><i class="ti ti-columns"></i></template>{{ $locale.env.deck }}</FormLink>
			<FormLink to="/settings/custom-css"><template #icon><i class="ti ti-code"></i></template>{{ $locale.env.customCss }}</FormLink>
		</div>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { computed, ref, watch } from 'vue';
import { langs } from '@@/js/config.js';
import * as Misskey from 'misskey-js';
import MkSwitch from '@/components/MkSwitch.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkRange from '@/components/MkRange.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkButton from '@/components/MkButton.vue';
import MkDisableSection from '@/components/MkDisableSection.vue';
import FormLink from '@/components/form/link.vue';
import MkLink from '@/components/MkLink.vue';
import MkInfo from '@/components/MkInfo.vue';
import { store } from '@/store.js';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
import { miLocalStorage } from '@/local-storage.js';
import { prefer } from '@/preferences.js';
import MkPreferenceContainer from '@/components/MkPreferenceContainer.vue';
import MkFeatureBanner from '@/components/MkFeatureBanner.vue';
import { globalEvents } from '@/events.js';
import { claimAchievement } from '@/utility/achievements.js';
import { instance } from '@/instance.js';
import { ensureSignin } from '@/i.js';
import { genId } from '@/utility/id.js';
import { suggestReload } from '@/utility/reload-suggest.js';

const $i = ensureSignin();

const lang = ref(miLocalStorage.getItem('lang'));
const dataSaver = ref(prefer.s.dataSaver);
const realtimeMode = store.model('realtimeMode');

const overridedDeviceKind = prefer.model('overridedDeviceKind');
const pollingInterval = prefer.model('pollingInterval');
const showTitlebar = prefer.model('showTitlebar');
const keepCw = prefer.model('keepCw');
const serverDisconnectedBehavior = prefer.model('serverDisconnectedBehavior');
const hemisphere = prefer.model('hemisphere');
const showNoteActionsOnlyHover = prefer.model('showNoteActionsOnlyHover');
const showClipButtonInNoteFooter = prefer.model('showClipButtonInNoteFooter');
const collapseRenotes = prefer.model('collapseRenotes');
const advancedMfm = prefer.model('advancedMfm');
const showReactionsCount = prefer.model('showReactionsCount');
const enableQuickAddMfmFunction = prefer.model('enableQuickAddMfmFunction');
const forceShowAds = prefer.model('forceShowAds');
const loadRawImages = prefer.model('loadRawImages');
const imageNewTab = prefer.model('imageNewTab');
const showFixedPostForm = prefer.model('showFixedPostForm');
const showFixedPostFormInChannel = prefer.model('showFixedPostFormInChannel');
const numberOfPageCache = prefer.model('numberOfPageCache');
const enableInfiniteScroll = prefer.model('enableInfiniteScroll');
const useReactionPickerForContextMenu = prefer.model('useReactionPickerForContextMenu');
const showAvailableReactionsFirstInNote = prefer.model('showAvailableReactionsFirstInNote');
const useGroupedNotifications = prefer.model('useGroupedNotifications');
const alwaysConfirmFollow = prefer.model('alwaysConfirmFollow');
const confirmWhenRevealingSensitiveMedia = prefer.model('confirmWhenRevealingSensitiveMedia');
const confirmOnReact = prefer.model('confirmOnReact');
const defaultNoteVisibility = prefer.model('defaultNoteVisibility');
const defaultNoteLocalOnly = prefer.model('defaultNoteLocalOnly');
const rememberNoteVisibility = prefer.model('rememberNoteVisibility');
const notificationPosition = prefer.model('notificationPosition');
const notificationStackAxis = prefer.model('notificationStackAxis');
const instanceTicker = prefer.model('instanceTicker');
const highlightSensitiveMedia = prefer.model('highlightSensitiveMedia');
const mediaListWithOneImageAppearance = prefer.model('mediaListWithOneImageAppearance');
const showMediaListByGridInWideArea = prefer.model('showMediaListByGridInWideArea');
const reactionsDisplaySize = prefer.model('reactionsDisplaySize');
const limitWidthOfReaction = prefer.model('limitWidthOfReaction');
const squareAvatars = prefer.model('squareAvatars');
const enableSeasonalScreenEffect = prefer.model('enableSeasonalScreenEffect');
const showAvatarDecorations = prefer.model('showAvatarDecorations');
const nsfw = prefer.model('nsfw');
const emojiStyle = prefer.model('emojiStyle');
const useBlurEffectForModal = prefer.model('useBlurEffectForModal');
const useBlurEffect = prefer.model('useBlurEffect');
const defaultFollowWithReplies = prefer.model('defaultFollowWithReplies');
const chatShowSenderName = prefer.model('chat.showSenderName');
const chatSendOnEnter = prefer.model('chat.sendOnEnter');
const useStickyIcons = prefer.model('useStickyIcons');
const enableHighQualityImagePlaceholders = prefer.model('enableHighQualityImagePlaceholders');
const reduceAnimation = prefer.model('animation', v => !v, v => !v);
const animatedMfm = prefer.model('animatedMfm');
const disableShowingAnimatedImages = prefer.model('disableShowingAnimatedImages');
const keepScreenOn = prefer.model('keepScreenOn');
const enableHorizontalSwipe = prefer.model('enableHorizontalSwipe');
const showPageTabBarBottom = prefer.model('showPageTabBarBottom');
const enablePullToRefresh = prefer.model('enablePullToRefresh');
const useNativeUiForVideoAudioPlayer = prefer.model('useNativeUiForVideoAudioPlayer');
const contextMenu = prefer.model('contextMenu');
const menuStyle = prefer.model('menuStyle');
const makeEveryTextElementsSelectable = prefer.model('makeEveryTextElementsSelectable');

const fontSize = ref(miLocalStorage.getItem('fontSize') as '1' | '2' | '3' | null);
const useSystemFont = ref(miLocalStorage.getItem('useSystemFont') != null);

watch(lang, () => {
	miLocalStorage.setItem('lang', lang.value as string);
});

watch(fontSize, () => {
	if (fontSize.value == null) {
		miLocalStorage.removeItem('fontSize');
	} else {
		miLocalStorage.setItem('fontSize', fontSize.value);
	}
});

watch(useSystemFont, () => {
	if (useSystemFont.value) {
		miLocalStorage.setItem('useSystemFont', 't');
	} else {
		miLocalStorage.removeItem('useSystemFont');
	}
});

watch([
	hemisphere,
	lang,
	realtimeMode,
	pollingInterval,
	enableInfiniteScroll,
	showNoteActionsOnlyHover,
	overridedDeviceKind,
	alwaysConfirmFollow,
	confirmWhenRevealingSensitiveMedia,
	mediaListWithOneImageAppearance,
	reactionsDisplaySize,
	limitWidthOfReaction,
	mediaListWithOneImageAppearance,
	limitWidthOfReaction,
	instanceTicker,
	squareAvatars,
	highlightSensitiveMedia,
	enableSeasonalScreenEffect,
	chatShowSenderName,
	useStickyIcons,
	enableHighQualityImagePlaceholders,
	disableShowingAnimatedImages,
	keepScreenOn,
	contextMenu,
	fontSize,
	useSystemFont,
	makeEveryTextElementsSelectable,
	enableHorizontalSwipe,
	showPageTabBarBottom,
	enablePullToRefresh,
	reduceAnimation,
	showAvailableReactionsFirstInNote,
	animatedMfm,
	advancedMfm,
], () => {
	suggestReload();
});

const emojiIndexLangs = ['en-US', 'ja-JP', 'ja-JP_hira'] as const;

function getEmojiIndexLangName(targetLang: typeof emojiIndexLangs[number]) {
	if (langs.find(x => x[0] === targetLang)) {
		return langs.find(x => x[0] === targetLang)![1];
	} else {
		// 絵文字辞書限定の言語定義
		switch (targetLang) {
			case 'ja-JP_hira': return 'ひらがな';
			default: return targetLang;
		}
	}
}

function downloadEmojiIndex(lang: typeof emojiIndexLangs[number]) {
	async function main() {
		const currentIndexes = store.s.additionalUnicodeEmojiIndexes;

		function download() {
			switch (lang) {
				case 'en-US': return import('@misskey-dev/emoji-data/indexes/en-US.json').then(x => x.default);
				case 'ja-JP': return import('@misskey-dev/emoji-data/indexes/ja-JP.json').then(x => x.default);
				case 'ja-JP_hira': return import('@misskey-dev/emoji-data/indexes/ja-JP_hira.json').then(x => x.default);
				default: throw new Error('unrecognized lang: ' + lang);
			}
		}

		currentIndexes[lang] = await download();
		await store.set('additionalUnicodeEmojiIndexes', currentIndexes);
	}

	os.promiseDialog(main());
}

function removeEmojiIndex(lang: string) {
	async function main() {
		const currentIndexes = store.s.additionalUnicodeEmojiIndexes;
		delete currentIndexes[lang];
		await store.set('additionalUnicodeEmojiIndexes', currentIndexes);
	}

	os.promiseDialog(main());
}

async function setPinnedList() {
	const lists = await misskeyApi('users/lists/list');
	const { canceled, result: listId } = await os.select({
		title: localeRef.value.env.selectList,
		items: lists.map(x => ({
			value: x.id, label: x.name,
		})),
	});
	if (canceled || listId == null) return;

	prefer.commit('pinnedUserLists', [lists.find((x) => x.id === listId)!]);
}

function removePinnedList() {
	prefer.commit('pinnedUserLists', []);
}

function enableAllDataSaver() {
	const g = { ...prefer.s.dataSaver };

	(Object.keys(g) as (keyof typeof g)[]).forEach((key) => { g[key] = true; });

	dataSaver.value = g;
}

function disableAllDataSaver() {
	const g = { ...prefer.s.dataSaver };

	(Object.keys(g) as (keyof typeof g)[]).forEach((key) => { g[key] = false; });

	dataSaver.value = g;
}

watch(dataSaver, (to) => {
	prefer.commit('dataSaver', to);
}, {
	deep: true,
});

let smashCount = 0;
let smashTimer: number | null = null;

function testNotification(): void {
	const notification: Misskey.entities.Notification = {
		id: genId(),
		createdAt: new Date().toUTCString(),
		type: 'test',
	};

	globalEvents.emit('clientNotification', notification);

	// セルフ通知破壊 実績関連
	smashCount++;
	if (smashCount >= 10) {
		claimAchievement('smashTestNotificationButton');
		smashCount = 0;
	}
	if (smashTimer) {
		window.clearTimeout(smashTimer);
	}
	smashTimer = window.setTimeout(() => {
		smashCount = 0;
	}, 300);
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.general,
	icon: 'ti ti-adjustments',
}));
</script>

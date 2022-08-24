/* global powercord */
const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');
const { open } = require('powercord/modal');

const ToneIndicator = require('./Components/ToneIndicator');
const Modal = require('./Components/Modal');
const Settings = require('./Components/Settings');

const { getIndicator } = require('./util');

const { MenuItem } = getModule(['MenuItem'], false);

const LOOKBEHIND_PATTERN = /\p{P}|\s$/u;
const INDICATOR_PATTERN = /^\/([a-z]+)(?=\p{P}|$|\s)/iu;

module.exports = class ToneIndicators extends Plugin {
	async startPlugin() {
		const parser = this.parser = await getModule(['parse', 'parseTopic']);

		await this.createEmbedTitleRules();

		parser.defaultRules.toneIndicator = {
			order: parser.defaultRules.text.order - 1,
			match: (source, state) => {
				if (state.prevCapture && !LOOKBEHIND_PATTERN.test(state.prevCapture)) {
					return null;
				}
				const match = INDICATOR_PATTERN.exec(source);
				if (match === null) return null;
				const desc = getIndicator(match[1]);
				if (desc === null) return null;
				return match;
			},
			parse: match => ({
				indicator: match[1],
				desc: getIndicator(match[1]),
			}),
			react: ToneIndicator,
		};
		this.embedTitleRules.toneIndicator = parser.defaultRules.toneIndicator;
		this.refreshParsers();

		const ChannelAttachMenu = await getModule(
			m => m.default?.displayName === 'ChannelAttachMenu',
		);

		const uploadmenu = this.uploadmenu.bind(this);

		inject(
			'tone-indicators-upload',
			ChannelAttachMenu,
			'default',
			uploadmenu,
		);

		powercord.api.settings.registerSettings(this.entityID, {
			category: this.entityID,
			label: 'Tone Indicators',
			render: Settings,
		});
	}

	async createEmbedTitleRules() {
		// this bs is needed because discord doesnt expose their embedTitle rules
		// management of non-exposed markdown rulesets should probably be a replugged api lol
		const markdownRules = await getModule(['EMBED_TITLE_RULES']);
		const { default: createReactRules } = await getModule(m =>
			m?.default?.toString &&
			['link', 'emoji', 'customEmoji', 'channel', 'commandMention']
				.every(snip => m?.default?.toString().includes(snip))
		);
		const reactRules = createReactRules({ enableBuildOverrides: false });
		this.embedTitleRules = {};
		for (const [name, reactRule] of Object.entries(reactRules)) {
			this.embedTitleRules[name] = {
				...markdownRules.EMBED_TITLE_RULES[name],
				...reactRule,
			};
		}
	}

	// Inject the insert button into the upload menu
	uploadmenu(_args, value) {
		if (!this.settings.get('showInsertToneBtn', true)) return value;
		value.props.children.push(
			React.createElement(MenuItem, {
				label: React.createElement(
					'div',
					{
						className: 'optionLabel-1o-h-l',
					},
					null,
					React.createElement('div', {
						className: 'fas fa-smile optionIcon-1Ft8w0 ',
						style: {
							fontSize: '18px',
							textAlign: 'center',
							verticalAlign: 'middle',
							width: '24px',
							height: '24px',
							lineHeight: '24px',
						},
					}),
					React.createElement(
						'div',
						{
							className: 'optionName-1ebPjH',
						},
						null,
						'Insert Tone Indicator',
					),
				),
				id: 'Tone-Indicators-Popup',
				showIconFirst: true,
				action: () => open(Modal),
			}),
		);
		return value;
	}

	// Recreate parsers with new rules
	refreshParsers() {
		this.parser.parse = this.parser.reactParserFor(this.parser.defaultRules);
		this.parser.parseEmbedTitle = this.parser.reactParserFor(this.embedTitleRules);
	}

	async pluginWillUnload() {
		await this.createEmbedTitleRules();
		delete this.parser.defaultRules.toneIndicator;
		this.refreshParsers();
		powercord.api.settings.unregisterSettings(this.entityID);
		uninject('tone-indicators-upload');
	}
};

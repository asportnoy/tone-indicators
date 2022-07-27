/* global powercord */
const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');
const { open } = require('powercord/modal');

const StringPart = require('./Components/StringPart');
const Modal = require('./Components/Modal');
const Settings = require('./Components/Settings');

const { getIndicator } = require('./util');

const { MenuItem } = getModule(['MenuItem'], false);

module.exports = class ToneIndicators extends Plugin {
	async startPlugin() {
		const parser = await getModule(['parse', 'parseTopic']);
		const process = this.process.bind(this);

		const ChannelAttachMenu = await getModule(
			m => m.default?.displayName === 'ChannelAttachMenu',
		);

		const uploadmenu = this.uploadmenu.bind(this);

		inject('tone-indicators-popup', parser, 'parse', process);
		inject('tone-indicators-popup-embed', parser, 'parseEmbedTitle', process);
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

	// Process messages to find tone indicators
	process(_args, res = {}) {
		if (!Array.isArray(res)) return res;

		// Loop through each part of the message
		return res.map(el => {
			if (typeof el !== 'string') {
				try {
					// Fix conflict with powercord-message-tooltips
					if (el?.props?.parts) return el;

					let children = el?.props?.children;
					if (!children) return el;
					const isFn = typeof children === 'function';
					if (isFn) {
						if (children.length !== 0) return el;
						children = children();
					}
					const val = this.process(_args, children);
					if (children) el.props.children = isFn ? () => val : val;
				} catch (e) {
					return el;
				}
				return el;
			}

			// Don't match inside of links
			if (/^https?:\/\/[^\s]+$/.test(el)) return el;

			// Match tone indicators
			// https://regexr.com/6mhl5
			const indicators = el.split(
				/(?<=\p{P}|^|\s)\/([a-z]+)(?=\p{P}|$|\s)/gui,
			);
			// No matches, just return as-is
			if (!indicators) return el;

			// Filter out any non-valid indicators

			// To store the finished parts
			const res = [];
			let wasLastInvalid = false;
			for (const [i, indicator] of indicators.entries()) {
				if (typeof indicator !== 'string') continue;

				// Even items are non-matches. Just add them back and continue
				if (i % 2 === 0) {
					// If the last indicator was invalid, this string should combined with the last string.
					// Otherwise, create a new item in the array.
					if (wasLastInvalid) res[res.length - 1] += indicator;
					else res.push(indicator);
				} else if (getIndicator(indicator) !== null) {
					// Valid indicator, just add it to the array
					res.push(indicator);
					wasLastInvalid = false;
				} else {
					// Invalid indicator, add it to the last string
					res[res.length - 1] += '/' + indicator;
					wasLastInvalid = true;
				}
			}

			return React.createElement(StringPart, {
				parts: res,
			});
		});
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

	pluginWillUnload() {
		powercord.api.settings.unregisterSettings(this.entityID);
		uninject('tone-indicators-popup');
		uninject('tone-indicators-popup-embed');
		uninject('tone-indicators-upload');
	}
};

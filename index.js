const {Plugin} = require('powercord/entities');
const {inject, uninject} = require('powercord/injector');
const {React, getModule} = require('powercord/webpack');
const {open} = require('powercord/modal');

const INDICATORS = require('./indicators');

const StringPart = require('./Components/StringPart');
const Modal = require('./Components/Modal');
const {getIndicator} = require('./util');

const {MenuItem} = getModule(['MenuItem'], false);

module.exports = class MessageTooltips extends Plugin {
	async startPlugin() {
		const parser = await getModule(['parse', 'parseTopic']);
		const process = this.process.bind(this);

		const ChannelAttachMenu = await getModule(
			m => m.default?.displayName == 'ChannelAttachMenu',
		);

		const uploadmenu = this.uploadmenu.bind(this);

		inject('tone-indicators-popup', parser, 'parse', process);
		inject(
			'tone-indicators-upload',
			ChannelAttachMenu,
			'default',
			uploadmenu,
		);
	}

	process(_args, res, ops = {}) {
		if (!Array.isArray(res)) return res;

		// Loop through each part of the message
		return res.map(el => {
			// If it's not a string we don't care about it
			if (typeof el !== 'string') return el;

			// Match tone indicators
			// https://regexr.com/6mhl5
			let indicators = el.split(
				/(?<=\p{P}|^|\s)\/([A-z]+)(?=\p{P}|$|\s)/gu,
			);
			// No mataches, just return as-is
			if (!indicators) return el;

			// Filter out any non-valid indicators

			// To store the finished parts
			let res = [];
			let wasLastInvalid = false;
			for (let [i, indicator] of indicators.entries()) {
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

	uploadmenu(_args, value) {
		value.props.children.push(
			React.createElement(MenuItem, {
				label: 'Insert Tone Indicator',
				id: 'Tone-Indicators-Popup',
				action: () => open(Modal),
			}),
		);
		return value;
	}

	pluginWillUnload() {
		powercord.api.settings.unregisterSettings(this.entityID);
		uninject('tone-indicators-popup');
		uninject('tone-indicators-upload');
	}
};

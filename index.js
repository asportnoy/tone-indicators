const {Plugin} = require('powercord/entities');
const {inject, uninject} = require('powercord/injector');
const {React, getModule} = require('powercord/webpack');
const INDICATORS = require('./indicators');

const StringPart = require('./Components/StringPart');

module.exports = class MessageTooltips extends Plugin {
	async startPlugin() {
		const parser = await getModule(['parse', 'parseTopic']);
		const process = this.process.bind(this);

		inject('message-tooltips', parser, 'parse', process);
	}

	process(_args, res, ops = {}) {
		if (!Array.isArray(res)) return res;

		// Get last element in res
		return res.map(el => {
			if (typeof el !== 'string') return el;

			// Match tone indicators
			let indicators = el.split(/\B\/(\w+)(?=\s|$)/g);
			if (!indicators) return el;

			// Filter out any non-valid indicators
			let res = [];
			let wasLastInvalid = false;
			for (let [i, indicator] of indicators.entries()) {
				// Even items are non-matches. Just add them back and continue
				if (i % 2 === 0) {
					// If the last indicator was invalid, this should be added to the most recent string instead of a new array element
					if (wasLastInvalid) res[res.length - 1] += indicator;
					else res.push(indicator);
					continue;
				}

				wasLastInvalid = false;

				// If an indicator is a match, just add it to the array
				if (INDICATORS.has(indicator.toLowerCase())) {
					res.push(indicator);
					continue;
				}

				// Invalid indicator
				// Add it to the last string and mark it as invalid
				res[res.length - 1] += '/' + indicator;
				wasLastInvalid = true;
			}

			return React.createElement(StringPart, {
				parts: res,
			});
		});
	}

	pluginWillUnload() {
		powercord.api.settings.unregisterSettings(this.entityID);
		uninject('message-tooltips');
	}
};

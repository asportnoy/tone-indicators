const {
	getModule,
	constants: {ComponentActions},
} = require('powercord/webpack');
const {ComponentDispatch} = getModule(['ComponentDispatch'], false);

const INDICATORS = require('./indicators');

function appendText(text) {
	ComponentDispatch.dispatchToLastSubscribed(ComponentActions.INSERT_TEXT, {
		plainText: ' ' + text,
		rawText: ' ' + text,
	});

	setTimeout(() => {
		ComponentDispatch.dispatchToLastSubscribed(
			ComponentActions.TEXTAREA_FOCUS,
		);
	}, 500);
}

function getIndicator(text) {
	text = text.toLowerCase();
	return INDICATORS.get(text) ?? INDICATORS.get('_' + text) ?? null;
}

module.exports = {
	appendText,
	getIndicator,
};

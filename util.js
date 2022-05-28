const {
	getModule,
	constants: {ComponentActions},
} = require('powercord/webpack');
const {ComponentDispatch} = getModule(['ComponentDispatch'], false);

const INDICATORS = require('./indicators');

/**
 * Append text to the content in the message box. Focuses the message box.
 * @param {string} text The text to be appended. A space will be prepended to this text.
 */
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

/**
 * Finds a tone indicator matching the given text
 * @param {string} text Tone indicator text
 * @returns {string | null} Tone indicator description, or null if not found
 */
function getIndicator(text) {
	text = text.toLowerCase();
	return INDICATORS.get(text) ?? INDICATORS.get('_' + text) ?? null;
}

module.exports = {
	appendText,
	getIndicator,
};

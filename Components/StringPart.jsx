const {React, getModuleByDisplayName} = require('powercord/webpack');
const INDICATORS = require('../indicators');
const {getIndicator} = require('../util');

const Tooltip = getModuleByDisplayName('Tooltip', false);

class StringPart extends React.PureComponent {
	render() {
		const {parts} = this.props;

		for (let i = 1; i < parts.length; i += 2) {
			let text = parts[i];
			if (typeof text !== 'string') continue;
			let tooltip = getIndicator(text.toLowerCase());

			parts[i] = (
				<Tooltip text={tooltip}>
					{props => (
						<span
							{...props}
							style={{
								backgroundColor:
									'var(--background-modifier-accent)',
								borderRadius: 3,
								padding: '0 2px',
							}}
						>
							/{text}
						</span>
					)}
				</Tooltip>
			);
		}

		return parts;
	}
}

module.exports = StringPart;

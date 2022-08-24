const { React, getModuleByDisplayName } = require('powercord/webpack');

const Tooltip = getModuleByDisplayName('Tooltip', false);

function ToneIndicator(node) {
	return <Tooltip text={node.desc}>
		{props =>
			<span
				{...props}
				style={{
					backgroundColor:
						'var(--background-modifier-accent)',
					borderRadius: 3,
					padding: '0 2px',
				}}
			>
				/{node.indicator}
			</span>
		}
	</Tooltip>;
}

module.exports = ToneIndicator;

const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = class Settings extends React.PureComponent {
	render() {
		const { getSetting, toggleSetting } = this.props;

		return (
			<div>
				<SwitchItem
					note="Show button to insert tone indicators in file upload menu"
					value={getSetting('showInsertToneBtn', true)}
					onChange={() => toggleSetting('showInsertToneBtn', true)}
				>
					Show Insert Button
				</SwitchItem>
			</div>
		);
	}
};

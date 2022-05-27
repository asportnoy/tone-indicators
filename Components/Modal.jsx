const {React, getModule} = require('powercord/webpack');
const {Modal} = require('powercord/components/modal');
const {close: closeModal} = require('powercord/modal');
const {
	FormTitle,
	Button,
	Text,
	Clickable,
	Card,
} = require('powercord/components');
const {TextInput} = require('powercord/components/settings');

const classes = getModule(['card', 'clickable'], false);

const INDICATORS = require('../indicators');
const {appendText} = require('../util');

module.exports = class ToneModal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			search: '',
		};
	}

	render() {
		return (
			<Modal className="powercord-text">
				<Modal.Header>
					<FormTitle tag="h4">Insert Tone Indicator</FormTitle>
				</Modal.Header>

				<Modal.Content>
					<TextInput
						style={{marginTop: 16}}
						placeholder="Search for a tone indicator"
						onChange={val => this.setState({search: val})}
						value={this.state.search}
						autoFocus
					></TextInput>
					{this.options(this.state.search.trim().toLowerCase())}
				</Modal.Content>

				<Modal.Footer>
					<Button
						color={Button.Colors.TRANSPARENT}
						look={Button.Looks.LINK}
						onClick={closeModal}
					>
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}

	options(search) {
		let val = [];

		for (let [key, value] of INDICATORS) {
			if (key.startsWith('_')) continue;

			if (
				search &&
				!('/' + key).includes(search) &&
				!value.toLowerCase().includes(search)
			)
				continue;

			val.push(
				<Clickable
					onClick={() => {
						closeModal();
						appendText('/' + key);
					}}
				>
					<Card
						className={[classes?.card, classes?.clickable].join(
							' ',
						)}
					>
						<Text className="size20-2yAqwX">/{key}</Text>
						<Text className="size12-12FL_s">{value}</Text>
					</Card>
				</Clickable>,
			);
		}

		return val;
	}
};

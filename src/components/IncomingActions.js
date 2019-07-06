// IncomingActions.js
// For actions on Incoming page (duh)

import React, { Component } from 'react';
import { SideNavDropDown } from './SideNav';

class IncomingActions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fromDate: ""
		}
		this.onChange = this.onChange.bind(this);
	}

	onChange(field, newValue) {
		switch (field) {
			case "newFromDate":
				this.setState({fromDate : newValue})
				break;
		
			default:
				break;
		}
	}

	render() {
		const btnClass = (this.props.chips > 0) ? "btn" : "btn disabled";
		const btnClassDate = (this.state.fromDate.length >= 6) && (this.props.newRows === 0)? "btn" : "btn disabled";
		const icon = (this.props.chips > 0) ? "play_circle_outline" : "check_box_outline_blank";

		return (
			<SideNavDropDown chip={this.props.chips} title="Acties" icon={icon}>
				<li>
					<div className="sidenav-input">
						<p>Update factuur categorie</p>
						<div className={btnClass} onClick={this.props.updateCat}>
							<i className="material-icons">insert_drive_file</i>
						</div>
					</div>
				</li>
				<li>
					<div className="sidenav-input">
						<p>Log creditcard betaling</p>
						<div className={btnClass} onClick={this.props.updatePayment}>
							<i className="material-icons">credit_card</i>
						</div>
					</div>
				</li>
				<li>
					<div className="sidenav-input">
						<p>Update std categorie</p>
						<div className={btnClass} onClick={this.props.updateStdCat}>
							<i className="material-icons">contacts</i>
						</div>
					</div>
				</li>
				<li>
					<div className="sidenav-input">
						<p>Download csv</p>
						<div className={btnClass} onClick={this.props.onDownload}>
							<i className="material-icons">cloud_download</i>
						</div>
					</div>
				</li>
				<li>
					<div className="sidenav-input">
						<div className="input-field" style={{ flex: 1, marginRight: '8px' }}>
							<input id="date" type="text"
								value={this.state.fromDate}
								onChange={(e) => this.onChange("newFromDate", e.target.value)} />
							<label htmlFor="date">Toegevoegd na jjjj-dd-mm</label>
						</div>
						<div className={btnClassDate}
							onClick={() => {
								this.props.onDownload2(this.state.fromDate);
								this.setState({ fromDate: "" });
							}}>
							Go
						</div>
					</div>
					<div className="sidenav-input">
						<p className="sub">(alleen als er geen onverwerkte facturen zijn; nu {this.props.newRows} )</p>
					</div>
				</li>
			</SideNavDropDown>
		);
	}
}

export default IncomingActions;
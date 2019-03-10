import React, { Component } from 'react';
import { SideNavDropDown } from './SideNav';


class ReceivedActions extends Component {
	constructor(props) {
		super(props);
		this.state = {
		}
	}
	render() {
		const btnClass = (this.props.chips >0)? "btn" : "btn disabled";
		const icon = (this.props.chips > 0)? "play_circle_outline" : "check_box_outline_blank";

		return (
			<SideNavDropDown chip={this.props.chips} title="Acties" icon={icon}>
					<li>
						<div className="sidenav-input">
		    				<p>Download csv</p>
		    				<div className={btnClass} onClick={this.props.onDownload}>
		    					<i className="material-icons">cloud_download</i>
		    				</div>
						</div>
					</li>
			</SideNavDropDown>
		);
	}
}

export default ReceivedActions;
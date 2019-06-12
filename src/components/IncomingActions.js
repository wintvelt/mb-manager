// IncomingFilters.js
// For displaying and managing filters in section on Incoming page

import React from 'react';
import { SideNavDropDown } from './SideNav';

const IncomingActions = (props) => {
	const btnClass = (props.chips >0)? "btn" : "btn disabled";
	const icon = (props.chips > 0)? "play_circle_outline" : "check_box_outline_blank";

	return (
		<SideNavDropDown chip={props.chips} title="Acties" icon={icon}>
			<li>
				<div className="sidenav-input">
	    				<p>Update factuur categorie</p>
	    				<div className={btnClass} onClick={props.updateCat}>
	    					<i className="material-icons">insert_drive_file</i>
	    				</div>
				</div>
	    	</li>
			<li>
				<div className="sidenav-input">
	    				<p>Log creditcard betaling</p>
	    				<div className={btnClass} onClick={props.updatePayment}>
	    					<i className="material-icons">credit_card</i>
	    				</div>
				</div>
			</li>
			<li>
				<div className="sidenav-input">
	    				<p>Update std categorie</p>
	    				<div className={btnClass} onClick={props.updateStdCat}>
	    					<i className="material-icons">contacts</i>
	    				</div>
				</div>
			</li>
			<li>
				<div className="sidenav-input">
	    				<p>Download csv</p>
	    				<div className={btnClass} onClick={props.onDownload}>
	    					<i className="material-icons">cloud_download</i>
	    				</div>
				</div>
			</li>
		</SideNavDropDown>
	);
}

export default IncomingActions;
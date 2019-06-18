// Connection.js
// for connecting to Moneybird

import React, { Component } from 'react';
import { connect } from "react-redux";
import { setAccess, getRequestToken, testAccess } from "../actions/apiActions";
import { logout } from "../actions/actions";
import { paramToObj } from "../constants/helpers";
import moment from 'moment';


const mapStateToProps = state => {
	return {
		accessObject: state.accessObject,
		accessVerified: state.accessVerified,
		testOutput: state.testOutput
	};
};

function mapDispatchToProps(dispatch) {
	return {
		setAccess: (reqToken) => dispatch(setAccess(reqToken)),
		testAccess: () => dispatch(testAccess()),
		logout: () => dispatch(logout())
	};
}

const IconOK = <i className="material-icons green-text">done</i>;
const IconOKOK = <i className="material-icons green-text">done_all</i>;
const IconNOK = <i className="material-icons grey-text">close</i>;

class ConnectionInt extends Component {
	constructor(props) {
		super(props);

		this.state = { requestToken : "" }

		this.onChange = this.onChange.bind(this);
	}

	onChange(e) {
		this.setState({ requestToken: e.target.value });
	}

	static getDerivedStateFromProps(props, state) {
		const code = paramToObj(props.location.search).code;
		if (state.requestToken === code) return { requestToken : "" };
		return { requestToken : code };
	}

	render() {
		const reqToken = this.state.requestToken;
		const hasAccess = (this.props.accessObject) ? true : false;
		const accessVerified = this.props.accessVerified;
		return (
			<div className="container">
				{hasAccess ?
					<div className="section">
						<h4>{(accessVerified) ? IconOKOK : IconOK} Je bent ingelogd {'\u00A0'}
							<span style={{ fontSize: "50%", color: "darkgrey" }}>
								({moment.unix(this.props.accessObject.created_at).fromNow()})
							</span>
						</h4>
						<p>
							<span className="btn" onClick={this.props.testAccess}>Verifieer Connectie</span>{'\u00A0'}
							<span className="btn" onClick={getRequestToken}>Log opnieuw in</span>{'\u00A0'}
							<span className="btn-flat" onClick={this.props.logout}>Uitloggen</span>
						</p>
						{accessVerified ? <p>{IconOK} Login is ook geverifieerd voor deze sessie</p> : <div></div>}
					</div>
					:
					(reqToken.length >0) ?
						<div className="section">
							<h4>{IconOK} Inlog moet nog geverifieerd worden</h4>
								<div>
								<p>Inloggegevens bekend</p>
								<p>
									<span className="btn"
										onClick={() => {
											this.props.setAccess(reqToken)
										}
									}>
										Inlog verifiëren
									</span>{'\u00A0'}
									<span className="btn-flat" onClick={getRequestToken}>Inlog opnieuw ophalen</span>
								</p>
							</div>
						</div>
						:
						<div className="section">
							<h4>{IconNOK} Er is nog geen geldige inlog</h4>
							<div>
								<p>Klik om bij Moneybird in te loggen</p>
								<p>
									<span className="btn" onClick={getRequestToken}>Inloggen</span>{'\u00A0'}
								</p>
								<p>(daarna kun je inlog verifiëren)</p>
							</div>
						</div>
				}
			</div>
		);
	}
}

const Connection = connect(mapStateToProps, mapDispatchToProps)(ConnectionInt);

export default Connection;
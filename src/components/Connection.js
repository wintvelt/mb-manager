// Connection.js
// for connecting to Moneybird

import React, { Component } from 'react';
import { connect } from "react-redux";
import { setAccess, getRequestToken, testAccess } from "../actions/apiActions";
import { paramToObj } from "../constants/helpers";

const mapStateToProps = state => {
	return {
		isConnected: state.isConnected,
		accessObject: state.accessObject,
		testOutput: state.testOutput
	};
};

function mapDispatchToProps(dispatch) {
	return {
		setAccess: (reqToken) => dispatch(setAccess(reqToken)),
		testAccess: () => dispatch(testAccess())
	};
}

const IconOK = <i className="material-icons green-text">done</i>;
const IconNOK = <i className="material-icons grey-text">radio_button_unchecked</i>;

const checkLi = (ok, itemText, itemTextNOK) => {
	if (ok) {
		return <li className="flex">{IconOK} {itemText}</li>
	} else {
		return <li className="flex">{IconNOK} {itemTextNOK}</li>
	}
}

function tbodyFromObj(object) {
	const row = (k, i) => trowFromItem(object, k, i);
	return (
		<tbody>
			{Object.keys(object).map(row)}
		</tbody>
	);
}

function trowFromItem(obj, key, index) {
	const short = (text) => {
		let value = text;
		if (value.length > 20) {
			value = value.substring(0, 8) + ".." + value.substring(value.length - 8);
		}
		return value;
	}
	return (
		<tr key={key}>
			<td>{key}</td>
			{obj[key] ?
				<td>{short(obj[key])}</td>
				:
				<td className="grey-text">(empty)</td>
			}
		</tr>
	);
}

class ConnectionInt extends Component {
	constructor(props) {
		super(props);

		this.state = { requestToken: "" };

		this.onChange = this.onChange.bind(this);
	}

	onChange(e) {
		this.setState({ requestToken: e.target.value });
	}

	render() {
		const reqToken = paramToObj(this.props.location.search).code || "";
		const hasAccess = (Object.entries(this.props.accessObject).length !== 0 || this.props.accessObject.constructor !== Object);
		const isConnected = this.props.isConnected;
		return (
			<div className="container">
				<div className="section">
					{hasAccess ?
						isConnected ?
							<h4>{IconOK} Connectie is actief</h4>
							:
							<h4>{IconOK} Alles klaar om connectie te maken</h4>
						:
						<h4>{IconNOK} Nog niet klaar voor connectie</h4>
					}
					<p>Om connectie te maken heb je een Access Object nodig.
		        Die kun je opvragen met een Request Token.</p>
					<div className="row">
						<ul className="col offset-s1">
							{checkLi(hasAccess, "Access Object is beschikbaar.",
								"Access Object is niet beschikbaar."
							)}
							{checkLi(this.props.isConnected, "Connectie werkt naar behoren.",
								"Connectie (nog) niet succesvol getest."
							)}
						</ul>
					</div>
					{hasAccess ?
						<span className="btn" onClick={this.props.testAccess}>Test connectie</span>
						:
						<p>Volg de stappen hieronder.</p>
					}
				</div>
				<div className="divider"></div>
				<div className="section">
					<h5>Access Object ophalen</h5>
					<p>Klik op de button, en kopieer de code die je op de pagina dan ziet.
		        Kom daarna terug naar deze pagina en plak het in het veld hieronder.</p>
					<p>Ook als je al een Access Object hebt, kun je een nieuwe Request Token ophalen.
		        Je oude Access Object blijft dan nog steeds gewoon werken.</p>
					<div className="row">
						<div className="col">
							<span className="waves-effect waves-light btn"
								onClick={getRequestToken}>
								Request token ophalen
	            			</span>
						</div>
					</div>
					{(reqToken) ?
						<div className="row">
							<p>Request token is: </p>
							<pre>{reqToken}</pre>
							<div className="col">
								<span className="waves-effect waves-light btn"
									onClick={() => {
										this.props.setAccess(reqToken)
									}
									}>
									Inwisselen
								</span>
							</div>
						</div>
						: <div></div>
					}
				</div>
				<div>
					<div className="section">
						<h5 id="access_title">Access Object</h5>
						<div className="row">
							<table className="striped">
								<thead>
									<tr>
										<th>Code</th>
										<th>Value</th>
									</tr>
								</thead>

								{tbodyFromObj(this.props.accessObject)}
							</table>
						</div>
						<div className="row">
							<p id="result_block" style={{ whiteSpace: "pre", fontFamily: "monospace" }}>
								{this.props.testOutput}
							</p>
						</div>
					</div>
				</div>
			</div >
		);
	}
}

const Connection = connect(mapStateToProps, mapDispatchToProps)(ConnectionInt);

export default Connection;

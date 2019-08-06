// Alles voor Ontvangen betalingen

import React, { Component } from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

import { getReceived, getAccounts } from "../actions/apiActions";
import { doSnack } from "../actions/actions";
import { SortableTable, tHeadAddSelect, toggleCell } from '../constants/table-helpers-2';
import { receivedRows, receivedHeaders } from '../constants/data-helpers-received';
import ReceivedFilters, { filterMonth, filterStatus, filterAmount, filterSearch, filterAccount } from './ReceivedFilters';
import ReceivedActions from './ReceivedActions';
import { downloadCsv } from '../constants/download-helpers';
import { SideNavWrapper, SideNav, MainWithSideNav } from './SideNav';

import { loadComp } from '../constants/helpers';

const mapStateToProps = state => {
	return {
		accessToken: state.accessToken,
		received: state.received,
		accounts: state.accounts,
		accountDate: state.accountDate
	};
};

function mapDispatchToProps(dispatch) {
	return {
		getReceived: () => dispatch(getReceived()),
		getAccounts: () => dispatch(getAccounts()),
		doSnack: (newSnack) => dispatch(doSnack(newSnack))
	};
}

class ConnectedReceived extends Component {
	constructor(props) {
		super(props);
		this.state = {
			monthFilter: [],
			amountFilter: [],
			statusFilter: true,
			searchFilter: "",
			accountFilter: [],
			selected: [],
			selFilter: false
		}
		this.onChangeFilters = this.onChangeFilters.bind(this);
		this.onSelect = this.onSelect.bind(this);
		this.onSelectAll = this.onSelectAll.bind(this);
		this.onDownload = this.onDownload.bind(this);

		if (!props.accounts.hasData && props.accessToken.hasData) {
			props.getAccounts();
		}
		if (!props.received.hasData && props.accessToken.hasData) {
			props.getReceived();
		}

	}
	onChangeFilters(newFilters) {
		const newList = newFilters.list || [];
		switch (newFilters.type) {
			case "month": {
				this.setState({
					monthFilter: newList
				});
				break;
			}
			case "amount": {
				this.setState({
					amountFilter: newList
				})
				break;
			}
			case "status": {
				this.setState({
					statusFilter: !this.state.statusFilter
				})
				break;
			}
			case "search": {
				this.setState({
					searchFilter: newList
				})
				break;
			}
			case "account": {
				this.setState({
					accountFilter: newList
				})
				break;
			}
			case "sel": {
				this.setState({
					selFilter: !this.state.selFilter
				})
				break;
			}
			default:
				break;
		}
	}
	onSelect(id) {
		const selectedWithout = this.state.selected.filter(i => (i !== id));
		const newSelected = (this.state.selected.length > 0
			&& selectedWithout.length !== this.state.selected.length) ?
			selectedWithout
			: [...this.state.selected, id];
		this.setState({
			selected: newSelected
		})
	}
	onSelectAll(currentSelectAll, visibleIds) {
		switch (currentSelectAll) {
			case "check_box_outline_blank": {
				this.setState({ selected: visibleIds });
				break;
			}
			default: {
				this.setState({ selected: [] });
			}
		}
	}
	onDownload(rowsRaw, selected) {
		const rowsFiltered =
			rowsRaw.filter(item => {
				return (selected.indexOf(item[0].value) !== -1)
			});
		downloadCsv(rowsFiltered, [2, 3, 6, 7], ["Datum", "Bedrag", "Naam", "Omschrijving"], "betalingen Mobly");
	}

	render() {
		const hasError = (this.props.accessToken.hasError
			|| this.props.accounts.hasError || this.props.received.hasError);
		const hasData = (!hasError && this.props.received.hasData);
		const hasAccounts = loadComp(this.props.accounts,
			'Bankrekeningen ophalen (ff bezig)', 'Ophalen bankrekeningen gefaald', 'bankrekeningen opgehaald');
		const hasReceived = loadComp(this.props.received,
			'Betalingen aan het ophalen', 'Ophalen van betalingen mislukt', 'betalingen opgehaald');
		const rowsRaw = (hasData && this.props.accounts.data.length > 0
			&& this.props.received.hasData) ?
			receivedRows(this.props.accounts.data, this.props.received.data)
			: null;

		if (rowsRaw) {
			const headers = tHeadAddSelect(receivedHeaders, this.onSelect, this.onSelectAll, 1);

			const monthOptions =
				["Deze maand", "Vorige maand", "Dit kwartaal", "Dit jaar"]
					.map(v => { return { value: v, label: v } });
			const amountOptions =
				["Alles", "Ontvangen", "Uitgegeven"]
					.map(v => { return { value: v, label: v } });
			const accountOptions =
				this.props.accounts.data
					.map(acc => { return { value: acc.name, label: acc.name } });

			const rows = rowsRaw
				.filter(row => filterMonth(row, this.state.monthFilter))
				.filter(row => filterStatus(row, this.state.statusFilter))
				.filter(row => filterAmount(row, this.state.amountFilter))
				.filter(row => filterSearch(row, this.state.searchFilter))
				.filter(row => filterAccount(row, this.state.accountFilter))
				.filter(row => (!this.state.selFilter || this.state.selected.length === 0 ||
					(this.state.selected.filter(i => (i === row[0].value)).length > 0)))
				.map(row => {
					if (this.state.selected.length === 0 ||
						(this.state.selected.filter(i => (i === row[0].value)).length === 0)) {
						// set to deselected
						return [...row.slice(0, 1), toggleCell(row[1], "check_box_outline_blank"),
						...row.slice(2)]
					} else {
						// set to selected
						return [...row.slice(0, 1), toggleCell(row[1], "check_box"),
						...row.slice(2)]
					}
				});

			const selectIcon = (this.state.selected.length === 0) ?
				"check_box_outline_blank"
				: (rows.filter(row => (
					this.state.selected.filter(sel => (sel === row[0].value))
				)).length === this.state.selected.length) ?
					"check_box"
					: "indeterminate_check_box";
			// store select icon and list of all visible IDs (used in select all)
			headers[1].value = selectIcon; // NB MUTABLE CHANGE!
			headers[1].visibleIds = rows.map(row => row[0].value); // NB MUTABLE CHANGE!

			return (
				<SideNavWrapper>
					<SideNav>
						<ReceivedFilters
							onChange={this.onChangeFilters}
							chip={rows.length + " van " + rowsRaw.length + " getoond"}
							monthOptions={monthOptions}
							monthFilter={this.state.monthFilter}
							amountOptions={amountOptions}
							amountFilter={this.state.amountFilter}
							statusFilter={this.state.statusFilter}
							accountOptions={accountOptions}
							accountFilter={this.state.accountFilter}
							selFilter={this.state.selFilter} />
						<li><div className="divider"></div></li>
						<ReceivedActions
							chips={this.state.selected.length}
							onDownload={() => this.onDownload(rowsRaw, this.state.selected)}
						/>
					</SideNav>
					<MainWithSideNav>
						<SortableTable headers={headers} rows={rows}
							onSelect={this.onSelect} hideKey={true} />
					</MainWithSideNav>
				</SideNavWrapper>
			);
		} else if (this.props.accessToken.hasData) {
			const hasError = (this.props.accounts.hasError ||
				this.props.received.hasError);
			return (
				<div className="container">
					<div className="section">
						<h4>Ontvangen betalingen</h4>
						{hasReceived}
						{hasAccounts}
					</div>
					<div className="divider"></div>
					<div className="section center">
						{(!hasError) ?
							<div className="progress">
								<div className="indeterminate"></div>
							</div>
							: <p>Er is iets misgegaan. Ik kan data nu niet ophalen.</p>
						}
					</div>
				</div>
			);
		}
		return (
			<div className="container">
				<div className="section center">
					<h5>Helaas, er is geen verbinding..</h5>
					<p>Probeer anders eerst connectie te maken..</p>
					<div>
						<Link to="/connection" className="flex flex-center">
							<i className="material-icons">account_circle</i>
							<span>Connectie</span>
						</Link>
					</div>
				</div>
			</div>
		);
	}
}

const Received = connect(mapStateToProps, mapDispatchToProps)(ConnectedReceived);


export default Received;
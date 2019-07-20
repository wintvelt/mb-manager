// Alles voor Contacten

import React, { Component } from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

import { getLedgers, getContacts, getCustomFields } from "../actions/apiActions";
import { batchContactUpdate, batchContactCustomUpdate } from '../actions/batchActions';
import { doSnack } from "../actions/actions";
import { SortableTable, tHeadAddSelect, toggleCell } from '../constants/table-helpers';
import {
	contactRows, contactHeaders,
	makeContactPatchList
} from '../constants/data-helpers-contacts';
import ContactFilters from './ContactFilters';
import ContactActions from './ContactActions';
import { downloadCsv } from '../constants/download-helpers';
import { SideNavWrapper, SideNav, MainWithSideNav } from './SideNav';


import { since } from '../constants/helpers';

const mapStateToProps = state => {
	return {
		accessToken: state.accessToken,
		ledgers: state.ledgers,
		ledgerDate: state.ledgerDate,
		contacts: state.contacts,
		contactsDate: state.contactsDate,
		customFields: state.customFields,
		customFieldsDate: state.customFieldsDate
	};
};

function mapDispatchToProps(dispatch) {
	return {
		getLedgers: () => dispatch(getLedgers()),
		getContacts: () => dispatch(getContacts()),
		getCustomFields: () => dispatch(getCustomFields()),
		doSnack: (newSnack) => dispatch(doSnack(newSnack)),
		batchContactUpdate: (patchList) => dispatch(batchContactUpdate(patchList)),
		batchContactCustomUpdate: (patchList) => dispatch(batchContactCustomUpdate(patchList))
	};
}

class ConnectedContacts extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ownerFilter: [],
			stdLedgerFilter: [],
			payFilter: [],
			contactFilter: [],
			EOLfilter: null,
			MBFilter: false,
			selected: [],
			selFilter: false
		}
		const hasError = (!props.accessToken);
		if (!props.ledgers && !hasError) {
			props.getLedgers();
		}
		if (!props.contacts && !hasError) {
			props.getContacts();
		}
		if (!props.customFields && !hasError) {
			props.getCustomFields();
		}

		this.onChangeFilters = this.onChangeFilters.bind(this);
		this.onSelect = this.onSelect.bind(this);
		this.onSelectAll = this.onSelectAll.bind(this);
		this.onPatch = this.onPatch.bind(this);
		this.onDownload = this.onDownload.bind(this);
	}
	onChangeFilters(newFilters) {
		const newList = newFilters.list || [];
		switch (newFilters.type) {
			case "owner": {
				this.setState({
					ownerFilter: newList
				})
				break;
			}
			case "contact": {
				this.setState({
					contactFilter: newList
				})
				break;
			}
			case "pay": {
				this.setState({
					payFilter: newList
				})
				break;
			}
			case "cat": {
				this.setState({
					stdLedgerFilter: newList
				})
				break;
			}
			case "EOL": {
				this.setState({
					EOLfilter: newFilters.list.value
				})
				break;
			}
			case "MB": {
				this.setState({
					MBFilter: !this.state.MBFilter
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
	onPatch(rowsRaw, selected, action) {
		const patchList = makeContactPatchList(rowsRaw, selected, action.fieldId, action.newValue);
		if (patchList.message) { this.props.doSnack(patchList.message) }
		if (action.fieldId === "customer_id" || action.fieldId === "mb_id") {
			this.props.batchContactUpdate(patchList.batchList);
		} else {
			this.props.batchContactCustomUpdate(patchList.batchList);
		}
	}
	onDownload(rowsRaw, selected) {
		const rowsFiltered =
			rowsRaw.filter(item => {
				return (selected.indexOf(item[0].value) !== -1)
			});
		downloadCsv(rowsFiltered, [0, 2, 3, 4, 7], ["ID", "Naam", "Stad", "Land", "Owner"], "Contacten Mobly");
	}

	render() {
		const hasError = (!this.props.accessToken);
		const hasData = (!hasError && this.props.ledgers && this.props.contacts && this.props.customFields);
		const hasLedgers = (this.props.ledgers) ?
			<p className="flex"><i className="material-icons green-text">done</i>
				<span>{this.props.ledgers.length + " ledgers opgehaald - " +
					since(this.props.ledgerDate)}</span></p>
			:
			<p className="flex"><i className="material-icons grey-text">radio_button_unchecked</i>
				<span>Legders (nog) niet gevonden</span></p>;
		const hasContacts = (this.props.contacts) ?
			<p className="flex"><i className="material-icons green-text">done</i>
				<span>{this.props.contacts.length + " contacten opgehaald - " +
					since(this.props.contactsDate)}</span></p>
			:
			<p className="flex"><i className="material-icons grey-text">radio_button_unchecked</i>
				<span>Contacten (nog) niet gevonden</span></p>;
		const hasCustomFields = (this.props.customFields) ?
			<p className="flex"><i className="material-icons green-text">done</i>
				<span>{this.props.customFields.length + " custom velden opgehaald - " +
					since(this.props.customFieldsDate)}</span></p>
			:
			<p className="flex"><i className="material-icons grey-text">radio_button_unchecked</i>
				<span>Custom velden (nog) niet gevonden</span></p>;
		const rowsRaw = (hasData
			&& this.props.ledgers.length > 0
			&& this.props.contacts.length > 0
			&& this.props.customFields.length > 0) ?
			contactRows(this.props.contacts)
			: null;

		if (rowsRaw) {
			const headers = tHeadAddSelect(contactHeaders, this.onSelect, this.onSelectAll, 1);

			const contactOptions =
				[...new Set(rowsRaw.map(row => row[2].value))]
					.sort().map(v => { return { value: v, label: v } });

			const ownerOptions =
				[...new Set(rowsRaw.map(row => row[7].value))]
					.sort().map(v => { return { value: v, label: v } });

			const stdLedgerOptions =
				[...new Set(rowsRaw.map(row => row[9].value))]
					.sort().map(v => { return { value: v, label: v } });

			const payOptions =
				[...new Set(rowsRaw.map(row => row[8].value))]
					.sort().map(v => { return { value: v, label: v } });

			const EOLOptions =
				["Alles", "Bekend", "Onbekend"]
					.map(v => { return { value: v, label: v } });

			const stdLedgerAllOptions = // for actions
				[...new Set(this.props.ledgers
					.filter(l => (l.account_type === "non_current_assets" || l.account_type === "expenses"))
					.map(l => l.name))]
					.sort().map(v => { return { value: v, label: v } });

			const rows = rowsRaw
				.filter(row => (this.state.ownerFilter.length === 0 ||
					(this.state.ownerFilter.filter(i => (i.value === row[7].value)).length > 0)))
				.filter(row => (this.state.contactFilter.length === 0 ||
					(this.state.contactFilter.filter(i => (i.value === row[2].value)).length > 0)))
				.filter(row => (this.state.payFilter.length === 0 ||
					(this.state.payFilter.filter(i => (i.value === row[8].value)).length > 0)))
				.filter(row => (this.state.stdLedgerFilter.length === 0 ||
					(this.state.stdLedgerFilter.filter(i => (i.value === row[9].value)).length > 0)))
				.filter(row => (!this.state.EOLfilter ||
					(this.state.EOLfilter === "Alles") ||
					(this.state.EOLfilter === "Bekend" && row[5].value !== "NA") ||
					(this.state.EOLfilter === "Onbekend" && row[5].value === "NA")))
				.filter(row => (!this.state.MBFilter ||
					(row[5].value !== row[6].value)))
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
						<ContactFilters
							onChange={this.onChangeFilters}
							chip={rows.length + " van " + rowsRaw.length}
							contactOptions={contactOptions}
							contactFilter={this.state.contactFilter}
							stdLedgerOptions={stdLedgerOptions}
							stdLedgerFilter={this.state.stdLedgerFilter}
							EOLOptions={EOLOptions}
							EOLfilter={this.state.EOLfilter}
							payOptions={payOptions}
							payFilter={this.state.payFilter}
							ownerOptions={ownerOptions}
							ownerFilter={this.state.ownerFilter}
							selFilter={this.state.selFilter} />
						<li><div className="divider"></div></li>
						<ContactActions
							chips={this.state.selected.length}
							stdLedgerOptions={stdLedgerAllOptions}
							onPatch={(action) => this.onPatch(rowsRaw, this.state.selected, action)}
							onDownload={() => this.onDownload(rowsRaw, this.state.selected)}
						/>
					</SideNav>
					<MainWithSideNav>
						<div className="section">
							<SortableTable headers={headers} rows={rows}
								onSelect={this.onSelect} hideKey={true} />
						</div>
					</MainWithSideNav>
				</SideNavWrapper>
			);
		} else if (this.props.accessToken) {
			return (
				<div className="container">
					<div className="section">
						<h4>Contacten</h4>
						{hasLedgers}
						{hasContacts}
						{hasCustomFields}
					</div>
					<div className="divider"></div>
					<div className="section center">
						<div className="progress">
							<div className="indeterminate"></div>
						</div>
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

const Contacts = connect(mapStateToProps, mapDispatchToProps)(ConnectedContacts);


export default Contacts;
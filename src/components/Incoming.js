// Alles voor facturen (inkomend)

import React, { Component } from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

import { getLedgers, getIncoming } from "../actions/apiActions";
import { batchLedgerUpdate, batchContactCustomUpdate, batchPaymentUpdate } from '../actions/batchActions';
import { doSnack } from "../actions/actions";
import { SortableTable, tHeadAddSelect, toggleCell } from '../constants/table-helpers-2';
import {
	incomingRows, incomingHeaders,
	makePatchList, makeContactList, makePaymentList
} from '../constants/data-helpers-incoming';
import IncomingFilters from './IncomingFilters';
import IncomingActions from './IncomingActions';
import { SideNavWrapper, SideNav, MainWithSideNav } from './SideNav';
import { downloadCsv } from '../constants/download-helpers';

import { since } from '../constants/helpers';

const mapStateToProps = state => {
	return {
		accessObject: state.accessObject,
		ledgers: state.ledgers,
		ledgerDate: state.ledgerDate,
		incoming: state.incoming,
		incomingDate: state.incomingDate
	};
};

function mapDispatchToProps(dispatch) {
	return {
		getLedgers: () => dispatch(getLedgers()),
		getIncoming: (type) => dispatch(getIncoming(type)),
		doSnack: (newSnack) => dispatch(doSnack(newSnack)),
		batchLedgerUpdate: (patchList) => dispatch(batchLedgerUpdate(patchList)),
		batchContactCustomUpdate: (patchList) => dispatch(batchContactCustomUpdate(patchList)),
		batchPaymentUpdate: (patchList) => dispatch(batchPaymentUpdate(patchList))
	};
}

class ConnectedIncoming extends Component {
	constructor(props) {
		super(props);

		const hasError = (!props.accessObject);
		if (!props.ledgers && !hasError) {
			props.getLedgers();
		}
		if (!props.incoming && !hasError) {
			props.getIncoming('receipt');
			props.getIncoming('purchase_invoice');
		}

		this.state = {
			catDeltaFilter: false,
			catFilter: [],
			statusFilter: null,
			ownerFilter: [],
			payFilter: [],
			supplierFilter: [],
			selected: [],
			selFilter: false
		}
		this.onChangeFilters = this.onChangeFilters.bind(this);
		this.onSelect = this.onSelect.bind(this);
		this.onSelectAll = this.onSelectAll.bind(this);
		this.onPatch = this.onPatch.bind(this);
		this.onPatchStd = this.onPatchStd.bind(this);
		this.onDownload = this.onDownload.bind(this);
	}
	onChangeFilters(newFilters) {
		const newList = newFilters.list || [];
		switch (newFilters.type) {
			case "catDelta": {
				this.setState({
					catDeltaFilter: !this.state.catDeltaFilter
				})
				break;
			}
			case "cat": {
				this.setState({
					catFilter: newList
				})
				break;
			}
			case "status": {
				this.setState({
					statusFilter: newList
				})
				break;
			}
			case "pay": {
				this.setState({
					payFilter: newList
				})
				break;
			}
			case "owner": {
				this.setState({
					ownerFilter: newList
				})
				break;
			}
			case "supplier": {
				this.setState({
					supplierFilter: newList
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
			selected: newSelected,
			selFilter: (newSelected.length > 0) ? this.state.selFilter : false
		})
	}
	onSelectAll(currentSelectAll, visibleIds) {
		switch (currentSelectAll) {
			case "check_box_outline_blank": {
				this.setState({
					selected: visibleIds,
					selFilter: (visibleIds.length > 0) ? this.state.selFilter : false
				});
				break;
			}
			default: {
				this.setState({ selected: [], selFilter: false });
			}
		}
	}
	onPatch(rowsRaw, selected) {
		const patchList = makePatchList(rowsRaw, selected);
		this.props.doSnack(patchList.message);
		this.props.batchLedgerUpdate(patchList.batchList);
		this.setState({
			catDeltaFilter: false,
			catFilter: [],
			statusFilter: null,
			ownerFilter: [],
			payFilter: [],
			supplierFilter: [],
			selFilter: true
		});
	}
	onPatchStd(rowsRaw, selected) {
		const patchList = makeContactList(rowsRaw, selected);
		this.props.doSnack(patchList.message);
		this.props.batchContactCustomUpdate(patchList.batchList);
		this.setState({
			catDeltaFilter: false,
			catFilter: [],
			statusFilter: null,
			ownerFilter: [],
			payFilter: [],
			supplierFilter: [],
			selFilter: true
		});
	}
	onPatchPay(rowsRaw, selected) {
		const patchList = makePaymentList(rowsRaw, selected);
		this.props.doSnack(patchList.message);
		this.props.batchPaymentUpdate(patchList.batchList);
		this.setState({
			catDeltaFilter: false,
			catFilter: [],
			statusFilter: null,
			ownerFilter: [],
			payFilter: [],
			supplierFilter: [],
			selFilter: true
		});
	}
	onDownload(rowsRaw, selected) {
		const rowsFiltered = 
				rowsRaw.filter( item => {
						return (selected.indexOf(item[0].value) !== -1)
				});
		downloadCsv(
			rowsFiltered, 
			[0,2,3,5,6,7,8], 
			["ID", "Datum", "Leverancier","Bedrag", "Status", "Owner", "Categorie"], 
			"Facturen Mobly"
		);
	}


	render() {
		const hasError = (!this.props.accessObject);
		const hasData = (!hasError && this.props.ledgers && this.props.incoming);

		const hasLedgers = (this.props.ledgers) ?
			<p className="flex"><i className="material-icons green-text">done</i>
				<span>{this.props.ledgers.length + " ledgers opgehaald - " +
					since(this.props.ledgerDate)}</span></p>
			:
			<p className="flex"><i className="material-icons grey-text">radio_button_unchecked</i>
				<span>Legders (nog) niet gevonden</span></p>;
		const hasIncoming = (this.props.incoming) ?
			<p className="flex"><i className="material-icons green-text">done</i>
				<span>{this.props.incoming.length + " inkomende facturen opgehaald - " +
					since(this.props.incomingDate)}</span></p>
			:
			<p className="flex"><i className="material-icons grey-text">radio_button_unchecked</i>
				<span>Inkomende facturen (nog) niet gevonden</span></p>;
		const rowsRaw = (hasData
			&& this.props.ledgers.length > 0
			&& this.props.incoming.length > 0) ?
			incomingRows(this.props.ledgers, this.props.incoming)
			: null;

		if (rowsRaw) {
			const headers = tHeadAddSelect(incomingHeaders, this.onSelect, this.onSelectAll, 1);

			const statusOptions =
				[...new Set(rowsRaw.map(row => row[7].value))]
					.sort().map(v => { return { value: v, label: v } });
			const catOptions =
				[...new Set(rowsRaw.map(row => row[9].value))]
					.sort().map(v => { return { value: v, label: v } });
			const payOptions =
				[...new Set(rowsRaw.map(row => row[11].data))]
					.sort().map(v => { return { value: v, label: v } });
			const supplierOptions =
				[...new Set(rowsRaw.map(row => row[3].value))]
					.sort().map(v => { return { value: v, label: v } });
			const ownerOptions =
				[...new Set(rowsRaw.map(row => row[8].value))]
					.sort().map(v => { return { value: v, label: v } });

			const statusFilter = this.state.statusFilter ||
				statusOptions.filter(item => (item.value !== "new"));

			const rows = rowsRaw
				.filter(row => (!this.state.catDeltaFilter || (row[10].value !== row[9].value)))
				.filter(row => (this.state.catFilter.length === 0 ||
					(this.state.catFilter.filter(i => (i.value === row[9].value)).length > 0)))
				.filter(row => (statusFilter.length === 0 ||
					(statusFilter.filter(i => (i.value === row[7].value)).length > 0)))
				.filter(row => (this.state.ownerFilter.length === 0 ||
					(this.state.ownerFilter.filter(i => (i.value === row[8].value)).length > 0)))
				.filter(row => (this.state.payFilter.length === 0 ||
					(this.state.payFilter.filter(i => (i.value === row[11].data)).length > 0)))
				.filter(row => (this.state.supplierFilter.length === 0 ||
					(this.state.supplierFilter.filter(i => (i.value === row[3].value)).length > 0)))
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
						<IncomingFilters
							onChange={this.onChangeFilters}
							chip={rows.length + " van " + rowsRaw.length}
							catDeltaFilter={this.state.catDeltaFilter}
							catFilter={this.state.catFilter}
							catOptions={catOptions}
							statusOptions={statusOptions}
							statusFilter={statusFilter}
							payOptions={payOptions}
							payFilter={this.state.payFilter}
							ownerOptions={ownerOptions}
							ownerFilter={this.state.ownerFilter}
							supplierOptions={supplierOptions}
							supplierFilter={this.state.supplierFilter}
							selFilter={this.state.selFilter}
							hasSelection={(this.state.selected.length > 0)}
						/>
						<li><div className="divider"></div></li>
						<IncomingActions
							chips={this.state.selected.length}
							updateCat={() => this.onPatch(rowsRaw, this.state.selected)}
							updateStdCat={() => this.onPatchStd(rowsRaw, this.state.selected)}
							updatePayment={() => this.onPatchPay(rowsRaw, this.state.selected)}
							onDownload={() => this.onDownload(rowsRaw, this.state.selected)}
						/>
					</SideNav>
					<MainWithSideNav>
						<SortableTable headers={headers} rows={rows}
							onSelect={this.onSelect} hideKey={true} />
					</MainWithSideNav>
				</SideNavWrapper>
			);
		} else if (this.props.accessObject) {
			return (
				<div className="container">
					<div className="section">
						<h4>Inkomende Facturen</h4>
						{hasLedgers}
						{hasIncoming}
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

const Incoming = connect(mapStateToProps, mapDispatchToProps)(ConnectedIncoming);


export default Incoming;
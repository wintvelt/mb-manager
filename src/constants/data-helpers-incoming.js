// data-helpers-incoming
// bevat ook tabel-bouw functies en tabel logica voor incoming

import { tHead, tCell } from '../constants/table-helpers-2';
import { adminCode } from '../actions/apiActions';
import { uniqByKey } from '../constants/helpers';

// potentially move to Incoming Component..
export const ledgerDict = (ledgerList = []) => {
	if (!ledgerList) return {};
	return ledgerList.reduce( (obj, ledger) => {
		const newObj = Object.assign({},obj);
		newObj[ledger.id] = ledger.name;
		return newObj;
	},{})
}

export const incomingHeaders = [
	"Key", 
	{ value: "check_box_outline_blank", align: "center", sortable: false, icon: true, width: "2em", column: 0 },
	{ value: "Datum", width: "8em", column: 1 },
	{ value: "Leverancier", width: "20em", column: 1, shorten: false },
	{ value: "Factuur-ref", width: "25em", column: 1, shorten: false },
	{ value: "Bedrag", align: "right", width: "180px", column: 2, className: "large-text", amount: true }, 
	{ value: "Valuta", align: "right", width: "180px", column: 2 }, 
	{ value: "Status", align: "right", label: true, width: "180px", column: 2 }, 
	{ value: "Owner", align: "center", width: "8em", column: 3 },
	{ value: "Categorie factuur", width: "25em", column: 4, shorten: false },
	{ value: "Standaard categorie",width: "25em", column: 4, shorten: false },
	{ value: "Betaling", align: "center", sortable: true, icon: true, width: "8em", column: 3 },
	{ value: "Link", align: "right", sortable: false, icon: true, column: 5, width: '3em' },
	{ value: "CreateDate", hidden: false, column: 1 }
].map(tHead);

const incomingIds = [ 
	[ "id" ], null, [ "date" ], [ "contact" ], [ "reference" ], [ "total_price_incl_tax" ], [ "currency" ],
	[ "state" ], [ "contact", "custom_fields", 0, "value" ], [ "details", 0, "ledger_account_id" ],
	[ "contact", "custom_fields", 2, "value" ], [ "contact", "custom_fields", 1, "value" ], 
	[ "id" ], [ "created_at" ]
];

export const incomingRows = (ledgerList, incomingList) => {
	const ledgers = ledgerDict(ledgerList);
	if (!ledgerDict || !incomingList || incomingList.length === 0) return null;
	return incomingList.map( (incoming, i) => {
		const rowValues = incomingIds.map( (idArr, j) => mapToVal(idArr, j, incoming, ledgers));
		return rowValues.map( (val, k ) => valToCell(val, k, rowValues[10]));
	});
}

// generic helpers, gets value (string or { value, href } from nested object based on key array
const getVal = (idArr, obj) => {
	if (obj && obj.hasOwnProperty(idArr[0])) {
		const val = obj[idArr[0]];
		if (idArr.length > 1) { 
			return getVal(idArr.slice(1,), val)
		} else {
			return val;
		}
	} else {
		return "(onbekend)";
	}
}

// Create our number formatter.
var formatter = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 2,
});

// returns formatted string or { value, href }
const mapToVal = (idArr, i, incoming, ledgers) => {
	if (!idArr) return "check_box_outline_blank"; // select field if no idArr
	const value = getVal(idArr, incoming);
	if (i === 9) return ledgers[value]; // get ledger name from id
	if (i === 7 && value === "pending_payment") return "pending"; // shorten payment status
	if (i === 5 && value) return formatter.format(value); // format amount
	if (i === 3 && value && value.hasOwnProperty('id')) { // contact
		const href = "https://moneybird.com/" + adminCode + "/contacts/" + value.id;
		return { value: value.company_name, href: href, data: value.id } 
	}

	return value;
}

const valToCell = (val, i, stdLedger) => {
	if (i === 9) { // ledger in incoming invoice, check against standard
		const cellObj = (val === stdLedger)? 
			{ value: val, className: "green-text", data: val } 
			: { value: val, className: "red-text text-lighten-2", data: val } ;
		return tCell(cellObj);
	}
	if (i === 11) { // payment icon
		const celVal = 	(val === "Bank")? "account_balance" : "credit_card";
		return tCell({ value: celVal, data: val});
	}
	if (i === 12) { // return link
		const href = "https://moneybird.com/"+adminCode+"/documents/"+val;
		return tCell({ value: "arrow_forward", href: href })
	}
	return tCell(val);
}

// to create a list of batch changes: [ { incomingId, newLedgerName } ]
// from a list of selected incomingIds

// small helper
const regels = (num) => {
	return (num === 1)? "1 regel":
	num + " regels";
}

// helper to filter out rows without need for change
// returns { rows, message }
const filterRows = (rows, checkCat) => {
	var msg = [];
	// remove rows with status - new
	const notNewRows = rows.filter( s => (s[6].value !== "new"));
	const newRows = rows.length - notNewRows.length;
	if (newRows > 0) { msg = [ regels(newRows) + " met status \"nieuw\""] };
	// remove rows without contact
	const rowsWithContact = notNewRows.filter( s => (s[3].value));
	const withoutContact = notNewRows.length - rowsWithContact.length;
	if (withoutContact > 0) { msg = [ regels(withoutContact) + " zonder contact"] };
	// remove rows without std categorie
	const rowsWithStd = rowsWithContact.filter( s => (s[10].value));
	const withoutStd = rowsWithContact.length - rowsWithStd.length;
	if (withoutStd > 0 && checkCat) { msg = [ ...msg, regels(withoutStd) + " zonder standaard categorie"] };
	// remove rows where categorie already ok
	const rowsToDo = (checkCat)?
		rowsWithStd.filter( s => (s[10].value !== s[9].value))
		: rowsWithContact;
	const rowsOK = rowsWithStd.length - rowsToDo.length;
	if (rowsOK > 0 && checkCat) { msg = [ ...msg, regels(rowsOK) + " waar categorie al OK was"] };

	msg = [...msg, regels(rowsToDo.length) + " om te verwerken."];
	const message = msg.join(', ');

	return { rows : rowsToDo, message: message};
}


// batch change function for incoming invoices
// to change category
// returns { batchList, message }
export const makePatchList = (rows, selectedList) => {
	const selectedRows = rows.filter((row) => {
		return (selectedList.filter( s => {return (row[0].value === s)}).length > 0)
	});
	// filter out rows without need for change
	const rowsToDo = filterRows(selectedRows, true);

	// create list of { incomingId, newLedgerId }
	const batchChanges = rowsToDo.rows.map( (r) => { 
		return { incomingId: r[0].value, newLedgerName: r[10].value }
	});
	return { batchList : batchChanges, message : rowsToDo.message }
}

// batch change function contacts
// to change standard category in contact to category from invoice
// returns { batchList: [{ contactId, fieldId, newValue }], message }
export const makeContactList = (rows, selectedList) => {
	const selectedRows = rows.filter((row) => {
		return (selectedList.filter( s => {return (row[0].value === s)}).length > 0)
	});
	// filter out rows without need for change
	const rowsToDo = filterRows(selectedRows, true);

	// create list of { contactId, newStdLedgerId }
	const batchChanges = rowsToDo.rows.map( (r) => { 
		return { 
			contactId: r[3].data, 
			fieldId: "243301268733298558",
			newValue: r[9].value 
		}
	});
	const batchListUniq = uniqByKey(batchChanges, "contactId");

	return { batchList : batchListUniq, message : rowsToDo.message }
}

// to make payments
// returns { batchList, message }
export const makePaymentList = (rows, selectedList) => {
	const selectedRows = rows.filter((row) => {
		return (selectedList.filter( s => {return (row[0].value === s)}).length > 0)
	});
	// filter out rows without need for change
	const rowsToDo = filterRows(selectedRows, false);

	// create list of { incomingId, newLedgerId }
	const batchChanges = rowsToDo.rows.map( (r) => { 
		return { incomingId: r[0].value }
	});
	return { batchList : batchChanges, message : rowsToDo.message }
}

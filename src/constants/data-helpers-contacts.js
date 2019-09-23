// data-helpers-incoming
// bevat ook tabel-bouw functies en tabel logica voor incoming

import { tHead, tCell } from '../constants/table-helpers';
import { adminCode } from '../store/apiActions';
import { idLookup } from './file-imported';

// potentially move to Incoming Component..
export const ledgerDict = (ledgerList = []) => {
	if (!ledgerList) return {};
	return ledgerList.reduce( (obj, ledger) => {
		const newObj = Object.assign({},obj);
		newObj[ledger.id] = ledger.name;
		return newObj;
	},{})
}

export const contactHeaders = [
	"Key", { value: "check_box_outline_blank", align: "center", sortable: false, icon: true },
	"Leverancier", "Stad", "Land", "EOL nr", "MB nr",
	"Owner", "Standaard betaling", "Standaard categorie",
	{ value: "Link", align: "center", sortable: false, icon: true }
].map(tHead);

const contactIds = [ 
	[ "id" ], null, [ "company_name" ], [ "city" ], ["country"],
	[ "company_name" ], [ "customer_id"],
	[ "custom_fields", 0, "value" ], 
	[ "custom_fields", 1, "value" ], 
	[ "custom_fields", 2, "value" ], 
	[ "id" ]
];

export const contactRows = (contactList) => {
	return contactList.map( (contact, i) => {
		const rowValues = contactIds.map( (idArr, j) => mapToVal(idArr, j, contact));
		return rowValues.map( (val, k ) => valToCell(val, k));
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

// returns formatted string or { value, href }
// also room to change/ adapt any data in cell
const mapToVal = (idArr, i, contact) => {
	if (!idArr) return "check_box_outline_blank"; // select field if no idArr
	const value = getVal(idArr, contact);
	return value;
}

const valToCell = (val, i) => {
	if (i === 10) { // return link
		const href = "https://moneybird.com/"+adminCode+"/contacts/"+val;
		return tCell({ value: "arrow_forward", href: href })
	}
	if (i === 5) { // get EOL nr from list
		return tCell(idLookup(val));
	}
	return tCell(val);
}

// to create a list of batch changes: [ { contactId, fieldId, newValue } ]
// from a list of selected contacts


// helper to filter out rows without need for change
// returns { rows, message }
const filterRows = (rows, fieldId) => {
	var messages;
	if (fieldId === "customer_id") {
		const filteredRows = rows.filter( row => row[5].value !== "NA" );
		const rowsNot = rows.length - filteredRows.length;
		messages = (rowsNot > 0)? [ rowsNot+" regels zonder EOL nr" ] : [];
		const filteredRows2 = filteredRows.filter( row => row[5].value !== row[6].value );
		const rowsEq = filteredRows.length - filteredRows2.length;
		if (rowsEq > 0) { messages = [...messages, rowsEq+" regels al OK"]}
		return { rows : filteredRows2, message: messages.join(", ") };
	}
	if (fieldId === "mb_id") {
		const filteredRows = rows.filter( row => !row[6].value.includes("MB") );
		const rowsNot = rows.length - filteredRows.length;
		messages = (rowsNot > 0)? [ rowsNot+" regels die al MB nr zijn" ] : [];
		return { rows : filteredRows, message: messages.join(", ") };
	}
	return { rows : rows, message: ""};
}

// batch change function contacts
// to change a contact field
// returns { batchList: [{ contactId, fieldId, newValue }], message }
export const makeContactPatchList = (rows, selectedList, fieldId, value) => {
	const selectedRows = rows.filter((row) => {
		return (selectedList.filter( s => {return (row[0].value === s)}).length > 0)
	});
	// filter out rows without need for change
	const rowsToDo = filterRows(selectedRows, fieldId);

	// create list of { contactId, newStdLedgerId }
	const batchChanges = rowsToDo.rows.map( (r) => { 
		var newValue;
		switch (fieldId) {
			case "customer_id": {
				newValue = r[5].value;
				break;
			}
			case "mb_id": {
				newValue = "MB"+r[6].value;
				break;
			}
			default: { 
				newValue = value;
			}
		}
		return { 
			contactId: r[0].value, 
			fieldId: (fieldId === "mb_id")? "customer_id":fieldId,
			newValue: newValue 
		}
	});

	return { batchList : batchChanges, message : rowsToDo.message }
}
// batchActions.js
// also for middleware
import { setBatchError,
	setIncomingLedger, setIncomingCustomField, setIncomingPayment,
	setContactField, setContactCustomField, 
	doSnack, setBatchMsg, clearBatchMsg } from './actions';
import { patchIncomingLedger, patchContactField, patchPayment } from './apiActions';


// batchList = [ { incomingId, newLedgerId } ]
export function batchLedgTest(batchList) {
	return function(dispatch) {
		batchList.forEach( (payload) => {
			dispatch(setIncomingLedger(payload))
		});
	}
}

// to process a list of ledger-changes (change ledger in invoicing to contact standard)
// batchList = [ { incomingId, newLedgerName } ]
export function batchLedgerUpdate(batchList) {
	return function(dispatch, getState) {
		const { ledgers, incoming, accessObject } = getState();
		if (ledgers && ledgers.length > 0 && incoming && incoming.length > 0 && accessObject) {
			// we have data to process
			const newBatchList = batchList.map( (item) => {
				// gets LedgerId from ledgers from store
				return Object.assign(
					{}, item, 
					{ newLedgerId: getLedgerId(item.newLedgerName, ledgers) }
					)
			});
			const newBatchListClean = newBatchList.filter( item => (item.newLedgerId));
			// removes invalid or missing ledgers
			const invalidLedgers = (newBatchList.length - newBatchListClean.length);
			if (invalidLedgers > 0) {
				const msg = invalidLedgers + " met incorrecte standaard cat";
				dispatch(doSnack(msg));
			}
			// loop over cleaned list
			newBatchListClean.forEach( (item) => {
				// optimistic update of store
				dispatch(setIncomingLedger(item));
				// set message
				const initialPayload = {
					batchId: "incoming",
					fetchId: item.incomingId,
					res: false,
					msg: ""
				}
				dispatch(setBatchCheckMsg(initialPayload));
				// send single update to server + update batchMsg with response
				const patchBody = patchFrom(item.incomingId, item.newLedgerId, incoming);
				dispatch(
					patchIncomingLedger("incoming", item.incomingId, patchBody, accessObject.access_token)
				).then( payload => dispatch(setBatchCheckMsg(payload)));
			});
		} else {
			dispatch(doSnack("Ledgers of Inkomende facturen (nog) niet geladen"));
		}
	}
}

// to process a list of payments for incoming invoices
// for payments done with credit card
// batchList = [ { incomingId, newLedgerName } ]
export function batchPaymentUpdate(batchList) {
	return function(dispatch, getState) {
		const { incoming, accessObject } = getState();
		if (incoming && incoming.length > 0 && accessObject) {
			// we have incoming
			const incomingList = batchList.map( item => {
				return getOneIncoming(incoming, item.incomingId)
			});
			const incomingListClean = incomingList.filter( item => {
				return (item.payments.length === 0)
			});
			// loop over cleaned list
			const havePayment = incomingList.length - incomingListClean.length;
			if (havePayment > 0) {
				const msg = stringFromMsg(havePayment, "facturen met al (deels) betaling");
				dispatch(doSnack(msg));
			}
			incomingListClean.forEach( (item) => {
				// set message
				const initialPayload = {
					batchId: "payment",
					fetchId: item.id,
					res: false,
					msg: ""
				}
				dispatch(setBatchCheckMsg(initialPayload));
				// send single update to server + update batchMsg with response
				const patchBody = patchPayFrom(item);
				dispatch(
					patchPayment("payment", item.id, patchBody, accessObject.access_token)
				).then( payload => {
					dispatch(setBatchCheckMsg(payload));
					//  update of store (incoming)
					dispatch(setIncomingPayment({ incomingId: item.id }));
				})
				.catch( err => {
					const payload = Object.assign({}, initialPayload, { 
						msg: "regels zijn niet gelukt :(",
						res: true,
						error: true
					})
					dispatch(setBatchCheckMsg(payload));
					dispatch(setBatchError(true));
				});
			});
		} else {
			dispatch(doSnack("Inkomende facturen (nog) niet geladen"));
		}
	}
}

// to process a list of custom field-changes in a contact
// batchList = [ { contactId, fieldId, customFieldValue } ]
export function batchContactCustomUpdate(batchList) {
	return function(dispatch, getState) {
		const { batchError, accessObject } = getState();
		if (accessObject) {
			// we have data to process - by default
			dispatch(setBatchError(false));
			// loop over cleaned list
			batchList.forEach( (item) => {
				// set message
				const initialPayload = {
					batchId: "newCustom",
					fetchId: item.contactId,
					res: false,
					error: false,
					msg: ""
				}
				dispatch(setBatchCheckMsg(initialPayload));
				if (!batchError) {
					// send single update to server + update batchMsg with response
					const patchBody = makeCustomFieldBody(item.fieldId, item.newValue);
					dispatch(
						patchContactField("newCustom", item.contactId, patchBody, accessObject.access_token)
					).then( payload => {
						dispatch(setBatchCheckMsg(payload));
						//  update of store (contacts, and incoming)
						dispatch(setContactCustomField(item));
						dispatch(setIncomingCustomField(item));
					})
					.catch( err => {
						const payload = Object.assign({}, initialPayload, { 
							msg: "regels met fout \""+err.message+"\"",
							res: true,
							error: true
						})
						dispatch(setBatchCheckMsg(payload));
						dispatch(setBatchError(true));
					});
				} else {
					const payload = Object.assign({}, initialPayload, { 
						msg: "regels overgeslagen",
						res: true,
						error: true
					})
					dispatch(setBatchCheckMsg(payload));
				}
			});
		} else {
			dispatch(doSnack("Contacten (nog) niet geladen of fout in connectie"));
		}
	}
}

// to process a list of field-changes in a contact
// batchList = [ { contactId, fieldId, fieldValue } ]
export function batchContactUpdate(batchList) {
	return function(dispatch, getState) {
		const { batchError, accessObject } = getState();
		if (accessObject) {
			// we have data to process - by default
			dispatch(setBatchError(false));
			// loop over cleaned list
			batchList.forEach( (item) => {
				// set message
				const initialPayload = {
					batchId: "newValue",
					fetchId: item.contactId,
					res: false,
					error: false,
					msg: ""
				}
				dispatch(setBatchCheckMsg(initialPayload));
				if (!batchError) {
					// send single update to server + update batchMsg with response
					const patchBody = makeContactFieldBody(item.fieldId, item.newValue);
					dispatch(
						patchContactField("newValue", item.contactId, patchBody, accessObject.access_token)
					).then( payload => {
						dispatch(setBatchCheckMsg(payload));
						//  update of store (contacts, and incoming)
						dispatch(setContactField(item));
					})
					.catch( err => {
						const payload = Object.assign({}, initialPayload, { 
							msg: "regels met fout \""+err.message+"\"",
							res: true,
							error: true
						})
						dispatch(setBatchCheckMsg(payload));
						dispatch(setBatchError(true));
					});
				} else {
					const payload = Object.assign({}, initialPayload, { 
						msg: "regels overgeslagen",
						res: true,
						error: true
					})
					dispatch(setBatchCheckMsg(payload));
				}
			});
		} else {
			dispatch(doSnack("Contacten (nog) niet geladen of fout in connectie"));
		}
	}
}

// for single batch message setting + check to do snack and clear if needed
export function setBatchCheckMsg({batchId, fetchId, res, msg}) {
	return function(dispatch, getState) {
		const payload = {
			batchId: batchId,
			fetchId: fetchId,
			res: res,
			msg: msg
		}
		dispatch(setBatchMsg(payload));
		const { batchMsg } = getState();
		if (batchMsg[batchId]) {
			const allFetches = batchMsg[batchId].length;
			const completeFetches = batchMsg[batchId].filter( item => (item.res));
			if (completeFetches.length === allFetches) {
				dispatch(doSnack(msgFromBatch(batchMsg[batchId])));
				dispatch(clearBatchMsg(batchId));
			}
		}
	}	
}

// helpers
const getOneIncoming = (incoming, id) => {
	const rows = incoming.filter( (r) => {
		return (r.id === id);
	});
	return (rows.length === 1)? rows[0] : {};
}

// returns body for update of Ledger in Incoming= {}
const patchFrom = (incomingId, newLedgerId, incoming) => {
	const incomingSingle = getOneIncoming(incoming, incomingId);
	const details = {};
	incomingSingle.details.forEach( (d, i) => {
		details[i] = { 
			id: d.id, 
			description: d.description, 
			ledger_account_id: newLedgerId 
		};
	});
	const body = {};
	body[incomingSingle.type] = { "details_attributes" : details };
	return body;
}

// returns body for update of payment in Incoming= {}
const patchPayFrom = (incomingSingle) => {
	const today = new Date();
	const body = { "payment" : { 
		"payment_date" : today.toLocaleDateString('nl-NL'),
		"price" : incomingSingle.total_price_incl_tax,
		"price_base" : incomingSingle.total_price_incl_tax_base,
		"financial_account_id" : "247030397351757807"
	}};
	return body;
}

// (fieldId, newValue)
const makeCustomFieldBody = (fieldId, newValue) => {
	const body = { "contact" : { 
		"custom_fields_attributes" : {
			"0" : { 
				"id" : fieldId,
				"value" : newValue
			}
		}
	}};
	return body;
}

// (fieldId, newValue)
const makeContactFieldBody = (fieldId, newValue) => {
	const body = { "contact" : {} };
	body.contact[fieldId] = newValue;
	return body;
}

const getLedgerId = (name, ledgers) => {
	const ledgersFound = ledgers.filter( l => (l.name === name) );
	if (ledgersFound.length > 0) {
		return ledgersFound[0].id
	} else {
		return null;
	}
}

// taaldingetje (vervangt meervoud door enkelvoud als nodig)
const stringFromMsg = ( count, string ) => {
	if (count === 1) { 
		return count + " " + 
			string.replace(/facturen/g, 'factuur')
			.replace(/regels/g, 'regel')
			.replace(/contacten/g, 'contact')
			.replace(/betalingen/g, 'betaling');
	} else {
		return count + " " + string;
	}
}



// make [ "x "+ msg ] -> string, from { .., msg }
// helpertje
const recursiveMsg = (inList, outList) => {
	if (inList.length === 0) return outList;
	const newList = inList.filter( item => (item.msg !== inList[0].msg));
	const newOutMsg = stringFromMsg(inList.length - newList.length, inList[0].msg);
	return recursiveMsg(newList, [ ...outList, newOutMsg]);
}

// real func
const msgFromBatch = (msgList) => {
	const outList = recursiveMsg(msgList, []);
	return outList.join(', ');
}
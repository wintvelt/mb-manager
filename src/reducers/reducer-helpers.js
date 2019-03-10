// reducer-helpers

// for incoming

// check if ledger in 1 of meer details anders is, dan set
// anders origineel terug
const setLedgerInDetails = (details, newLedgerId) => {
	if (details.filter( d => (d.ledger_account_id !== newLedgerId) ).length === 0) return details;
	return details.map((d, i) => { 
		return Object.assign({}, d, { ledger_account_id: newLedgerId })
	});
}

export const setLedgerInRow = (incomingObj, newLedgerId) => {
	if (!incomingObj) return incomingObj;
	if (!incomingObj.details) return incomingObj;
	const newDetails = setLedgerInDetails(incomingObj.details, newLedgerId);
	if (newDetails === incomingObj.details) return incomingObj;
	return Object.assign({}, incomingObj, { details : newDetails });
}

export const setCustomFieldInRow = (incoming, fieldId, newValue) => {
	if (!incoming) return incoming;
	if (!incoming.contact) return incoming;
	const newCustomFields = incoming.contact.custom_fields.map ( item => {
		if (item.id === fieldId) {
			return Object.assign({}, item, { value : newValue });
		} else {
			return item
		}
	});
	const newContact = Object.assign({}, incoming.contact, { custom_fields: newCustomFields });
	return Object.assign({}, incoming, { contact : newContact });
}

export const setPaymentInRow = (incomingObj) => {
	if (!incomingObj) return incomingObj;
	if (incomingObj.state === "paid") return incomingObj;
	return Object.assign({}, incomingObj, { state : "paid" });
}
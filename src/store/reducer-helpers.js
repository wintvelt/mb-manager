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
// Notes

// voor Batch Patch: 
// !!: bij elk detail MOET id en description ook mee in PATCH, anders vindt geen update plaats
// !!: ook als ledger_id invalid is, dan krijg je 200 terug

function part(a,b) {
	if (a && !b) {
		return ((bb) => { return part(a,bb)});
	} else {
		return a + b;
	}
}


// vanaf hier verwerk dispatch om ledgerId te updaten in 1 of meer incoming
// in middleware (multiple dispatches) - TIJDELIJK FOR TEST ONLY
// batchList = [ { incomingId, ledgerID } ]
export function batchLedgTest(batchList) {
	return function(dispatch) {
		batchList.forEach( (payload) => {
			dispatch(setLedgerIncoming(payload))
		});
	}
}


// in actions
export function setLedgerIncoming(payload) {
	return { type: SET_INCOMING_LEDGER, payload };
}

// in reducer
case SET_INCOMING_LEDGER: {
	if (!state.incoming || state.incoming.length === 0) return state;
	const incomingList = state.incoming.filter( (incoming) => (incoming.id === payload.incomingId) );
	if (incomingList.length === 0) return state;
	const incomingToUpdate = incomingList[0];
	const newIncoming = setLedgerInRow(incomingToUpdate, payload.newLedgerId);
	if (newIncoming === incomingToUpdate) return state;
	const newIncomingList = state.incoming.map( (incoming, i) => {
		if (incoming.id === payload.incomingId) { 
			return newIncoming;
		} else return incoming;
	});
  	return Object.assign({}, state, {
        incoming: newIncoming
    });
}


const setLedgerInRow = (incomingObj, newLedgerId) => {
	if (!incomingObj) return incomingObj;
	if (!incomingObj.details) return incomingObj;
	const newDetails = setLedgerInDetails(incomingObj.details, newLedgerId);
	if (newDetails === incoming.details) return incomingObj;
	return Object.assign({}, incomingObject, { details : newDetails });
}

// check if ledger in 1 of meer details anders is, dan set
// anders origineel terug
const setLedgerInDetails = (details, newLedgerId) => {
	if (details.filter( d => (d.ledger_account_id !== newLedgerId) ).length === 0) return details;
	return details.map((d, i) => { 
		return Object.assign({},d, { ledger_account_id: newLedgerId })
	});
}

// generieke vervanging van row in array
const setInArr = (arr, index, newObj) => {
	if (arr.length === 0) return [ newObj ]
	if (index === 0) return [ newObj, ...arr.slice(1,)]
	if (index === arr.length-1) return [ ...arr.slice(0, arr.length-1), newObj ]
	if (index > arr.length-1) return [ ...arr, newObj ]
	return [ ...arr.slice(0, index), newObj, ...arr.slice(index+1,)]
}

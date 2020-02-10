// apiActions-post.js
// to POST updates to Moneybird
// also in batch
// with optimistic updates
import {
    doSnack
} from './actions';
import {
    SET_INCOMING_LEDGER_NEW, SET_BATCH_MSG, CLEAR_BATCH_MSG, DO_SNACK, DO_TIMER,
    SET_CONTACT_KEYWORDS, SET_PAY_CONNECT, DELETE_PAYMENT_MANUAL
} from '../store/action-types';

const adminCode = "243231934476453244";
const base_url = 'https://moneybird.com/api/v2/' + adminCode;
const apiThrottle = 1800;

// to process a list of ledger-changes (change ledger in invoice for all details to new ledger)
// batchList = [ { incoming, newLedgerId } ]
export function batchLedgerPost(batchList, access_token) {
    return function (dispatch) {
        // we have data to process
        const batchListClean = batchList.filter(item => (item.newLedgerId));
        const itemsToProcessCount = batchListClean.length;
        const duration = itemsToProcessCount * 2;
        const message = `${itemsToProcessCount} boekingen verwerken.`;
        const timerAction = {
            type: DO_TIMER,
            payload: {
                timeLeft: duration,
                message
            }
        }
        dispatch(timerAction);
        // set initial batch messages
        batchListClean.forEach(item => {
            const initialPayload = {
                batchId: "incoming",
                fetchId: item.incoming.id,
                res: false,
                msg: ""
            }
            dispatch(setBatchCheckMsg(initialPayload));
        })
        // removes invalid or missing ledgers
        const invalidLedgers = (batchList.length - itemsToProcessCount);
        if (invalidLedgers > 0) {
            const msg = invalidLedgers + " met incorrecte standaard cat";
            dispatch(doSnack(msg));
        }
        // make recursive call to update items
        singleBatchUpdate(batchListClean, access_token, dispatch);
    }
}

const singleBatchUpdate = (itemList, access_token, dispatch) => {
    const item = itemList[0];
    // optimistic update of store
    dispatch({ type: SET_INCOMING_LEDGER_NEW, payload: item });
    // still data to process
    const itemsToProcessCount = itemList.length;
    const duration = itemsToProcessCount * 2;
    if (duration % 60 === 0) {
        const message = `Nog ${itemsToProcessCount} boeking${itemsToProcessCount === 1 ? '' : 'en'} verwerken.`;
        console.log(message);
        const timerAction = {
            type: DO_TIMER,
            payload: {
                timeLeft: duration,
                message
            }
        }
        dispatch(timerAction);
    }
    // send single update to server + update batchMsg with response
    const patchBody = patchFrom(item.incoming, item.newLedgerId);
    dispatch(
        patchIncomingLedger("incoming", item.incoming.id, patchBody, access_token)
    ).then((payload) => {
        dispatch(setBatchCheckMsg(payload));
        if (itemList.length > 1) {
            setTimeout(() => {
                singleBatchUpdate(itemList.slice(1), access_token, dispatch)
            }, apiThrottle);
        }
    });
}

// POST update to Moneybird - to update details of 1 receipt or purchase invoice
export function patchIncomingLedger(batchId, incomingId, body, access_token) {
    return function (dispatch) {
        const type = Object.keys(body)[0];
        const url = base_url + '/documents/' + type + 's/' + incomingId + ".json";
        return (
            postData(url, body, "PATCH", access_token)
                .then((res) => {
                    // do OK message in dispatch { batchId, fetchId, res, msg }
                    return {
                        batchId: batchId,
                        fetchId: incomingId,
                        res: true,
                        msg: "inkomende facturen bijgewerkt"
                    };
                })
                .catch((err) => {
                    return {
                        batchId: batchId,
                        fetchId: incomingId,
                        res: true,
                        msg: "regels zijn niet gelukt :("
                    };
                })
        )
    }
}

// returns body for update of Ledger in Incoming= {}
const patchFrom = (incoming, newLedgerId) => {
    let details = {};
    incoming.details.forEach((d, i) => {
        details[i] = {
            id: d.id,
            description: d.description,
            ledger_account_id: newLedgerId
        };
    });
    const body = {};
    body[incoming.type] = { "details_attributes": details };
    return body;
}

// to process keyword-updates for list of contacts
// keywordList = [ { id, keywordsId, keywords } ]
export function batchKeywordsPost(batchList, access_token) {
    return function (dispatch) {
        // we have data to process
        const batchListClean = batchList.filter(item => (item.id));
        // removes invalid or missing ledgers
        const invalidContacts = (batchList.length - batchListClean.length);
        if (invalidContacts > 0) {
            const msg = invalidContacts + " contacten zonder id";
            dispatch(doSnack(msg));
        }
        // loop over cleaned list
        batchListClean.forEach((item) => {
            // optimistic update of store
            dispatch({ type: SET_CONTACT_KEYWORDS, payload: item });
            // set message
            const initialPayload = {
                batchId: "contacts",
                fetchId: item.id,
                res: false,
                msg: ""
            }
            dispatch(setBatchCheckMsg(initialPayload));
            // send single update to server + update batchMsg with response
            const patchBody = {
                "contact":
                {
                    "custom_fields_attributes":
                    {
                        "0":
                        {
                            "id": item.keywordsId,
                            "value": item.keywords
                        }
                    }
                }
            };
            dispatch(
                patchContactKeywords("contact", item.id, patchBody, access_token)
            ).then(payload => dispatch(setBatchCheckMsg(payload)));
        });
    }
}

// POST update keywords on 1 contact
export function patchContactKeywords(batchId, contactId, body, access_token) {
    return function (dispatch) {
        const url = base_url + '/contacts/' + contactId + ".json";
        return (
            postData(url, body, "PATCH", access_token)
                .then((res) => {
                    // do OK message in dispatch { batchId, fetchId, res, msg }
                    return {
                        batchId: batchId,
                        fetchId: contactId,
                        res: true,
                        msg: "contacten bijgewerkt"
                    };
                })
                .catch((err) => {
                    return {
                        batchId: batchId,
                        fetchId: contactId,
                        res: true,
                        msg: "regels zijn niet gelukt :("
                    };
                })
        )
    }
}

// to connect list of payment, invoice combos
// connectList = [ { paymentId, invoiceId, amount, amountForeign } ]
// TODO: Throttle API calls
export function batchMatchPost(batchList, access_token) {
    return function (dispatch) {
        // we have data to process
        batchList.forEach((item) => {
            // optimistic update of store
            dispatch({ type: SET_PAY_CONNECT, payload: item });
            // set message
            const initialPayload = {
                batchId: "connections",
                fetchId: item.paymentId,
                res: false,
                msg: ""
            }
            dispatch(setBatchCheckMsg(initialPayload));
            // send single update to server + update batchMsg with response
            const patchBody = {
                booking_type: 'Document',
                booking_id: item.invoiceId,
                price: item.amountForeign || item.amount,
                price_base: item.amount,
                description: 'Transactie gekoppeld uit Moblybird ;)'
            };
            dispatch(
                patchMatch("connections", item.paymentId, patchBody, access_token)
            ).then(payload => dispatch(setBatchCheckMsg(payload)));
        });
    }
}

// POST update 1 connection between payment-invoice
export function patchMatch(batchId, paymentId, body, access_token, destination) {
    const destStr = destination || 'bonnetjes';
    return function (dispatch) {
        const url = base_url + `/financial_mutations/${paymentId}/link_booking.json`;
        return (
            postData(url, body, "PATCH", access_token)
                .then((res) => {
                    // do OK message in dispatch { batchId, fetchId, res, msg }
                    return {
                        batchId: batchId,
                        fetchId: paymentId,
                        res: true,
                        msg: `betalingen aan ${destStr} gelinkt`
                    };
                })
                .catch((err) => {
                    return {
                        batchId: batchId,
                        fetchId: paymentId,
                        res: true,
                        msg: "regels zijn niet gelukt :("
                    };
                })
        )
    }
}

// to process a list of ledger-bookings (book payment to a ledger)
// const invert = numStr => numStr.slice(0, 1) === '-' ? numStr.slice(1) : '-' + numStr;

// connectList = [ { payment, ledgerId } ]
export function batchBookingPost(batchList, access_token) {
    return function (dispatch) {
        // Ready batchmessages for snackbar
        batchList.forEach(item => {
            // set message
            const initialPayload = {
                batchId: "auto_booking",
                fetchId: item.payment.id,
                res: false,
                msg: ""
            }
            dispatch(setBatchCheckMsg(initialPayload));
        });
        // still data to process
        const itemsToProcessCount = batchList.length;
        const duration = itemsToProcessCount * 2;
        const message = `Totaal ${itemsToProcessCount} boeking${itemsToProcessCount === 1 ? '' : 'en'} te verwerken.`;
        const timerAction = {
            type: DO_TIMER,
            payload: {
                timeLeft: duration,
                message,
                initial: true
            }
        }
        dispatch(timerAction);
        // make recursive call to update items
        singleBookingUpdate(batchList, access_token, dispatch);
    }
}

const singleBookingUpdate = (itemList, access_token, dispatch) => {
    const item = itemList[0];
    // optimistic update of store
    dispatch({ type: DELETE_PAYMENT_MANUAL, payload: { paymentId: item.payment.id } });
    // still data to process
    const itemsToProcessCount = itemList.length;
    const duration = itemsToProcessCount * 2;
    if (duration % 60 === 0) {
        const message = `Nog ${itemsToProcessCount} boeking${itemsToProcessCount === 1 ? '' : 'en'} verwerken.`;
        console.log(message);
        const timerAction = {
            type: DO_TIMER,
            payload: {
                timeLeft: duration,
                message
            }
        }
        dispatch(timerAction);
    }
    // send single update to server + update batchMsg with response
    const patchBody = {
        booking_type: 'LedgerAccount',
        booking_id: item.ledgerId,
        price_base: item.payment.amount_open,
        description: 'Transactie gekoppeld uit Moblybird ;)'
    };
    dispatch(
        patchMatch("auto_booking", item.payment.id, patchBody, access_token, 'categorie')
    ).then((payload) => {
        dispatch(setBatchCheckMsg(payload));
        if (itemList.length > 1) {
            setTimeout(() => {
                singleBookingUpdate(itemList.slice(1), access_token, dispatch)
            }, apiThrottle);
        }
    });
}

// for single batch message setting + check to do snack and clear if needed
export function setBatchCheckMsg({ batchId, fetchId, res, msg }) {
    return function (dispatch, getState) {
        const payload = {
            batchId: batchId,
            fetchId: fetchId,
            res: res,
            msg: msg
        }
        dispatch({ type: SET_BATCH_MSG, payload });
        const { batchMsg } = getState();
        if (batchMsg[batchId]) {
            const allFetches = batchMsg[batchId].length;
            const completeFetches = batchMsg[batchId].filter(item => (item.res));
            if (completeFetches.length === allFetches) {
                dispatch({ type: DO_SNACK, payload: msgFromBatch(batchMsg[batchId]) });
                dispatch({ type: CLEAR_BATCH_MSG, payload: batchId });
            }
        }
    }
}

// taaldingetje (vervangt meervoud door enkelvoud als nodig)
const stringFromMsg = (count, string) => {
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
    const newList = inList.filter(item => (item.msg !== inList[0].msg));
    const newOutMsg = stringFromMsg(inList.length - newList.length, inList[0].msg);
    return recursiveMsg(newList, [...outList, newOutMsg]);
}

// real func
const msgFromBatch = (msgList) => {
    const outList = recursiveMsg(msgList, []);
    return outList.join(', ');
}

// wrapper for POST/ PATCH requests
// returns promise
function postData(url = '', data = {}, method = "POST", access_token) {
    // Default options are marked with *
    return fetch(url, {
        method: method,
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token
        },
        body: JSON.stringify(data)
    })
        .then(handleError)
}

function handleError(res) {
    if (res.ok && res.status >= 200 && res.status <= 299) {
        return res.json();
    } else {
        throw Error('Request rejected with status: ' + res.status + " " + res.statusText);
    }
}
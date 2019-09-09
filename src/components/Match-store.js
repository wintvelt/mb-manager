import { newApiData, api } from "../constants/helpers";
import { setMatch } from '../actions/actions';
import { fetchMBAPI } from '../actions/apiActions-Bank';

// Match-store.js
// includes reducers and helpers

export const initialMatch = {
    paymentIds: newApiData(),
    payments: newApiData(),
    hasRelated: false,
    invoiceIds: newApiData(),
    invoices: newApiData()
}

export const matchReducer = (matchStuff, action) => {
    const { content } = action;
    switch (action.type) {
        case 'setInit':
            return initialMatch;

        case 'setPaymentIds':
            const newPaymentIds = api.set(matchStuff.paymentIds, content, onlyIds);
            return { ...matchStuff, paymentIds: newPaymentIds };

        case 'setPayments':
            const newPayments = api.set(matchStuff.payments, content);
            return { ...matchStuff, payments: newPayments, hasRelated: false };

        case 'setInvoiceIds':
            const newInvoiceIds = api.set(matchStuff.invoiceIds, content, onlyIds);
            return { ...matchStuff, invoiceIds: newInvoiceIds };

        case 'setInvoices':
            const newInvoices = api.set(matchStuff.invoices, content);
            return { ...matchStuff, invoices: newInvoices };

        case 'autoMatch':
            const bookings = matchStuff.invoices.data.filter(it => (it.type === content.type));
            let newHasRelated = matchStuff.hasRelated;
            const newPaymentsData = matchStuff.payments.data.map(p => {
                if (p.state === 'processed') return p;
                const related = getRelated(p, bookings);
                if (related && related.length > 0) newHasRelated = true;
                const newRelated = (p.related) ? [...p.related, ...related] : related;
                return { ...p, related: newRelated, hasRelated: newHasRelated }
            })
            const newPaymentsApi = api.setData(newPaymentsData, null, matchStuff.payments.origin);
            return { ...matchStuff, payments: newPaymentsApi, hasRelated: newHasRelated }

        default:
            return matchStuff;
    }
}

const onlyIds = (arr) => {
    const outArr = [...new Set([...arr.map(obj => obj.id)])];
    return outArr;
}

const flip = (str) => {
    if (!str) return str;
    return (str.slice(0, 1) === '-') ? str.slice(1) : '-' + str;
}


// API helpers for filtered receipts & payments
const getMulti = (params) => {
    const { ids, type, path, stuff, accessToken,
        storeSetFunc, dispatch, errorMsg, loadingMsg, callback } = params;
    const idArr = arrOfArr(ids);
    const paramsArr = idArr.map(idList => {
        return {
            method: 'POST',
            stuff,
            body: { ids: idList },
            path,
            storeSetFunc,
            errorMsg,
            accessToken,
            loadingMsg,
            dispatch,
            type,
            callback: null
        }
    });
    getSequential(paramsArr, () => {
        dispatch(storeSetFunc({ DONE: true }));
        if (callback) callback();
    });
}

const getSequential = (paramsArr, finalCallback) => {
    const params = paramsArr[0]
    const moreParamsArr = paramsArr.slice(1);
    const callbackFunc = () => {
        getSequential(moreParamsArr, finalCallback)
    }
    const callback = (moreParamsArr.length > 0) ? callbackFunc : finalCallback;
    const nowParams = { ...params, callback: callback };
    fetchMBAPI(nowParams);
}

export const fetchMatchData = (params) => {
    const { matchStuff, filterState, accessToken, dispatch } = params;
    // reset match record in store
    dispatch(setMatch({ type: 'setInit' }));
    // set filter for period
    const filterQuery = encodeURI(`?filter=period:${filterState.current.period.value}`);
    const invFilterQuery = filterQuery + encodeURI(',state:saved|open|late');
    // setup fetch for invoice ids and invoices
    const invoicePath = '/documents/purchase_invoices/synchronization.json';
    const invIdParams = {
        stuff: matchStuff.invoiceIds,
        path: invoicePath + invFilterQuery,
        storeSetFunc: (content) => setMatch({ type: 'setInvoiceIds', content }),
        errorMsg: 'Fout bij ophalen invoice IDs, melding van Moneybird: ',
        accessToken,
        loadingMsg: 'Even geduld terwijl we invoice IDs ophalen',
        dispatch,
        callback: (ids) => {
            getMulti({
                ids: onlyIds(ids),
                type: 'purchase_invoice',
                path: invoicePath,
                stuff: matchStuff.invoices,
                accessToken,
                storeSetFunc: (content) => setMatch({ type: 'setInvoices', content }),
                dispatch,
                errorMsg: 'Fout bij ophalen facturen, melding van Moneybird: ',
                loadingMsg: 'Even geduld terwijl we facturen ophalen',
                callback: () => {
                    // auto match docs to payments after all docs are in
                    dispatch(setMatch({
                        type: 'autoMatch',
                        content: { type: 'purchase_invoice' }
                    }))
                }
            })
        }
    }
    // setup fetch for receipt ids and receipts
    const receiptPath = '/documents/receipts/synchronization.json';
    const recIdParams = {
        stuff: matchStuff.invoiceIds,
        path: receiptPath + invFilterQuery,
        storeSetFunc: (content) => setMatch({ type: 'setInvoiceIds', content }),
        errorMsg: 'Fout bij ophalen IDs van bonnetjes, melding van Moneybird: ',
        accessToken,
        loadingMsg: 'Even geduld terwijl we IDs van bonnetjes ophalen',
        dispatch,
        callback: (ids) => {
            getMulti({
                ids: onlyIds(ids),
                type: 'receipt',
                path: receiptPath,
                stuff: matchStuff.invoices,
                accessToken,
                storeSetFunc: (content) => setMatch({ type: 'setInvoices', content }),
                dispatch,
                errorMsg: 'Fout bij ophalen bonnetjes, melding van Moneybird: ',
                loadingMsg: 'Even geduld terwijl we bonnetjs ophalen',
                callback: () => {
                    // auto match docs to payments after all docs are in
                    dispatch(setMatch({
                        type: 'autoMatch',
                        content: { type: 'receipt' }
                    }))
                }
            })
        }
    }
    // get payment Ids and payments, with callback to fetch invoices and receipts
    const paymentPath = '/financial_mutations/synchronization.json';
    const curAccount = filterState.current.account.value;
    const paymentFilterQuery = (curAccount)? filterQuery + encodeURI(`,financial_account_id:${curAccount}`) : filterQuery;
    const payIdParams = {
        stuff: matchStuff.paymentIds,
        path: paymentPath + paymentFilterQuery,
        storeSetFunc: (content) => setMatch({ type: 'setPaymentIds', content }),
        errorMsg: 'Fout bij ophalen IDs van betalingen, melding van Moneybird: ',
        accessToken,
        loadingMsg: 'Even geduld terwijl we IDs van betalingen ophalen',
        dispatch,
        callback: (ids) => {
            getMulti({
                ids: onlyIds(ids),
                type: 'payment',
                path: paymentPath,
                stuff: matchStuff.payments,
                accessToken,
                storeSetFunc: (content) => setMatch({ type: 'setPayments', content }),
                dispatch,
                errorMsg: 'Fout bij ophalen betalingen, melding van Moneybird: ',
                loadingMsg: 'Even geduld terwijl we betalingen ophalen',
                callback: () => {
                    fetchMBAPI(invIdParams);
                    fetchMBAPI(recIdParams);
                }
            })
        }
    }
    fetchMBAPI(payIdParams);
}

const THRESHOLD_AMOUNT = 1;
const THRESHOLD_DAYS = 3;

const getRelated = (payment, invoiceData) => {
    const { amount, date, message } = payment;
    const amt = parseFloat(amount);
    const related = invoiceData.map(inv => {
        const invAmt = flip(inv.total_price_incl_tax_base);
        const amDiff = parseFloat(invAmt) - amt;
        const amountScore =
            (amount === invAmt) ? 10
                : (amDiff > -THRESHOLD_AMOUNT && amDiff < THRESHOLD_AMOUNT) ? 5
                    : 0;
        const kwObj = inv.contact && inv.contact.custom_fields &&
            inv.contact.custom_fields.find(cf => (cf.name === 'Keywords'));
        const keywords = (kwObj) ? kwObj.value.split(',') : []
        let kwScore = 0;
        for (const kw of keywords) {
            if (message.includes(kw)) kwScore += 5;
        }
        const dateScore =
            (date === inv.date) ? 3
                : (daysDiff(date, inv.date) < THRESHOLD_DAYS) ? 1
                    : 0;
        const totalScore = dateScore + amountScore + kwScore;
        const scores = [amountScore, kwScore, dateScore];
        return { ...inv, total_price_incl_tax_base: invAmt, totalScore, scores }
    })
        .filter(inv => (inv.totalScore > 5))
        .sort(scoreSort)
    return related;
}

// generic helpers
// compare function for sort
const scoreSort = (a,b) => {
    return (a.totalScore < b.totalScore)? 1
    : (a.totalScore > b.totalScore)? -1
    : 0;
}
// to cut array in slices of 50
const arrOfArr = (inArr, size = 50, prevArr = []) => {
    const outArr = [...prevArr, inArr.slice(0, size)]
    const newInArr = inArr.slice(size);
    if (newInArr.length === 0) {
        return outArr;
    };
    return arrOfArr(newInArr, size, outArr);
}

// to calc days difference
const daysDiff = (a, b) => {
    const d1 = new Date(a);
    const d2 = new Date(b);
    const timeDiff = d2.getTime() - d1.getTime();
    const dDiff = timeDiff / (1000 * 3600 * 24);
    return (dDiff < 0) ? -dDiff : dDiff;
}

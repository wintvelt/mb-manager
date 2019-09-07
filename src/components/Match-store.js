import { newApiData, api } from "../constants/helpers";
import { setMatch } from '../actions/actions';
import { fetchMBAPI } from '../actions/apiActions-Bank';

// Match-store.js
// includes reducers and helpers

export const initialMatch = {
    invoiceIds: newApiData(),
    paymentIds: newApiData(),
    invoices: newApiData(),
    payments: newApiData()
}

export const matchReducer = (matchStuff, action) => {
    const { content } = action;
    switch (action.type) {
        case 'setInit':
            return initialMatch;

        case 'setInvoices':
            const newInvoices = api.set(matchStuff.invoices, content);
            return { ...matchStuff, invoices: newInvoices };

        case 'setInvoiceIds':
            const newInvoiceIds = api.set(matchStuff.invoiceIds, content, onlyIds);
            return { ...matchStuff, invoiceIds: newInvoiceIds };

        case 'setPayments':
            const newPayments = api.set(matchStuff.payments, content);
            return { ...matchStuff, payments: newPayments };

        case 'setPaymentIds':
            const newPaymentIds = api.set(matchStuff.paymentIds, content, onlyIds);
            return { ...matchStuff, paymentIds: newPaymentIds };

        default:
            return matchStuff;
    }
}

const onlyIds = (arr) => {
    const outArr = [...new Set([...arr.map(obj => obj.id)])];
    return outArr;
}


// API helpers for filtered receipts & payments
const getMulti = (params) => {
    const { ids, type, path, stuff, accessToken,
        storeSetFunc, dispatch, errorMsg, loadingMsg } = params;
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
            type
        }
    });
    getSequential(paramsArr, () => {
        dispatch(storeSetFunc({ DONE: true }));
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
    let filterQuery = encodeURI(`?filter=period:${filterState.current.period.value}`);
    // get invoice ids and invoices
    const invoicePath = '/documents/purchase_invoices/synchronization.json';
    const invIdParams = {
        stuff: matchStuff.invoiceIds,
        path: invoicePath + filterQuery,
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
                loadingMsg: 'Even geduld terwijl we facturen ophalen'
            })
        }
    }
    fetchMBAPI(invIdParams);
    // get receipt ids and receipts
    const receiptPath = '/documents/receipts/synchronization.json';
    const recIdParams = {
        stuff: matchStuff.invoiceIds,
        path: receiptPath + filterQuery,
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
                loadingMsg: 'Even geduld terwijl we bonnetjs ophalen'
            })
        }
    }
    fetchMBAPI(recIdParams);
    // get payment Ids and payments
    const paymentPath = '/financial_mutations/synchronization.json';
    const curAccount = filterState.current.account.value;
    if (curAccount) filterQuery += encodeURI(`,financial_account_id:${curAccount}`);
    const payIdParams = {
        stuff: matchStuff.paymentIds,
        path: paymentPath + filterQuery,
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
                loadingMsg: 'Even geduld terwijl we betalingen ophalen'
            })
        }
    }
    fetchMBAPI(payIdParams);
}

// generic helpers
// to cut array in slices of 50
const arrOfArr = (inArr, size = 50, prevArr = []) => {
    const outArr = [...prevArr, inArr.slice(0, size)]
    const newInArr = inArr.slice(size);
    if (newInArr.length === 0) {
        return outArr;
    };
    return arrOfArr(newInArr, size, outArr);
}
// apiActions with New apiData lib
import { apiActionPaged, apiActionSync } from '../helpers/apiData/apiData-multi';
import { apiAction } from '../helpers/apiData/apiData';
import {
    SET_CONTACTS_NEW, SET_PAYMENTS_NEW, SET_ACCOUNTS_NEW,
    SET_RECEIPTS, SET_PURCHASE_INVOICES, SET_LEDGERS_NEW, SET_CUSTOM_FIELDS_NEW,
    SET_INCOMING_SUMS
} from '../store/action-types';

export const getContacts = (access_token, pageFrom, pageTo) => apiActionPaged({
    url: 'https://moneybird.com/api/v2/243231934476453244/contacts?per_page=50&page=',
    headers: { Authorization: 'Bearer ' + access_token },
    pageFrom,
    pageTo,
    loadingMsg: 'contacten aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_CONTACTS_NEW, payload }
    }
})

export const getPayments = (access_token, periodFilter = 'this_quarter', extraFilters = '') => {
    return apiActionSync({
        url: 'https://moneybird.com/api/v2/243231934476453244/financial_mutations/synchronization.json' +
            `?filter=period:${periodFilter}${extraFilters}`,
        headers: { Authorization: 'Bearer ' + access_token },
        storeAction: (payload) => {
            return { type: SET_PAYMENTS_NEW, payload: { key: periodFilter, apiAction: payload } }
        },
        loadingMsg: 'betalingen aan het ophalen.'
    })
}

export const getAccounts = (access_token) => apiAction({
    url: 'https://moneybird.com/api/v2/243231934476453244/financial_accounts.json',
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'bankrekeningen aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_ACCOUNTS_NEW, payload }
    }
})

export const getReceipts = (access_token, periodFilter = 'this_quarter', extraFilters = '') => {
    return apiActionSync({
        url: 'https://moneybird.com/api/v2/243231934476453244/documents/receipts/synchronization.json' +
            `?filter=period:${periodFilter}${extraFilters}`,
        headers: { Authorization: 'Bearer ' + access_token },
        storeAction: (payload) => {
            return { type: SET_RECEIPTS, payload: { key: periodFilter, apiAction: payload } }
        },
        loadingMsg: 'bonnetjes aan het ophalen.'
    })
}

export const getPurchaseInvoices = (access_token, periodFilter = 'this_quarter', extraFilters = '') => {
    return apiActionSync({
        url: 'https://moneybird.com/api/v2/243231934476453244/documents/purchase_invoices/synchronization.json' +
            `?filter=period:${periodFilter}${extraFilters}`,
        headers: { Authorization: 'Bearer ' + access_token },
        storeAction: (payload) => {
            return { type: SET_PURCHASE_INVOICES, payload: { key: periodFilter, apiAction: payload } }
        },
        loadingMsg: 'bonnetjes aan het ophalen.'
    })
}

export const getLedgers = (access_token) => apiAction({
    url: 'https://moneybird.com/api/v2/243231934476453244/ledger_accounts.json',
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'categorieën aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_LEDGERS_NEW, payload }
    }
})

export const getCustomFields = (access_token) => apiAction({
    url: 'https://moneybird.com/api/v2/243231934476453244/custom_fields.json',
    headers: { Authorization: 'Bearer ' + access_token },
    loadingMsg: 'custom velden aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_CUSTOM_FIELDS_NEW, payload }
    }
})

export const getIncomingSums = () => apiAction({
    url: 'https://pkvewvsg52.execute-api.eu-central-1.amazonaws.com/Prod/export?filename=incoming-summary-list.json',
    loadingMsg: 'statistieken van export aan het ophalen.',
    storeAction: (payload) => {
        return { type: SET_INCOMING_SUMS, payload }
    }
})

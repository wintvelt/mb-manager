// reducers.js

import {
    DO_SNACK, DO_SNACK_ERROR,
    SET_ACCESS_TOKEN, DELETE_ACCESS_TOKEN,
    SET_BATCH_ERROR,
    SET_INCOMING_SUMS, SET_EXPORT_PENDING, SET_OPT_DELETED, SET_SYNC_PENDING,
    SET_BATCH_MSG, CLEAR_BATCH_MSG,
    SET_BANK,
    SET_PAYMENTS_NEW, RESET_PAYMENTS_NEW, SET_CONTACTS_NEW, SET_ACCOUNTS_NEW,
    SET_RECEIPTS, SET_PURCHASE_INVOICES, SET_LEDGERS_NEW,
    SET_INCOMING_LEDGER_NEW, NOTIFY,
    SET_CONTACT_KEYWORDS,
    SET_CUSTOM_FIELDS_NEW,
    SET_PAY_CONNECT,
    SET_REVENUE_CONFIG, SET_REVENUE_CONFIG_UPDATE, SET_REVENUE_CONFIG_MANUAL, DEL_REVENUE_CONFIG_MANUAL,
    DELETE_PAYMENT_MANUAL
} from "./action-types";
import { initBankData, setBank } from './reducer-helpers-bank';
import { initApiDataMulti, apiUpdateMulti, apiUpdateMultiMulti } from '../helpers/apiData/apiData-multi';
import { apiUpdate, initApiData, apiActionManual } from '../helpers/apiData/apiData';
import { defaultNotifications, updateSnacks, enqueueSnack } from "../helpers/snackbar/updateSnacks";

// initial state also exported to root (to set default when initializing)
export const initialState = {
    newSnack: "",
    accessToken: initApiData,
    testOutput: "",
    payments: initApiDataMulti,
    contactsNew: initApiDataMulti,
    customFieldsNew: initApiData,
    accountsNew: initApiData,
    receipts: initApiDataMulti,
    purchaseInvoices: initApiDataMulti,
    ledgersNew: initApiData,
    notifications: defaultNotifications,
    incomingSums: initApiData,
    exportPending: 0,
    optDeleted: [],
    syncPending: false,
    bankData: initBankData,
    revenueConfig: initApiData,
    revenueConfigUpdate: initApiData,
    batchMsg: {},
    batchError: false
};

function rootReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        // payload = accessToken
        case SET_ACCESS_TOKEN: {
            return {
                ...state,
                accessToken: apiUpdate(state.accessToken, action.payload)
            }
        }
        case DELETE_ACCESS_TOKEN: {
            return {
                ...state,
                accessToken: initApiData
            }
        }
        case RESET_PAYMENTS_NEW: {
            return { ...state, payments: initApiDataMulti}
        }
        case SET_PAYMENTS_NEW: {
            const newPayments = apiUpdateMultiMulti(state.payments, payload);
            return { ...state, payments: newPayments }
        }
        case SET_CONTACTS_NEW: {
            const newContacts = apiUpdateMulti(state.contactsNew, payload);
            return { ...state, contactsNew: newContacts }
        }
        case SET_ACCOUNTS_NEW: {
            const newAccounts = apiUpdate(state.accountsNew, payload);
            return { ...state, accountsNew: newAccounts }
        }
        case SET_RECEIPTS: {
            const newReceipts = apiUpdateMultiMulti(state.receipts, payload);
            return { ...state, receipts: newReceipts }
        }
        case SET_PURCHASE_INVOICES: {
            const newPurchaseInvoices = apiUpdateMultiMulti(state.purchaseInvoices, payload);
            return { ...state, purchaseInvoices: newPurchaseInvoices }
        }
        case SET_LEDGERS_NEW: {
            const newLedgers = apiUpdate(state.ledgersNew, payload);
            return { ...state, ledgersNew: newLedgers }
        }
        case SET_INCOMING_LEDGER_NEW: {
            const { incoming, newLedgerId } = payload;
            // make optimistic update inside 1 incoming apiData thing
            // do an update of 1 record in immutable receipts.apiData.data (or purchaseInvoices)
            const incomingStateKey = incoming.type === 'receipt' ? 'receipts' : 'purchaseInvoices';
            const indexOfListToUpdate = state[incomingStateKey].getIn(['apiData', 'data']).findIndex(listItem => {
                return listItem.get('id') === incoming.id;
            });
            const newIncomingState = state[incomingStateKey].updateIn(
                [
                    'apiData', 'data',
                    indexOfListToUpdate,
                    'details'
                ],
                (details) => details.map(detail => detail.set('ledger_account_id', newLedgerId)));
            return {
                ...state,
                [incomingStateKey]: newIncomingState
            }

        }
        case SET_CUSTOM_FIELDS_NEW: {
            const newCustomFields = apiUpdate(state.customFieldsNew, payload);
            return { ...state, customFieldsNew: newCustomFields }
        }
        case SET_CONTACT_KEYWORDS: {
            const { id, keywordsId, keywords } = payload;
            const indexOfContactToUpdate = state.contactsNew.getIn(['apiData', 'data']).findIndex(contact => {
                return contact.get('id') === id;
            });
            const newContacts = state.contactsNew.updateIn([
                'apiData', 'data',
                indexOfContactToUpdate,
                'custom_fields'
            ], custom_fields => custom_fields.map(field => {
                return field.get('id') === keywordsId ?
                    field.set('value', keywords)
                    : field
            }))
            return { ...state, contactsNew: newContacts }
        }
        case SET_PAY_CONNECT: {
            const { paymentId, invoiceId } = payload;
            const newPurchaseInvoices = state.purchaseInvoices.updateIn(['apiData', 'data'], data => {
                return data.filter(item => item.get('id') !== invoiceId)
            });
            const newReceipts = state.receipts.updateIn(['apiData', 'data'], data => {
                return data.filter(item => item.get('id') !== invoiceId)
            });
            const newPayments = state.payments.updateIn(['apiData', 'data'], data => {
                return data.filter(item => item.get('id') !== paymentId)
            });
            return {
                ...state,
                purchaseInvoices: newPurchaseInvoices,
                receipts: newReceipts,
                payments: newPayments
            }
        }
        case DELETE_PAYMENT_MANUAL: {
            const { paymentId } = payload;
            const newPayments = state.payments.updateIn(['apiData', 'data'], data => {
                return data.filter(item => item.get('id') !== paymentId)
            });
            return {
                ...state,
                payments: newPayments
            }
        }
        case NOTIFY: {
            return {
                ...state,
                notifications: updateSnacks(state.notifications, action.payload)
            }
        }
        case SET_INCOMING_SUMS: {
            const newIncomingSums = apiUpdate(state.incomingSums, payload);
            return {
                ...state,
                incomingSums: newIncomingSums
            }
        }
        case SET_REVENUE_CONFIG: {
            const newRevenueConfig = apiUpdate(state.revenueConfig, payload);
            return {
                ...state,
                revenueConfig: newRevenueConfig
            }
        }

        case SET_REVENUE_CONFIG_MANUAL: {
            const oldData = state.revenueConfig.toJS().data || [];
            const idIsInOld = !!oldData.find(it => it.id === payload.id);
            const newData = idIsInOld ?
                oldData.map(it => it.id === payload.id ? payload : it)
                : [...oldData, payload];
            const action = apiActionManual({ data: newData });
            const newUpdate = apiUpdate(state.revenueConfig, action);
            return {
                ...state,
                revenueConfig: newUpdate
            }
        }

        case DEL_REVENUE_CONFIG_MANUAL: {
            const oldData = state.revenueConfig.toJS().data || [];
            const newData = 
                oldData.filter(it => it.id !== payload.id);
            const action = apiActionManual({ data: newData });
            const newUpdate = apiUpdate(state.revenueConfig, action);
            return {
                ...state,
                revenueConfig: newUpdate
            }
        }

        case SET_REVENUE_CONFIG_UPDATE: {
            const newUpdate = apiUpdate(state.revenueConfigUpdate, payload);
            return {
                ...state,
                revenueConfigUpdate: newUpdate
            }
        }

        // payload = msg
        case DO_SNACK: {
            const newSnackAction = enqueueSnack({
                message: action.payload,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'info'
                },
                hasClose: true
            });
            return {
                ...state,
                notifications: updateSnacks(state.notifications, newSnackAction)
            }
        }

        case DO_SNACK_ERROR: {
            const newSnackAction = enqueueSnack({
                message: action.payload,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'warning'
                },
                hasClose: true
            });
            return {
                ...state,
                notifications: updateSnacks(state.notifications, newSnackAction)
            }
        }

        // payload = (bool)
        case SET_BATCH_ERROR: {
            return Object.assign({}, state, {
                batchError: action.payload
            })
        }
        case SET_BANK: {
            const newBankData = setBank(state, action.payload);
            return Object.assign({}, state, { bankData: newBankData })
        }
        case SET_EXPORT_PENDING: {
            return Object.assign({}, state, {
                exportPending: action.payload
            })
        }

        case SET_OPT_DELETED: {
            return Object.assign({}, state, {
                optDeleted: action.payload
            })
        }

        case SET_SYNC_PENDING: {
            return Object.assign({}, state, {
                syncPending: action.payload
            })
        }

        // payload = { batchId, fetchId, res, msg }
        case SET_BATCH_MSG: {
            const batchMsgList = state.batchMsg[action.payload.batchId] || [];
            const newMsg = { fetchId: action.payload.fetchId, res: action.payload.res, msg: action.payload.msg };
            const newBatchMsgList = [...batchMsgList.filter(m => (m.fetchId !== action.payload.fetchId)), newMsg];
            const newBatchMsg = Object.assign({}, state.batchMsg);
            newBatchMsg[action.payload.batchId] = newBatchMsgList;
            return Object.assign({}, state, { batchMsg: newBatchMsg });
        }
        // payload = batchId
        case CLEAR_BATCH_MSG: {
            if (!state.batchMsg[action.payload]) return state;
            const newBatchMsg = Object.assign({}, state.batchMsg);
            delete newBatchMsg[action.payload];
            return Object.assign({}, state, { batchMsg: newBatchMsg });
        }

        default:
            return state;
    }
}

export default rootReducer;
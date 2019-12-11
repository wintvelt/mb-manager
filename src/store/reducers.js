// reducers.js

import {
    DO_SNACK, DO_SNACK_ERROR,
    SET_ACCESS_TOKEN, DELETE_ACCESS_TOKEN,
    TEST_CONNECTION, SET_BATCH_ERROR,
    SET_LEDGERS, SET_ACCOUNTS, SET_CUSTOM_FIELDS,
    ADD_INCOMING, SET_INCOMING_LEDGER, SET_INCOMING_CUSTOM_FIELD, SET_INCOMING_PAYMENT,
    ADD_CONTACTS, SET_CONTACT_FIELD, SET_CONTACT_CUSTOM_FIELD,
    ADD_RECEIVED, SET_INCOMING_SUMS, SET_EXPORT_PENDING, SET_OPT_DELETED, SET_SYNC_PENDING,
    SET_BATCH_MSG, CLEAR_BATCH_MSG,
    LOGIN, LOGOUT, TEST, SET_TEST_RESULT,
    SET_BANK, SET_MATCH,
    SET_PAYMENTS_NEW, SET_CONTACTS_NEW, SET_ACCOUNTS_NEW,
    SET_RECEIPTS, SET_PURCHASE_INVOICES, SET_LEDGERS_NEW,
    SET_INCOMING_LEDGER_NEW, NOTIFY,
    SET_CONTACT_KEYWORDS,
    SET_CUSTOM_FIELDS_NEW,
    SET_PAY_CONNECT
} from "./action-types";
import {
    setLedgerInRow, setCustomFieldInRow, setPaymentInRow
} from './reducer-helpers';
import { newApiData, api } from '../constants/helpers';
import { initBankData, setBank } from './reducer-helpers-bank';
// import { initialMatch, matchReducer } from "../components/Match-store";
import { initApiDataMulti, apiUpdateMulti, apiUpdateMultiMulti } from '../helpers/apiData/apiData-multi';
import { apiUpdate, initApiData } from '../helpers/apiData/apiData';
import { defaultNotifications, updateSnacks, enqueueSnack } from "../helpers/snackbar/updateSnacks";

// initial state also exported to root (to set default when initializing)
export const initialState = {
    newSnack: "",
    accessToken: newApiData(),
    accessVerified: false,
    testOutput: "",
    ledgers: newApiData(),
    accounts: newApiData(),
    customFields: newApiData(),
    incoming: newApiData(),
    payments: initApiDataMulti,
    contactsNew: initApiDataMulti,
    customFieldsNew: initApiData,
    accountsNew: initApiData,
    receipts: initApiDataMulti,
    purchaseInvoices: initApiDataMulti,
    ledgersNew: initApiData,
    notifications: defaultNotifications,
    contacts: newApiData(),
    received: newApiData(),
    incomingSums: initApiData,
    exportPending: 0,
    optDeleted: [],
    syncPending: false,
    bankData: initBankData,
    // matchStuff: initialMatch,
    batchMsg: {},
    batchError: false
};

function rootReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        // payload = accessToken
        case SET_ACCESS_TOKEN: {
            return Object.assign({}, state, {
                accessToken: api.set(state.accessToken, action.payload),
                accessVerified: (!action.payload.ERROR),
            })
        }
        case DELETE_ACCESS_TOKEN: {
            return Object.assign({}, state, {
                accessToken: newApiData(),
                accessVerified: false
            })
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
            return { ...state, 
                purchaseInvoices: newPurchaseInvoices,
                receipts: newReceipts,
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

        // payload = ()
        case TEST_CONNECTION: {
            return Object.assign({}, state, {
                accessVerified: (!action.payload.LOADING && !action.payload.ERROR)
            })
        }
        // payload = (bool)
        case SET_BATCH_ERROR: {
            return Object.assign({}, state, {
                batchError: action.payload
            })
        }
        // payload = { ledgers or loading or error }
        case SET_LEDGERS: {
            const newLedgers = api.set(state.ledgers, action.payload);
            return Object.assign({}, state, {
                ledgers: newLedgers,
                accessVerified: (!action.payload.ERROR)
            })
        }
        // payload = { accounts or loading or error }
        case SET_ACCOUNTS: {
            const newAccounts = api.set(state.accounts, action.payload);
            return Object.assign({}, state, {
                accounts: newAccounts,
                bankData: (newAccounts.hasAllData) ? setBank(state, { type: 'setDefault' }) : state.bankData,
                accessVerified: (!action.payload.ERROR)
            })
        }
        case SET_BANK: {
            const newBankData = setBank(state, action.payload);
            return Object.assign({}, state, { bankData: newBankData })
        }
        case SET_MATCH: {
            console.log('how did i get here?')
            // const newMatchStuff = matchReducer(state.matchStuff, action.payload);
            // return Object.assign({}, state, { matchStuff: newMatchStuff })
            return state;
        }
        case SET_CUSTOM_FIELDS: {
            return Object.assign({}, state, {
                customFields: api.set(state.customFields, action.payload),
                accessVerified: (!action.payload.ERROR)
            })
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

        // from server
        case ADD_INCOMING: {
            const newIncoming = api.set(state.incoming, action.payload);
            return Object.assign({}, state, {
                incoming: newIncoming,
                accessVerified: (!action.payload.ERROR)
            })
        }

        // payload = { incomingId, newLedgerId }
        case SET_INCOMING_LEDGER: {
            if (!state.incoming.hasData || state.incoming.data.length === 0) return state;
            const incomingList = state.incoming.data.filter((incoming) => (incoming.id === action.payload.incomingId));
            if (incomingList.length === 0) return state;
            const incomingToUpdate = incomingList[0];
            const newIncoming = setLedgerInRow(incomingToUpdate, action.payload.newLedgerId);
            if (newIncoming === incomingToUpdate) return state;
            const newIncomingList = state.incoming.data.map((incoming, i) => {
                if (incoming.id === action.payload.incomingId) {
                    return newIncoming;
                } else return incoming;
            });
            return Object.assign({}, state, {
                incoming: api.setData(newIncomingList)
            });
        }

        // payload = { contactId, fieldId, newValue }
        case SET_INCOMING_CUSTOM_FIELD: {
            if (!state.incoming.hasData || state.incoming.data.length === 0) return state;
            const newIncomingList = state.incoming.data.map((incoming) => {
                if (incoming.contact && incoming.contact.id === action.payload.contactId &&
                    incoming.contact.custom_fields && incoming.contact.custom_fields.length > 2
                    && incoming.contact.custom_fields[2].value !== action.payload.newStdLedgerName) {
                    return setCustomFieldInRow(incoming, action.payload.fieldId, action.payload.newValue);
                } else {
                    return incoming;
                }
            });
            return Object.assign({}, state, {
                incoming: api.setData(newIncomingList)
            });
        }

        // payload = { incomingId }
        case SET_INCOMING_PAYMENT: {
            if (!state.incoming.hasData || state.incoming.data.length === 0) return state;
            const incomingList = state.incoming.data.filter((incoming) => (incoming.id === action.payload.incomingId));
            if (incomingList.length === 0) return state;
            const incomingToUpdate = incomingList[0];
            const newIncoming = setPaymentInRow(incomingToUpdate);
            if (newIncoming === incomingToUpdate) return state;
            const newIncomingList = state.incoming.data.map((incoming, i) => {
                if (incoming.id === action.payload.incomingId) {
                    return newIncoming;
                } else return incoming;
            });
            return Object.assign({}, state, {
                incoming: api.set(newIncomingList)
            });
        }

        // payload = { stuff, type, page, LOADING, ERROR }
        case ADD_CONTACTS: {
            const newContacts = api.set(state.contacts, action.payload);
            return Object.assign({}, state, {
                contacts: newContacts,
                accessVerified: (!action.payload.ERROR)
            })
        }

        // payload = { contactId, fieldId, newValue }
        case SET_CONTACT_FIELD: {
            if (!state.contacts.hasData || state.contacts.data.length === 0) return state;
            const newContacts = state.contacts.data.map((contact) => {
                if (contact.id === action.payload.contactId) {
                    var newField = {};
                    newField[action.payload.fieldId] = action.payload.newValue;
                    return Object.assign({}, contact, newField);
                } else {
                    return contact;
                }
            });
            return Object.assign({}, state, {
                contacts: api.setData(newContacts)
            })
        }

        // payload = { contactId, fieldId, newValue }
        case SET_CONTACT_CUSTOM_FIELD: {
            if (!state.contacts.hasData || state.contacts.data.length === 0) return state;
            const newContacts = state.contacts.data.map((contact) => {
                if (contact.id === action.payload.contactId && contact.custom_fields) {
                    let changed = false;
                    let newCustomFields = contact.custom_fields.map((field) => {
                        if (field.id === action.payload.fieldId) {
                            changed = true;
                            return Object.assign({}, field, { value: action.payload.newValue })
                        } else {
                            return field;
                        }
                    });
                    if (!changed) {
                        newCustomFields = [...newCustomFields, {
                            id: action.payload.fieldId,
                            name: 'Keywords', // hard coded shortcut
                            value: action.payload.newValue
                        }];
                    };
                    return Object.assign({}, contact, { custom_fields: newCustomFields });
                } else {
                    return contact;
                }
            });
            return Object.assign({}, state, {
                contacts: api.setData(newContacts)
            })
        }

        case ADD_RECEIVED: {
            const newReceived = api.set(state.received, action.payload);
            return Object.assign({}, state, {
                received: newReceived,
                accessVerified: (!action.payload.ERROR)
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

        case LOGIN: {
            // for testing only
            return Object.assign({}, state, {
                accessToken: {},
                accessVerified: true
            })
        }

        case LOGOUT: {
            // for testing only
            return Object.assign({}, state, {
                accessToken: newApiData(),
                accessVerified: false
            })
        }

        case TEST: {
            return Object.assign({}, state, {
                testOutput: "Test geslaagd"
            })
        }

        case SET_TEST_RESULT: {
            return Object.assign({}, state, {
                testOutput: action.payload
            })
        }

        default:
            return state;
    }
}

export default rootReducer;
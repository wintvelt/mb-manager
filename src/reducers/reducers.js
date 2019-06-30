// src/js/reducers/reducers.js

import { DO_SNACK, DO_SNACK_ERROR,
  SET_ACCESS_OBJECT, PASSED_TEST, SET_BATCH_ERROR,
  SET_LEDGERS, SET_ACCOUNTS, SET_CUSTOM_FIELDS,
  ADD_INCOMING, SET_INCOMING_LEDGER, SET_INCOMING_CUSTOM_FIELD, SET_INCOMING_PAYMENT,
  SET_INCOMING_LOADING,
  ADD_CONTACTS, SET_CONTACT_FIELD, SET_CONTACT_CUSTOM_FIELD,
  ADD_RECEIVED,
  SET_BATCH_MSG, CLEAR_BATCH_MSG,
  LOGIN, LOGOUT, TEST, SET_TEST_RESULT, SET_CONTACTS_LOADING 
  } from "../constants/action-types";
import { setLedgerInRow, setCustomFieldInRow, setPaymentInRow } from './reducer-helpers';

// initial state also exported to root (to set default when initializing)
export const initialState = {
  newSnack: "",
  accessObject: null,
  accessVerified: false,
  testOutput: "",
  ledgers: null,
  ledgerDate: "",
  accounts: null,
  accountDate: "",
  customFields: null,
  customFieldsDate: "",
  incoming: null,
  incomingLoaded: {},
  incomingLoading: {},
  incomingDate: "",
  contacts: null,
  contactsLoaded: false,
  contactsLoading: [],
  contactsDate: "",
  received: null,
  receivedDate: "",
  batchMsg: {},
  batchError: false
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    // payload = accessObject
    case SET_ACCESS_OBJECT: {
      return Object.assign({}, state, {
        accessObject: action.payload,
        accessVerified: true
      })
    }
    // payload = ()
    case PASSED_TEST: {
      return Object.assign({}, state, {
        accessVerified: true
      })
    }
    // payload = (bool)
    case SET_BATCH_ERROR: {
      return Object.assign({}, state, {
        batchError: action.payload
      })
    }
    // payload = { ledgers, ledgerDate }
    case SET_LEDGERS: {
      return Object.assign({}, state, {
        ledgers: action.payload.ledgers,
        ledgerDate: action.payload.ledgerDate,
        accessVerified: true
      })
    }
    // payload = { ledgers, ledgerDate }
    case SET_ACCOUNTS: {
      return Object.assign({}, state, {
        accounts: action.payload.accounts,
        accountDate: action.payload.accountDate,
        accessVerified: true
      })
    }
    case SET_CUSTOM_FIELDS: {
      return Object.assign({}, state, {
        customFields: action.payload.customFields,
        customFieldsDate: action.payload.customFieldsDate,
        accessVerified: true
      })
    }

    // from server
    // payload = { incoming, incomingType, incomingDate, page }
    case ADD_INCOMING: {
      const incoming = state.incoming || [];
      // NB MUTABLE CHANGE - add type to incoming (purchase invoice or receipt)
      for (var i = 0, len = action.payload.incoming.length; i < len; i++) {
        action.payload.incoming[i].type = action.payload.incomingType;
      }
      const newIncomingLoaded = Object.assign({}, state.incomingLoaded);
      newIncomingLoaded[action.payload.incomingType] = (action.payload.incoming.length === 0);
      const newIncomingLoading = Object.assign({}, state.incomingLoading);
      newIncomingLoading[action.payload.incomingType] = 
        state.incomingLoading[action.payload.incomingType].filter(item => (item !== action.payload.page));
      return Object.assign({}, state, {
        incoming: [...incoming, ...action.payload.incoming],
        incomingDate: action.payload.incomingDate,
        incomingLoaded: newIncomingLoaded,
        incomingLoading: newIncomingLoading,
        accessVerified: true
      })
    }

    // payload = { incomingId, newLedgerId }
    case SET_INCOMING_LEDGER: {
      if (!state.incoming || state.incoming.length === 0) return state;
      const incomingList = state.incoming.filter( (incoming) => (incoming.id === action.payload.incomingId) );
      if (incomingList.length === 0) return state;
      const incomingToUpdate = incomingList[0];
      const newIncoming = setLedgerInRow(incomingToUpdate, action.payload.newLedgerId);
      if (newIncoming === incomingToUpdate) return state;
      const newIncomingList = state.incoming.map( (incoming, i) => {
        if (incoming.id === action.payload.incomingId) { 
          return newIncoming;
        } else return incoming;
      });
        return Object.assign({}, state, {
            incoming: newIncomingList
        });
    }

    // payload = { contactId, fieldId, newValue }
    case SET_INCOMING_CUSTOM_FIELD: {
      if (!state.incoming || state.incoming.length === 0) return state;
      const newIncomingList = state.incoming.map( (incoming) => {
        if (incoming.contact && incoming.contact.id === action.payload.contactId &&
          incoming.contact.custom_fields && incoming.contact.custom_fields.length > 2
          && incoming.contact.custom_fields[2].value !== action.payload.newStdLedgerName ) {
          return setCustomFieldInRow(incoming, action.payload.fieldId, action.payload.newValue);
        } else {
          return incoming;
        }
      });
      return Object.assign({}, state, {
          incoming: newIncomingList
      });
    }

    // payload = { incomingId }
    case SET_INCOMING_PAYMENT: {
      if (!state.incoming || state.incoming.length === 0) return state;
      const incomingList = state.incoming.filter( (incoming) => (incoming.id === action.payload.incomingId) );
      if (incomingList.length === 0) return state;
      const incomingToUpdate = incomingList[0];
      const newIncoming = setPaymentInRow(incomingToUpdate);
      if (newIncoming === incomingToUpdate) return state;
      const newIncomingList = state.incoming.map( (incoming, i) => {
        if (incoming.id === action.payload.incomingId) { 
          return newIncoming;
        } else return incoming;
      });
        return Object.assign({}, state, {
            incoming: newIncomingList
        });
    }

    // payload = { incomingType, page }
    case SET_INCOMING_LOADING: {
      const oldList = state.incomingLoading[action.payload.incomingType] || []
      const newIncomingLoading = Object.assign({}, state.incomingLoading);
      newIncomingLoading[action.payload.incomingType] = 
        [...new Set([...oldList, action.payload.page])]
      return Object.assign({}, state, {
        incomingLoading: newIncomingLoading
      })
    }

    // payload = { contacts, contactsDate, page }
    case ADD_CONTACTS: {
      const contacts = state.contacts || [];
      return Object.assign({}, state, {
        contacts: [...contacts, ...action.payload.contacts],
        contactsLoaded: (action.payload.contacts.length === 0),
        contactsLoading: state.contactsLoading.filter(item => (item !== action.payload.page)),
        contactsDate: action.payload.contactsDate,
        accessVerified: true
      })
    }

    // payload = { contactId, fieldId, newValue }
    case SET_CONTACT_FIELD: {
      if (!state.contacts || state.contacts.length === 0) return state;
      const newContacts = state.contacts.map((contact) => {
        if (contact.id === action.payload.contactId) {
          var newField = {};
          newField[action.payload.fieldId] = action.payload.newValue;
          return Object.assign({}, contact, newField);
        } else {
          return contact;
        }
      });
      return Object.assign({}, state, {
        contacts: newContacts
      })
    }

     // payload = { contactId, fieldId, newValue }
     case SET_CONTACT_CUSTOM_FIELD: {
      if (!state.contacts || state.contacts.length === 0) return state;
      const newContacts = state.contacts.map((contact) => {
        if (contact.id === action.payload.contactId && contact.custom_fields) {
          const newCustomFields = contact.custom_fields.map( (field) => {
            if (field.id === action.payload.fieldId) {
              return Object.assign({}, field, { value: action.payload.newValue })
            } else {
              return field;
            }
          });
          return Object.assign({}, contact, { custom_fields : newCustomFields });
        } else {
          return contact;
        }
      });
      return Object.assign({}, state, {
        contacts: newContacts
      })
    }

    case SET_CONTACTS_LOADING: {
      return Object.assign({}, state, {
        contactsLoading: [...new Set([...state.contactsLoading, action.payload])]
      })
    }

    // payload = { received, receivedDate, page }
    case ADD_RECEIVED: {
      const received = state.received || [];
      return Object.assign({}, state, {
        received: [...received, ...action.payload.received],
        receivedDate: action.payload.receivedDate,
        accessVerified: true
      })
    }

    // payload = { batchId, fetchId, res, msg }
    case SET_BATCH_MSG: {
      const batchMsgList = state.batchMsg[action.payload.batchId] || [];
      const newMsg = { fetchId: action.payload.fetchId, res: action.payload.res, msg: action.payload.msg };
      const newBatchMsgList = [...batchMsgList.filter( m => (m.fetchId !== action.payload.fetchId)), newMsg];
      const newBatchMsg = Object.assign({}, state.batchMsg);
      newBatchMsg[action.payload.batchId] = newBatchMsgList;
      return Object.assign({}, state, { batchMsg: newBatchMsg});
    }
    // payload = batchId
    case CLEAR_BATCH_MSG: {
      if (!state.batchMsg[action.payload]) return state;
      const newBatchMsg = Object.assign({}, state.batchMsg);
      delete newBatchMsg[action.payload];
      return Object.assign({}, state, { batchMsg : newBatchMsg });
    }

    // payload = msg
    case DO_SNACK: {
      return Object.assign({}, state, {
          newSnack: action.payload
      })
    }
    case DO_SNACK_ERROR: {
      // for now, simply display message
      return Object.assign({}, state, {
          newSnack: action.payload
      })
    }

    case LOGIN: {
      // for testing only
      return Object.assign({}, state, {
        accessObject : {},
        accessVerified: true
      })
    }

    case LOGOUT: {
      // for testing only
      return Object.assign({}, state, {
        accessObject : null,
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
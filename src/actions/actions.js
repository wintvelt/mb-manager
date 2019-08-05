// src/js/actions/actions.js
import { DO_SNACK, DO_SNACK_ERROR,
  SET_ACCESS_TOKEN, DELETE_ACCESS_TOKEN, 
  TEST_CONNECTION, SET_BATCH_ERROR,
  SET_LEDGERS, SET_ACCOUNTS, SET_CUSTOM_FIELDS,
  ADD_INCOMING, SET_INCOMING_LEDGER, SET_INCOMING_CUSTOM_FIELD, SET_INCOMING_PAYMENT,
  ADD_CONTACTS, SET_CONTACT_FIELD, SET_CONTACT_CUSTOM_FIELD,
  ADD_RECEIVED, SET_INCOMING_SUMS, SET_EXPORT_PENDING, SET_OPT_DELETED, SET_SYNC_PENDING,
  SET_BATCH_MSG, CLEAR_BATCH_MSG,
  LOGIN, LOGOUT, TEST, SET_TEST_RESULT 
  } from "../constants/action-types";

export function setAccessToken(payload) {
  return { type: SET_ACCESS_TOKEN, payload };
}
export function deleteAccessToken(payload) {
  return { type: DELETE_ACCESS_TOKEN, payload };
}
export function testConnection(payload) {
  return { type: TEST_CONNECTION, payload };
}
export function setBatchError(payload) {
  return { type: SET_BATCH_ERROR, payload}
}
export function setLedgers(payload) {
  return { type: SET_LEDGERS, payload };
}
export function setAccounts(payload) {
  return { type: SET_ACCOUNTS, payload };
}
export function setCustomFields(payload) {
  return { type: SET_CUSTOM_FIELDS, payload };
}

export function addIncoming(payload) {
  return { type: ADD_INCOMING, payload };
}
export function setIncomingLedger(payload) {
  return { type: SET_INCOMING_LEDGER, payload };
}
export function setIncomingCustomField(payload) {
  return { type: SET_INCOMING_CUSTOM_FIELD, payload };
}
export function setIncomingPayment(payload) {
  return { type: SET_INCOMING_PAYMENT, payload };
}
export function addContacts(payload) {
  return { type: ADD_CONTACTS, payload }
}
export function setContactField(payload) {
  return { type: SET_CONTACT_FIELD, payload }
}
export function setContactCustomField(payload) {
  return { type: SET_CONTACT_CUSTOM_FIELD, payload }
}
export function setIncomingSums(payload) {
  return { type: SET_INCOMING_SUMS, payload }
}
export function setExportPending(payload) {
  return { type: SET_EXPORT_PENDING, payload }
}
export function setOptDeleted(payload) {
  return { type: SET_OPT_DELETED, payload }
}
export function setSyncPending(payload) {
  return { type: SET_SYNC_PENDING, payload }
}

export function addReceived(payload) {
  return { type: ADD_RECEIVED, payload }
}

export function setBatchMsg(payload) {
  return { type: SET_BATCH_MSG, payload };
}
export function clearBatchMsg(payload) {
  return { type: CLEAR_BATCH_MSG, payload };
}

export function doSnack(payload) {
  return { type: DO_SNACK, payload };
}

export function doSnackError(payload) {
  return { type: DO_SNACK_ERROR, payload };
}

// TEST
export function login(payload) {
  return { type: LOGIN, payload };
}

export function logout(payload) {
  return { type: LOGOUT, payload };
}

export function testCon(payload) {
	return { type: TEST, payload };
}

export function setTestResult(payload) {
	return { type: SET_TEST_RESULT, payload };
}

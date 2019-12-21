// src/js/actions/actions.js
import { DO_SNACK, DO_SNACK_ERROR,
  SET_ACCESS_TOKEN, DELETE_ACCESS_TOKEN, 
  TEST_CONNECTION, SET_BATCH_ERROR,
  ADD_INCOMING, SET_INCOMING_SUMS, SET_EXPORT_PENDING, SET_OPT_DELETED, SET_SYNC_PENDING,
  SET_BATCH_MSG, CLEAR_BATCH_MSG,
  SET_BANK, LOGOUT
  } from "../store/action-types";

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
export function setBank(payload) {
  return { type: SET_BANK, payload };
}
export function addIncoming(payload) {
  return { type: ADD_INCOMING, payload };
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

export function logout(payload) {
  return { type: LOGOUT, payload };
}
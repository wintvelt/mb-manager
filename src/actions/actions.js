// src/js/actions/actions.js
import { DO_SNACK, DO_SNACK_ERROR,
  SET_BANK
  } from "../store/action-types";

export function setBank(payload) {
  return { type: SET_BANK, payload };
}

export function doSnack(payload) {
  return { type: DO_SNACK, payload };
}

export function doSnackError(payload) {
  return { type: DO_SNACK_ERROR, payload };
}
// src/js/store/index.js
import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import rootReducer from "../reducers/reducers";

export const store = createStore(rootReducer, applyMiddleware(thunk));

export const storeWithInit = (initObj) => createStore(rootReducer, initObj, applyMiddleware(thunk));
// for csv upload to moneybird
import { newApiData, api } from '../constants/helpers';

const defaultBank = { value: '243233339071268359', label: "KBC 1213" }; // KBC 1213 is default

export const initBankData = {
    activeAccount: null,
    config: newApiData(),
    files: newApiData()
}

export const setBank = (state, payload) => {
    const oldBankData = state.bankData;
    const oldActive = oldBankData.activeAccount;

    switch (payload.type) {
        case 'setDefault':
            console.log('setting default');
            return Object.assign({}, initBankData, { activeAccount: defaultBank });

        case 'setActiveAccount':
            console.log('setting active bank');
            return (oldActive && oldActive === payload.content) ?
                Object.assign({}, oldActive)
                : Object.assign({}, initBankData, { activeAccount: payload.content })

        case 'setConfig':
            const newConfig = api.set(oldBankData.config, payload.content);
            return Object.assign({}, oldBankData, { config: newConfig });

        case 'setFiles':
            const newFiles = api.set(oldBankData.files, payload.content);
            return Object.assign({}, oldBankData, { files: newFiles });

        default:
            return state.bankData;
    }
}
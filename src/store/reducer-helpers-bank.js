// for csv upload to moneybird
import { newApiData, api } from '../constants/helpers';
import { initApiData, apiUpdate } from '../helpers/apiData/apiData';


const defaultBank = { value: '243233339071268359', label: "KBC 1213" }; // KBC 1213 is default

export const initBankData = {
    activeAccount: defaultBank,
    config: initApiData,
    savedConfig: initApiData,
    files: initApiData,
    activeCsv: {
        filename: '',
        apiData: initApiData
    },
    convertResult: initApiData,
    deleteFile: newApiData()
}

export const setBank = (state, payload) => {
    const oldBankData = state.bankData;
    const oldActive = oldBankData.activeAccount;

    switch (payload.type) {
        case 'setDefault':
            return Object.assign({}, initBankData, { activeAccount: defaultBank });

        case 'setActiveAccount':
            const noChange = (oldActive && oldActive.value === payload.content.value);
            return noChange ?
                oldBankData
                : Object.assign({}, initBankData, { activeAccount: payload.content })

        case 'setConfig':
            const newConfig = apiUpdate(oldBankData.config, payload.content);
            return Object.assign({}, oldBankData, { config: newConfig });

        case 'setSavedConfig':
            const savedConfig = apiUpdate(oldBankData.savedConfig, payload.content);
            return Object.assign({}, oldBankData, { savedConfig: savedConfig });

        case 'setFiles':
            const newFiles = apiUpdate(oldBankData.files, payload.content);
            return Object.assign({}, oldBankData, { files: newFiles });

        case 'setCsv': {
            const { apiAction, filename } = payload.content;
            const newCsv = apiUpdate(oldBankData.activeCsv.apiData, apiAction);
            return Object.assign({}, oldBankData, {
                activeCsv: {
                    apiData: newCsv,
                    filename
                }
            });
        }

        case 'setConvertResult':
            const newConvertResult = apiUpdate(oldBankData.convertResult, payload.content);
            return Object.assign({}, oldBankData, { convertResult: newConvertResult });

        case 'resetCsv': {
            const newCsv = {
                filename: '',
                apiData: initApiData
            };
            const newConvertResult = initApiData;
            return { ...oldBankData, activeCsv: newCsv, convertResult: newConvertResult }
        }

        case 'deleteFile':
            const newDeleteFile = api.set(oldBankData.deleteFile, payload.content);
            return Object.assign({}, oldBankData, { deleteFile: newDeleteFile });

        default:
            return state.bankData;
    }
}

export const onlyCsv = (fileList) => {
    return fileList
        .filter(file => (file.last_modified && (file.last_modified.csv || file.last_modified.CSV)))
        .sort(sortDesc('filename'));
}

const sortDesc = (key) => {
    return (a, b) => {
        return (b[key] > a[key]) ? 1 :
            (a[key] > b[key]) ? -1 : 0;
    }
}

export const parseCsv = (content) => {
    // need to parse csv string first
    const semiColons = (content.match(/;/g) || []).length;
    const commas = (content.match(/,/g) || []).length;
    const separator = (semiColons > commas) ? ';' : ',';
    let arr = content.split(/\n|\r/); // split string into lines
    arr = arr.filter(line => (line.length > 0)); // remove empty lines if needed
    const parsedContent = arr.map((it, i) => {
        let row;
        try {
            row = JSON.parse('[' + it + ']');
        } catch (_) {
            row = it.split(separator);
        }
        if (!row[row.length - 1]) row = row.slice(0, -1); // remove last empty fields if needed
        return row;
    });
    return parsedContent;
}
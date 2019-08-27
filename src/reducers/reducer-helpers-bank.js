// for csv upload to moneybird
import { newApiData, api } from '../constants/helpers';

const defaultBank = { value: '243233339071268359', label: "KBC 1213" }; // KBC 1213 is default

export const initBankData = {
    activeAccount: null,
    config: newApiData(),
    files: newApiData(),
    activeCsv: newApiData(),
    convertResult: newApiData(),
    deleteFile: newApiData()
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
            const newFiles = api.set(oldBankData.files, payload.content, onlyCsv);
            return Object.assign({}, oldBankData, { files: newFiles });

        case 'setCsv':
            const newCsv = api.set(oldBankData.activeCsv, payload.content, parseCsv);
            return Object.assign({}, oldBankData, { activeCsv: newCsv });

        case 'setCsvWithOrigin':
            const newCsvWithOrigin = api.setData(parseCsv(payload.content.data), 
                null, payload.content.filename);
            return Object.assign({}, oldBankData, { activeCsv: newCsvWithOrigin });

        case 'setConvertResult':
            const newConvertResult = api.set(oldBankData.convertResult, payload.content);
            return Object.assign({}, oldBankData, { convertResult: newConvertResult });

        case 'deleteFile':
            const newDeleteFile = api.set(oldBankData.deleteFile, payload.content);
            return Object.assign({}, oldBankData, { deleteFile: newDeleteFile });

        default:
            return state.bankData;
    }
}

const onlyCsv = (fileList) => {
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

const parseCsv = (content) => {
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
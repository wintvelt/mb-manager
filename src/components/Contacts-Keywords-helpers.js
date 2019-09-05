// helpers for keywords page
import React from 'react';


export const makeRows = (contactData, keywordList) => {
    return contactData.map(contact => {
        return [
            contact.id, //id 0
            contact.company_name, //name 1
            getCustField(contact.custom_fields, 'Standaard betaling'), // std Payment 2
            getCustField(contact.custom_fields, 'Standaard categorie'), // std Category (ledger name) 3
            getCustField(contact.custom_fields, 'Owner intern'), // owner 4
            getCustField(contact.custom_fields, 'Keywords'), // keywords in store 5
            getContactKeywordState(contact.id, keywordList) // current keywords 6
        ];
    })
}

const getCustField = (custom_fields, name) => {
    const foundFields = custom_fields.filter(it => (it.name === name));
    if (foundFields.length === 0) return '';
    return foundFields[0].value;
}

const getContactKeywordState = (contactId, keywordList) => {
    const foundContactState = keywordList.filter(it => (it.contactId === contactId));
    if (foundContactState.length === 0) return null;
    return foundContactState[0].keywords;
}

// filter helper
export const filterRow = (row, filters) => {
    return (
        (filters.ownerFilter.length === 0 || filters.ownerFilter.filter(i => (i.value === row[4])).length > 0)
        && (filters.contactFilter.length === 0 || (filters.contactFilter.filter(i => (i.value === row[1])).length > 0))
        && (filters.payFilter.length === 0 || (filters.payFilter.filter(i => (i.value === row[2])).length > 0))
        && (filters.stdLedgerFilter.length === 0 || (filters.stdLedgerFilter.filter(i => (i.value === row[3])).length > 0))
        && (!filters.changeFilter || (row[6] && row[5] !== row[6]))
    )
}

// table helpers
export const HeaderRow = (props) => {
    const { sort, onClickSort } = props;
    return <li>
        <ul className='flex simple-table header'>
            {headers.map((val, i) => {
                const [sortIcon, clickDir] = (sort.key === i + 1) ?
                    (sort.asc) ? ['arrow_drop_up', false] : ['arrow_drop_down', true]
                    : [' ', true];
                return <li key={val} style={colStyle[i]}>
                    <button className='btn-flat waves-effect flex'
                        onClick={() => onClickSort({ key: i + 1, asc: clickDir })}>
                        {val} <i className='material-icons'>{sortIcon}</i>
                    </button>
                </li>
            })}
        </ul>
    </li>
}

export const Row = (props) => {
    const { row, onChange } = props;
    const isDiff = (typeof row[6] === 'string' && row[5] !== row[6]);
    const keywords = (typeof row[6] === 'string')? row[6] : row[5];
    const onChangeInput = (e) => {
        onChange({
            contactId: row[0],
            oldKeywords: row[5],
            newKeywords: e.target.value
        })
    }
    const rowStyle = (i) => {
        return { ...colStyle[i], color: (isDiff) ? 'teal' : 'inherit' }
    }
    return <li className='simple-table'>
        <ul className='simple-table flex'>
            <li style={rowStyle(0)}>{row[1]}</li>
            <li style={rowStyle(1)}>{row[2]}</li>
            <li style={rowStyle(2)}>{row[3]}</li>
            <li style={rowStyle(3)}>{row[4]}</li>
            <li style={{ ...rowStyle(4), flex: 1 }}>
                <input id={row[0]}
                    style={{ color: (isDiff) ? 'teal' : 'inherit' }}
                    type="text"
                    value={keywords} placeholder='keyword, keyword'
                    onChange={onChangeInput} />

            </li>
        </ul>
    </li>
}

const headers = ['Leverancier', 'Betaling', 'Standaard Cat', 'Owner', 'Keywords']
const colStyle = [
    ['200px', 'left'],
    ['120px', 'center'],
    ['200px', 'left'],
    ['100px', 'center'],
    ['400px', 'left']
].map(s => {
    return { width: s[0], textAlign: s[1] }
})

// reducers for ContactKeywords state
export const filterReducer = (state, newFilters) => {
    console.log('setting filters');

}

export const keywordReducer = (state, action) => {
    switch (action.type) {
        case 'SET_KEYWORDS':
            const { contactId, oldKeywords, newKeywords } = action.payload;
            let changed = false;
            let found = false;
            let newList = [];
            for (const item of state.keywords) {
                if (item.contactId === contactId) { // this is the row we are looking for
                    found = true;
                    if (newKeywords !== oldKeywords) { // the new keyword is different from store
                        if (newKeywords !== item.keywords) { // the new keyword also diff from list
                            changed = true;
                            newList = [...newList, { contactId, keywords: newKeywords }];
                        }
                    } else { // we need to omit this line from list
                        changed = true;
                    }
                } else {
                    newList = [...newList, item];
                }
            }
            if (!found) {
                newList = [...newList, { contactId, keywords: newKeywords }];
                changed = true;
            }
            const hasChanges = (newList.length > 0);
            const newFilters = (hasChanges) ? state.filters : { ...state.filters, changeFilter: false }
            if (changed) return { keywords: newList, hasChanges, filters: newFilters };
            return state;

        case 'RESET_KEYWORDS':
            const resetFilters = {...state.filters, changeFilter: false }
            return { keywords: [], hasChanges: false, filters: resetFilters }

        case 'SET_FILTERS':
            const { type, list } = action.payload;
            const newTypeFilter = list || [];
            let newFilterList;
            switch (type) {
                case "owner":
                    newFilterList = { ...state.filters, ownerFilter: newTypeFilter }
                    break;
                case "contact":
                    newFilterList = { ...state.filters, contactFilter: newTypeFilter }
                    break;
                case "pay":
                    newFilterList = { ...state.filters, payFilter: newTypeFilter }
                    break;
                case "cat":
                    newFilterList = { ...state.filters, stdLedgerFilter: newTypeFilter }
                    break;
                case "mut":
                    newFilterList = { ...state.filters, changeFilter: !state.filters.changeFilter }
                    break;
                default:
                    newFilterList = state.filters;
                    break;
            }
            return { ...state, filters: newFilterList }

        default:
            return state;
    }
}

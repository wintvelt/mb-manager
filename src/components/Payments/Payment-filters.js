// Payment-filters.js
import { filterType } from '../../helpers/filters/filters';

export const filterConfig = [
    {
        id: 'state',
        label: 'Alleen onverwerkte regels',
        placeholder: 'Alle statussen',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => !filterState || item.state === 'unprocessed',
        initial: false
    },
    {
        id: 'afBij',
        label: 'Bij- of afgeschreven',
        placeholder: 'Alle transacties',
        type: filterType.SINGLE,
        itemFilter: (selected, filterState, item) => !filterState || filterState === item.afBij,
        // initial: 'Afgeschreven'
    },
    {
        id: 'account_name',
        label: 'Rekening',
        placeholder: 'Alle rekeningen',
        type: filterType.SINGLE,
        itemFilter: (selected, filterState, item) => !filterState || filterState === item.account_name
    },
    {
        id: 'selected',
        label: 'Alleen selectie tonen',
        placeholder: 'Alles',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => !filterState || (selected.find(s => s === item.id) ? true : false)
    },
    {
        id: 'owner',
        label: 'Owner',
        placeholder: 'Alle owners',
        type: filterType.MULTI,
        itemFilter: (selected, filterState, item) => {
            return filterState.length === 0 || (filterState.find(s => s === item.owner) ? true : false)
        }
    },
    {
        id: 'noEmptyOwner',
        label: 'Alleen met owner tonen',
        placeholder: 'Alles tonen',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => {
            return !filterState || item.owner? true : false
        },
        initial: true
    }
]
// Payment-filters.js
import { filterType } from '../../helpers/filters/filters';

/*
state
ledger
owner
selected
*/

export const filterConfig = [
    {
        id: 'state',
        label: 'Status',
        placeholder: 'Alle statussen',
        type: filterType.MULTI,
        itemFilter: (selected, filterState, item) => {
            return filterState.length === 0 || (filterState.find(s => s === item.state) ? true : false)
        }
    },
    {
        id: 'ledger_name',
        label: 'Categorie',
        placeholder: 'Alle categorieën',
        type: filterType.SINGLE,
        itemFilter: (selected, filterState, item) => !filterState || filterState === item.ledger_name
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
        id: 'selected',
        label: 'Alleen selectie tonen',
        placeholder: 'Alles',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => !filterState || (selected.find(s => s === item.id) ? true : false)
    }
]
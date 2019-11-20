// Payment-filters.js
import { filterType } from '../../helpers/filters/filters';

export const filterConfig = [
    {
        id: 'company_name',
        label: 'Leverancier',
        placeholder: 'Alle leveranciers',
        type: filterType.SINGLE,
        itemFilter: (selected, filterState, item) => !filterState || filterState === item.company_name
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
        id: 'empty_owner',
        label: 'Alleen zonder owner',
        placeholder: 'Alle contacten',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => !filterState || !item.owner,
        initial: false
    },
    {
        id: 'std_ledger_name',
        label: 'Standaard categorie',
        placeholder: 'Alle categorieën',
        type: filterType.SINGLE,
        itemFilter: (selected, filterState, item) => !filterState || filterState === item.std_ledger_name
    },
    {
        id: 'noEOL_nr',
        label: 'Alleen met MB nummer',
        placeholder: 'Alle contacten',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => !filterState || item.customer_id.slice(0,2) === 'MB',
        initial: false
    },
    {
        id: 'edited',
        label: 'Alleen bewerkt',
        placeholder: 'Alle contacten',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item, edited = []) => {
            return !filterState || edited.find(ed => ed === item.id)? true: false
        },
        initial: false
    },
    {
        id: 'selected',
        label: 'Alleen selectie tonen',
        placeholder: 'Alles',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => !filterState || (selected.find(s => s === item.id) ? true : false)
    }
]
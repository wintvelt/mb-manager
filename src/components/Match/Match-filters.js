// Match-filters.js
import { filterType } from '../../helpers/filters/filters';

export const filterConfig = [
    {
        id: 'account_name',
        label: 'Rekening',
        placeholder: 'Alle rekeningen',
        type: filterType.SINGLE,
        itemFilter: (selected, filterState, item) => !filterState || filterState === item.account_name
    },
    {
        id: 'isTopper',
        label: 'Alleen top-suggesties',
        placeholder: 'Alles tonen',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => {
            return !filterState || item.isTopper
        },
        initial: true
    },
    {
        id: 'selected',
        label: 'Alleen gematchte tonen',
        placeholder: 'Alles',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => !filterState || (selected.find(s => s === item.id) ? true : false)
    }
]
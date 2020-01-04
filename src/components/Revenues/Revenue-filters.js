// Revenue-filters.js
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
        id: 'afBij',
        label: 'Bij/ afschrijvingen',
        placeholder: 'Alles',
        type: filterType.SINGLE,
        itemFilter: (selected, filterState, item) => !filterState || filterState === item.afBij
    },
    {
        id: 'selected',
        label: 'Alleen selectie tonen',
        placeholder: 'Alles',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => !filterState || (selected.find(s => s === item.id) ? true : false)
    },
    {
        id: 'ledger_name',
        label: 'Boekingsregel',
        placeholder: 'Alles',
        type: filterType.SINGLE_WITH_EMPTY,
        itemFilter: (selected, filterState, item) => !filterState || filterState === item.ledger_name ||
            (filterState === 'EMPTY' && !item.ledger_name) ||
            (filterState === 'FILLED' && item.ledger_name),
        initial: 'FILLED'
    },
    {
        id: 'deltaBooked',
        label: 'Alleen geboekt op afwijkend',
        placeholder: 'Alles',
        type: filterType.BOOLEAN,
        itemFilter: (selected, filterState, item) => (
            !filterState || (item.booked_name && item.booked_name !== item.ledger_name)
        )
    }
]
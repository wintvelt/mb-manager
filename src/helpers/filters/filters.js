// filters.js
// helpers for filters
export const filterType = {
    SINGLE: 'SINGLE',
    MULTI: 'MULTI',
    BOOLEAN: 'BOOLEAN'
}

export const initialFilters = filterConfig => filterConfig.map(f => {
    switch (f.type) {
        case filterType.SINGLE:
            return { id: f.id, value: f.initial || '' };

        case filterType.MULTI:
            return { id: f.id, value: f.initial || [] };

        case filterType.BOOLEAN:
            return { id: f.id, value: f.initial? true : false };

        default:
            return null;
    }
})

export const makeReducer = filterConfig => (state, action) => {
    const { id, payload } = action;
    const filterToUpdate = filterConfig.find(f => f.id === id);
    if (!filterToUpdate) return state;
    return state.map(it => {
        return (it.id === id) ?
            { ...it, value: payload }
            : it
    })
}

export const makeFilters = (filterConfig) => (rows, selected, filterState) => {
    const filters = filterConfig.map(fConfig => {
        const optionsList = (fConfig.type !== filterType.BOOLEAN) &&
            [...new Set([...filterRows(filterConfig)(rows, selected, filterState.filter(f => f.id !== fConfig.id))
                .map(it => it[fConfig.id])])].filter(option => option).sort();
        const options = (fConfig.type === filterType.SINGLE) ?
            ['', ...optionsList]
            : (fConfig.type === filterType.MULTI) && optionsList;
        const fState = filterState.find(f => f.id === fConfig.id);
        return {
            id: fConfig.id,
            type: fConfig.type,
            label: fConfig.label,
            placeholder: fConfig.placeholder,
            options,
            selected: fState && fState.value,
            disabled: false // TODO: at a later moment
        }
    });
    const filteredRows = filterRows(filterConfig)(rows, selected, filterState);
    return [filters, filteredRows]
}

export const filterRows = filterConfig => (rows, selected, filterState) => {
    return rows.filter(row => {
        return filterState.reduce((acc, filter) => {
            const thisConfig = filterConfig.find(f => f.id === filter.id);
            const rowPassesFilter = thisConfig.itemFilter(selected, filter.value, row);
            return acc && rowPassesFilter;
        }, true)
    })
}
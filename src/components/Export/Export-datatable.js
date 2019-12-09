// data-helpers-exprt


// function to extract stuff to render
// to extract info from incomingSums
// USES MUTABLES INSIDE
export function getFromSums(maybeIncomingSums, filters, year, optDeleted) {
    const incomingSums = maybeIncomingSums || [];
    const yearOptions = [...new Set(incomingSums.map(item => { 
        return item.createDate.slice(0, 4) }))].sort().reverse()
        .map(i => { return { value: i, label: i } });
    const selectedYear = yearOptions[year] || { value: 'loading', label: 'loading'};
    let createFromTo = { min: "", max: "" };
    let invoiceFromTo = { min: "", max: "" };
    let unexportedCount = 0;
    let mutatedCount = 0;
    let docCount = 0;
    let fileStats = {}; // uses fileName as key
    let selStatObj = {
        mutatedCount: 0, docCount: 0, unexportedCount: 0,
        createFromTo: { min: "", max: "" },
        invoiceFromTo: { min: "", max: "" }
    };
    let selection = incomingSums.filter(item => {
        if (item.createDate.slice(0, 4) !== selectedYear.value) return false;
        const inState =
            (filters.mutSelected === 'mut' && item.mutations.length > 0) ||
            (filters.mutSelected === 'new' && (!item.fileName || optDeleted.includes(item.fileName))) ||
            (filters.mutSelected === 'all');
        const inCreatedFrom = (!filters.createFrom || filters.createFrom.length < 7) ||
            (item.createDate >= filters.createFrom);
        const inCreatedTo = (!filters.createTo || filters.createTo.length < 7) ||
            (item.createDate.slice(0, filters.createTo.length) <= filters.createTo);
        const inInvoiceFrom = (!filters.invoiceFrom || filters.invoiceFrom.length < 7) ||
            (item.invoiceDate >= filters.invoiceFrom);
        const inInvoiceTo = (!filters.invoiceTo || filters.invoiceTo.length < 7) ||
            (item.invoiceDate.slice(0, filters.invoiceTo.length) <= filters.invoiceTo);
        return inState && inCreatedFrom && inCreatedTo && inInvoiceFrom && inInvoiceTo;
    }).map(item => item.id);
    for (let i = 0; i < incomingSums.length; i++) {
        const el = incomingSums[i];
        if (el.createDate.slice(0, 4) === selectedYear.value) {
            setMinMax(createFromTo, el.createDate.slice(0, 10));
            setMinMax(invoiceFromTo, el.invoiceDate);
            if (el.mutations && el.mutations.length > 0) {
                mutatedCount++;
            }
            if (!el.fileName) {
                unexportedCount++;
            }
            const fileList = el.allFiles || [];
            for (let j = 0; j < fileList.length; j++) {
                const expFileName = fileList[j];
                if (expFileName && !optDeleted.includes(expFileName)) {
                    // update filestats
                    var fileStatObj = fileStats[expFileName] ||
                        {
                            fileName: expFileName, mutatedCount: 0, docCount: 0,
                            createFromTo: { min: "", max: "" },
                            invoiceFromTo: { min: "", max: "" }
                        };
                    fileStatObj.docCount++;
                    setMinMax(fileStatObj.createFromTo, el.createDate.slice(0, 10));
                    setMinMax(fileStatObj.invoiceFromTo, el.invoiceDate);
                    // updated fileStat mutated count if needed
                    if (el.mutations && el.mutations.length > 0) {
                        fileStatObj.mutatedCount++;
                    }
                    // add file to stats if needed
                    if (!fileStats[expFileName]) { fileStats[expFileName] = fileStatObj }
                }
            }
            if (selection.includes(el.id)) {
                // update selStats
                selStatObj.docCount++;
                setMinMax(selStatObj.createFromTo, el.createDate.slice(0, 10));
                setMinMax(selStatObj.invoiceFromTo, el.invoiceDate);
                // updated fileStat mutated count if needed
                if (el.mutations && el.mutations.length > 0) {
                    selStatObj.mutatedCount++;
                }
                if (!el.fileName) selStatObj.unexportedCount++;
            }
            docCount++;
        }
    }
    return {
        yearOptions: yearOptions,
        createFromTo: createFromTo,
        invoiceFromTo: invoiceFromTo,
        docCount: docCount,
        unexportedCount: unexportedCount,
        mutatedCount: mutatedCount,
        fileStats: Object.keys(fileStats).map(key => fileStats[key]),
        selection: selection,
        selStats: selStatObj,
        selectedYear: year
    }
}

// helper to update min and max dates
// MUTABLE FUNCTION
function setMinMax(updatable = { min: "", max: "" }, dateValue) {
    if (!updatable.min || dateValue < updatable.min) { updatable.min = dateValue }
    if (!updatable.max || dateValue > updatable.max) { updatable.max = dateValue }
}

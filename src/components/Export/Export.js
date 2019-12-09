//Content for Finvision
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";

import { exportDocs, deleteFile, syncFiles } from '../../actions/api-AWS-actions';
import { getIncomingSums } from '../../actions/apiActions-new';
import { exportRows, exportHeaders, getFromSums } from './Export-datatable';
import { SortableTable, tHeadAddSelect } from '../../constants/table-helpers';
import { doSnack } from "../../actions/actions";

import { DataPanel } from '../Page/DataPanel';
import { ExportStats } from './ExportStats';
import { ExportFilters } from './ExportFilters';
import { ExportAction } from './ExportAction';
import { ExportTable } from './ExportTable';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

/*
fetch (all AWS):
    sync (to sync AWS with Moneybird)
    GET summary
    export selection
    delete a file
in store:
    incomingsums
    lastSync (date of last sync, comes with incoming sums)
    exportPending (temp store of no of docs in export)
    optDeleted (temp filename to be deleted)
    syncPending (boolean while sync is in progress)
*/

export const Export = props => {
    const { accessToken, incomingSums, exportPending, optDeleted, syncPending } = useSelector(store => {
        const { accessToken, incomingSums, exportPending, optDeleted, syncPending } = store;
        return { accessToken, incomingSums, exportPending, optDeleted, syncPending }
    });
    const dispatch = useDispatch();
    const [selectedYear, setYear] = useState(0);
    const [selectedForDelete, setSelectedForDelete] = useState('');
    const [filters, setFilters] = useState({
        createFrom: "",
        createTo: "",
        invoiceFrom: "",
        invoiceTo: "",
        mutSelected: 'new'
    });
    const onChangeInput = (field, value) => {
        setFilters({ ...filters, [field]: value });
    }
    useEffect(() => {
        if (accessToken && incomingSums.toJS().notAsked) {
            dispatch(getIncomingSums());
        }
    }, [dispatch, accessToken, incomingSums]);

    const onDelete = (filename) => {
        if (filename === selectedForDelete) {
            dispatch(doSnack('exportbestand "' + filename + '" verwijderd.'));
            dispatch(deleteFile(filename));
            setSelectedForDelete('');
        } else {
            setSelectedForDelete(filename)
        }
    }
    const onClearDelete = () => {
        setSelectedForDelete('')
    }
    const onExport = (selection, access_token) => {
        var body = {
            ids: selection,
        }
        switch (filters.mutSelected) {
            case 'new':
                body.ext = 'new';
                break;

            case 'mut':
                body.ext = 'mutaties';
                break;

            default:
                body.ext = 'all';
                body.noLog = true;
                break;
        }
        dispatch(exportDocs(body, access_token));
    }

    // main view with data
    const incomingSumsList = incomingSums.toJS().data && incomingSums.toJS().data.list;
    const hasData = incomingSumsList && incomingSumsList.length > 0;
    const lastSyncDate = incomingSums.toJS().data && incomingSums.toJS().data.syncDate;
    const { yearOptions, createFromTo, invoiceFromTo, unexportedCount, docCount,
        mutatedCount, fileStats, selection, selStats
    } = getFromSums(incomingSumsList, filters, selectedYear, optDeleted);
    const activeYear = yearOptions[selectedYear] ? ` uit ${yearOptions[selectedYear].label}` : '';
    const rows = fileStats.map(item => {
        return {
            filename: item.fileName,
            mutatedCount: item.mutatedCount,
            docCount: item.docCount,
            invoiceFrom: item.invoiceFromTo.min,
            invoiceTo: item.invoiceFromTo.max,
            createFrom: item.createFromTo.min,
            createTo: item.createFromTo.max,
        }
    });
    // const rows = exportRows(fileStats).map(row => {
    //     if (row[0].value.includes('initial')) {
    //         return [...row.slice(0, 7),
    //         Object.assign({}, row[7], { value: 'do_not_disturb', disabled: true })]
    //     }
    //     if (row[0].value !== selectedForDelete) return row;
    //     const newDeleteCell = Object.assign({}, row[7],
    //         { className: 'red white-text', value: 'delete_forever' })
    //     return [...row.slice(0, 7), newDeleteCell];
    // }).sort((a, b) => {
    //     var x = 0;
    //     if (a[0].value > b[0].value) x = 1;
    //     if (a[0].value < b[0].value) x = -1;
    //     return x;
    // });
    const olderYear = yearOptions[selectedYear + 1] && yearOptions[selectedYear + 1].label;
    return (
        <Grid>
            <DataPanel expanded={false} onChange={() => {
                if (olderYear) setYear(olderYear)
            }}
                title={`inkomende facturen en statistieken${activeYear}`}
                apiDataSources={[incomingSums]}
                apiTitles={['statistieken']}
                flat
            >
                {olderYear ?
                    <Button color='primary'>
                        Data uit {olderYear} ophalen
                </Button>
                    : <></>}
            </DataPanel>
            {hasData && <ExportStats lastSync={lastSyncDate} accessToken={accessToken}
                syncPending={syncPending}
                invoiceFromTo={invoiceFromTo} createFromTo={createFromTo}
                docCount={docCount} unexportedCount={unexportedCount} mutatedCount={mutatedCount} />}
            {hasData && <Grid container spacing={2} style={{ alignItems: 'stretch', paddingTop: '24px' }}>
                <ExportFilters unexportedCount={unexportedCount} docCount={docCount} mutatedCount={mutatedCount}
                    filters={filters} onChangeInput={onChangeInput} />
                <ExportAction filters={filters} selStats={selStats} exportPending={exportPending} />
            </Grid>}
            <ExportTable rows={rows} />
            {/* <div className="row">
                <div className="section">
                    <SortableTable headers={headers} rows={rows}
                        onSelect={() => { }} hideKey={false}
                        sortValue='Bestand' sortDirection='down' />
                </div>
            </div> */}
        </Grid>
    );
}


export default Export;
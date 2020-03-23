// For exporting incoming invoices to Finvision for
// a) reporting VAT to tax authorities
// b) getting monthly statement of costs per category
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { getVatExportData, exportVat, deleteVatFile } from '../../actions/apiActions-new';
import { DO_SNACK } from '../../store/action-types';
import { DataPanel } from '../Page/DataPanel';
import { VatStats } from './VatStats';
import { VatAdmin } from './VatAdmin';
import { VatFilters } from './VatFilters';
import { VatAction } from './VatAction';
import { VatTable } from './VatTable';

const VatExport = (props) => {
    const isAdmin = (props.location && props.location.search && props.location.search === '?admin=true');
    const { vatExportListNew, vatExportPending, optDeleted, accessToken } = useSelector(store => {
        const { vatExportListNew, vatExportPending, optDeleted, accessToken } = store;
        return { vatExportListNew, vatExportPending, optDeleted, accessToken };
    });
    const vatExport = vatExportListNew.toJS();
    const vatExportData = vatExport && vatExport.data;
    const docCount = vatExportData && vatExportData.unexported.doc_count;
    const latestExportName = vatExportData && vatExportData.unexported.latest_export_name;
    const hasOlder = vatExportData && vatExportData.hasOlder;
    const hasFiles = vatExportData && vatExportData.files.length > 0;
    const [year, setYear] = useState(new Date().getFullYear());

    const access_token = accessToken.toJS().data;

    const dispatch = useDispatch();
    useEffect(() => {
        if (access_token) dispatch(getVatExportData(access_token, year))
    }, [access_token, year, dispatch]);

    const [selection, setSelection] = useState({
        invoiceFrom: "",
        invoiceTo: "",
    });
    const onChangeInput = (field, value) => {
        setSelection({ ...selection, [field]: value });
    }

    const [selectedForDelete, setSelectedForDelete] = useState('');
    const onDelete = (filename) => {
        if (selectedForDelete && filename === selectedForDelete) {
            dispatch({
                type: DO_SNACK,
                payload: 'exportbestand "' + filename + '" verwijderd.'
            });
            dispatch(deleteVatFile(filename, year, access_token));
            setSelectedForDelete('');
        } else {
            setSelectedForDelete(filename)
        }
    }

    const onExport = (selection, access_token) => {
        let body = {
            start_date: selection.invoiceFrom,
            end_date: selection.invoiceTo
        }
        dispatch(exportVat(body, year, access_token));
    }

    const rows = vatExportData && vatExportData.files
        .filter(file => !optDeleted.includes(file.filename))
        .map(file => ({
            id: file.filename,
            noDelete: file.filename !== latestExportName,
            ...file
        }))

    return <Grid>
        <DataPanel expanded={false} onChange={() => {
            if (hasOlder) setYear(year - 1)
        }}
            title={`BTW exports vanaf ${year}`}
            apiDataSources={[vatExportListNew]}
            apiTitles={['BTW export statistieken']}
            flat
            actionsInSummary
        >
            {hasOlder ?
                <Button color='primary' variant='contained'>
                    Exports vanaf {year - 1} ophalen
                </Button>
                : <></>}
        </DataPanel>
        <VatStats unexported={(vatExport.hasData)? vatExportData.unexported : {}} />
        {isAdmin && <VatAdmin /> }
        <Grid container spacing={2} style={{ alignItems: 'stretch', paddingTop: '24px' }}>
            <VatFilters selection={selection} onChangeInput={onChangeInput} />
            <VatAction vatExportPending={vatExportPending} vatExport={vatExport} docCount={docCount}
                onExport={() => onExport(selection, access_token)} />
        </Grid>
        {hasFiles && <VatTable rows={rows}
            latestExportName={latestExportName}
            selected={selectedForDelete ? [selectedForDelete] : []}
            onSelect={onDelete} />}
        {/* <pre>{JSON.stringify(vatExportData, null, 2)}</pre> */}
    </Grid>
}

export default VatExport;
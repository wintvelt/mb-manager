// For exporting incoming invoices to Finvision for
// a) reporting VAT to tax authorities
// b) getting monthly statement of costs per category
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%'
    }
}));


const VatExport = (props) => {
    // const admin = (props.location && props.location.search && props.location.search === '?admin=true');
    // const { accountsNew, bankData, accessToken } = useSelector(store => {
    //     const { accountsNew, bankData, accessToken } = store;
    //     return { accountsNew, bankData, accessToken };
    // });
    // const accounts = accountsNew.toJS();
    // const access_token = accessToken.toJS().data;
    // const activeAccount = bankData && bankData.activeAccount;
    // const active_account = activeAccount && activeAccount.value;
    // const dispatch = useDispatch();

    const classes = useStyles();

    // useEffect(() => {
    //     if (accounts.notAsked) dispatch(getAccounts(access_token))
    // }, [accounts, access_token, dispatch]);
    // useEffect(() => {
    //     if (active_account && access_token) {
    //         dispatch(getBankActiveConfig(active_account, access_token));
    //         dispatch(getBankActiveFiles(active_account, access_token));
    //     }
    // }, [active_account, access_token, dispatch])
    // const onChangeAccount = (value) => {
    //     dispatch(setBank({ type: 'setActiveAccount', content: value }))
    // }
    // const [dataPanelOpen, setDataPanelOpen] = useState(false);
    return <Grid>
        <DataPanel expanded={false} onChange={() => { }}
            title={`BTW exports vanaf ${activeYear}`}
            apiDataSources={[incomingSums]}
            apiTitles={['statistieken']}
            flat
            actionsInSummary
        >
            {olderYear ?
                <Button color='primary' variant='contained'>
                    Exports vanaf {olderYear} ophalen
                </Button>
                : <></>}
        </DataPanel>
        {hasData && <ExportStats lastSync={lastSyncDate} accessToken={accessToken}
            onSync={onSync} syncPending={syncPending}
            invoiceFromTo={invoiceFromTo} createFromTo={createFromTo}
            docCount={docCount} unexportedCount={unexportedCount} mutatedCount={mutatedCount} />}
        {hasData && <Grid container spacing={2} style={{ alignItems: 'stretch', paddingTop: '24px' }}>
            <ExportFilters unexportedCount={unexportedCount} docCount={docCount} mutatedCount={mutatedCount}
                filters={filters} onChangeInput={onChangeInput} />
            <ExportAction filters={filters} selStats={selStats}
                exportPending={exportPending} onExport={() => onExport(selection, accessToken.data)} />
        </Grid>}
        {rows.length > 0 && <ExportTable rows={rows}
            selected={selectedForDelete ? [selectedForDelete] : []}
            onSelect={onDelete} />}
    </Grid>
}

export default VatExport;
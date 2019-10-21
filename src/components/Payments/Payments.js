// Payments.js
import React, { useState, useEffect, useMemo, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveAs } from 'file-saver';

import { getContacts, getAccounts } from '../../actions/apiActions-new';
import { derivedPayments } from './Payments-table';
import EnhancedTable from './Payments-table-helpers';
import PaymentsData from './PaymentsData';
import { PaymentFilters, filterConfig } from './Payment-filters';
import { makeXls, timestamp } from './Payment-xls-download';
import { initialFilters, makeReducer, makeFilters, filterType } from '../../helpers/filters/filters';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';

const updateFilters = makeReducer(filterConfig);
const initFilters = initialFilters(filterConfig);
const getFilters = makeFilters(filterConfig);

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
        flexBasis: '10rem',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center'
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.primary,
        alignSelf: 'center'
    },
    icon: {
        marginRight: '1rem',
        height: '24px;'
    }
}));

export default function Payments() {
    const classes = useStyles();
    const accessToken = useSelector(store => store.accessToken);
    const access_token = accessToken.data;
    const payments = useSelector(store => store.payments.get('apiData'));
    const paymentsList = payments.toJS();
    const contacts = useSelector(store => store.contactsNew.get('apiData'));
    const contactsList = contacts.toJS();
    const hasContacts = contactsList.hasAllData;
    const accounts = useSelector(store => store.accountsNew);
    const accountsList = accounts.toJS();
    const paymentsData = useMemo(() => {
        return derivedPayments(paymentsList.data, contactsList.data, accountsList.data)
    }, [paymentsList.data, contactsList.data, accountsList.data])
    const dispatch = useDispatch();
    const [expanded, setExpanded] = useState([]);
    const [selected, setSelected] = useState([]);
    const [filterState, setFilters] = useReducer(updateFilters, initFilters);
    const [filters, rows] = getFilters(paymentsData, selected, filterState);
    const filterObj = filters.map(f => {
        return {
            ...f,
            onChange: selected => {
                setFilters({ id: f.id, payload: selected })
            }
        }
    });
    const appliedFilters = filterState.filter(f => {
        const fConfig = filterConfig.find(fc => fc.id === f.id);
        return fConfig.type === filterType.BOOLEAN ? f.value
            : fConfig.type === filterType.SINGLE ? (f.value) ? true : false
                : f.value && f.value.length > 0

    });
    const filterCount = appliedFilters.length > 0 ? appliedFilters.length : 'Geen';

    useEffect(() => {
        if (!hasContacts) {
            dispatch(getAccounts(access_token));
            dispatch(getContacts(access_token));
        }
    }, [dispatch, access_token, hasContacts])

    const handlePanel = panel => (event, isIn) => {
        const newExpanded = (!isIn) ?
            expanded.filter(it => it !== panel)
            : [...expanded, panel];
        setExpanded(newExpanded);
    };

    const handleDownload = () => {
        const selectedRows = paymentsData.filter(item => selected.includes(item.id));
        const workbook = makeXls([
            { header: 'Id', key: 'id', width: 20 },
            { header: 'Datum', key: 'date', width: 10 },
            { header: 'Owner', key: 'owner', width: 10 },
            { header: 'Contact', key: 'name', width: 20 },
            { header: 'Rekening', key: 'account_name', width: 10 },
            { header: 'Bedrag', key: 'amount', width: 10, style: { numFmt: '"€"#,##0.00;[Red]-"€"#,##0.00' } },
            { header: 'Omschrijving', key: 'message', width: 60, style: { alignment: { wrapText: true } } }
        ], selectedRows);
        const filename = `moblybird betalingen ${timestamp()}.xlsx`;

        workbook.xlsx.writeBuffer().then(function (data) {
            let blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, filename);
        });
    }

    return <div className={classes.root}>
            <PaymentsData expanded={expanded.includes('loading')} onChange={handlePanel('loading')}
                access_token={access_token}
                payments={payments} contacts={contacts} accounts={accounts}/>
            <ExpansionPanel expanded={expanded.includes('filters')} onChange={handlePanel('filters')}>
                <ExpansionPanelSummary
                    expandIcon={<Icon>expand_more</Icon>}
                    aria-controls="filters-panel-header"
                    id="filters-panel-header"
                >
                    <Typography className={classes.heading}>
                        <Icon className={classes.icon}>filter_list</Icon>
                        Filters
                        </Typography>
                    <Typography className={classes.secondaryHeading}>
                        {`${filterCount} filter${filterCount === 1 ? '' : 's'} toegepast`}
                    </Typography>
                </ExpansionPanelSummary>
                <PaymentFilters filterObj={filterObj} />
            </ExpansionPanel>
            <EnhancedTable rows={rows} selected={selected} onSelect={setSelected} onDownload={handleDownload} />
        </div >
}
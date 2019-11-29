// Payments.js
import React, { useState, useEffect, useMemo, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getContacts, getAccounts } from '../../actions/apiActions-new';
import { derivedPayments } from './Payments-datatable';
import PaymentsData from './PaymentsData';
import { filterConfig } from './Payment-filters';
import { FilterPanel } from '../Page/FilterPanel';
import { paymentDownload } from './Payment-xls-download';
import { initialFilters, makeReducer, makeFilters, filterType } from '../../helpers/filters/filters';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Chip from '@material-ui/core/Chip';
import PaymentsTable from './PaymentsTable';

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
    const contactsNotAsked = contactsList.notAsked;
    const accounts = useSelector(store => store.accountsNew);
    const accountsList = accounts.toJS();
    const accountsNotAsked = accountsList.notAsked;
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
    const filterBadgeTxt = filterCount > 0 ?
        `${rows.length} van ${paymentsData.length}`
        : '';

    useEffect(() => {
        if (accountsNotAsked) dispatch(getAccounts(access_token));
        if (contactsNotAsked) dispatch(getContacts(access_token));
    }, [dispatch, access_token, contactsNotAsked, accountsNotAsked])

    const handlePanel = panel => (event, isIn) => {
        const newExpanded = (!isIn) ?
            expanded.filter(it => it !== panel)
            : [...expanded, panel];
        setExpanded(newExpanded);
    };

    const handleDownload = () => {
        const selectedRows = paymentsData.filter(item => selected.includes(item.id));
        paymentDownload(selectedRows);
    }

    return <div className={classes.root}>
        <PaymentsData expanded={expanded.includes('loading')} onChange={handlePanel('loading')}
            access_token={access_token}
            payments={payments} contacts={contacts} accounts={accounts} />
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
                <Typography component='div' className={classes.secondaryHeading}>
                    {`${filterCount} filter${filterCount === 1 ? '' : 's'} toegepast`}
                    {filterBadgeTxt && <Chip size='small' label={filterBadgeTxt} />}
                </Typography>
            </ExpansionPanelSummary>
            <FilterPanel filterObj={filterObj} />
        </ExpansionPanel>
        <PaymentsTable rows={rows}
            selected={selected} onSelect={setSelected} onDownload={handleDownload}
            tableTitle='Banktransacties' />
    </div >
}
// Revenues.js
// to book payments on ledger account

import React, { useEffect, useState, useReducer } from 'react';
import { useSelector, useDispatch } from "react-redux";

import {
    getAccounts, getLedgers,
    getRevenueConfig, saveRevenueConfig, deleteRevenueConfig
} from '../../actions/apiActions-new';
import { batchBookingPost } from '../../actions/apiActions-post';
import { SET_REVENUE_CONFIG_MANUAL, DEL_REVENUE_CONFIG_MANUAL, RESET_PAYMENTS_NEW } from '../../store/action-types';
import BookingRules from './BookingRules';
import { BookingRuleAdd, BookingRuleAddDialog } from './BookingRuleAdd';
import { newRuleOrder, ruleSort } from './BookingRule-helpers';
import RevenuesData from './RevenuesData';
import { filterConfig } from './Revenue-filters';
import { FilterPanel } from '../Page/FilterPanel';
import Dialog from '../Page/Dialog';
import { initialFilters, makeReducer, makeFilters, filterType } from '../../helpers/filters/filters';

import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Icon from '@material-ui/core/Icon';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';

import RevenuesTable from './RevenuesTable';
import { makeValidLedgerOptions } from './BookingRule-helpers';

const useStyles = makeStyles(theme => ({
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
}))

const updateFilters = makeReducer(filterConfig);
const initFilters = initialFilters(filterConfig);
const getFilters = makeFilters(filterConfig);

const Revenues = props => {
    const { accessToken, accountsNew, revenueConfig, ledgersNew, payments } =
        useSelector(store => ({
            accessToken: store.accessToken.toJS(),
            accountsNew: store.accountsNew,
            revenueConfig: store.revenueConfig,
            ledgersNew: store.ledgersNew,
            payments: store.payments.get('apiData')
        }));
    const dispatch = useDispatch();
    const classes = useStyles();
    useEffect(() => {
        dispatch({ type: RESET_PAYMENTS_NEW })
    }, [dispatch]);
    const accountsRaw = accountsNew.toJS();
    const accounts = { ...accountsRaw, data: accountsRaw.data && accountsRaw.data.filter(acc => acc.active)}
    const accountsNotAsked = accounts.notAsked;
    const revenueRules = revenueConfig.toJS();
    const revenueRulesNotAsked = revenueRules.notAsked;
    const revenueRulesData = revenueRules.data || [];
    const revenueRulesDataExt = revenueRulesData.map(rule => ({ ...rule, data: JSON.parse(rule.data) }))
        .sort(ruleSort).map(rule => rule.data);
    const ledgers = ledgersNew.toJS();
    const ledgersNotAsked = ledgers.notAsked;
    const access_token = accessToken.data;
    const paymentsData = payments.toJS().data;
    const paymentsDataExt = paymentsData && accounts.data && ledgers.data && revenueRules.hasAllData &&
        paymentsData.map(payment => {
            const account = accounts.data.find(it => it.id === payment.financial_account_id);
            const account_name = account && account.name;
            const isPositive = (payment.amount.slice(0, 1) !== '-');
            const message = payment.message.toLowerCase();
            const ruleFound = revenueRulesDataExt.find(rule => {
                const includes = rule.include && rule.include.toLowerCase().split(',').map(kw => kw.trim())
                const excludes = rule.exclude && rule.exclude.toLowerCase().split(',').map(kw => kw.trim())
                return rule.account === payment.financial_account_id &&
                    ((rule.isPositive === 'Af' && !isPositive) || (rule.isPositive === 'Bij' && isPositive)) &&
                    (!includes || includes.reduce((outcome, kw) => outcome || message.includes(kw), false)) &&
                    (!excludes || excludes.reduce((outcome, kw) => outcome && !message.includes(kw), true))
            });
            const ledgerId = ruleFound && ruleFound.ledger;
            const ledger = ledgerId && ledgers.data.find(it => it.id === ledgerId);
            const ledger_name = ledger && ledger.name;
            return {
                ...payment,
                account_name,
                ledgerId,
                ledger_name
            }
        });
    useEffect(() => {
        if (accountsNotAsked) dispatch(getAccounts(access_token));
        if (revenueRulesNotAsked) dispatch(getRevenueConfig());
        if (ledgersNotAsked) dispatch(getLedgers(access_token));
    }, [dispatch, accountsNotAsked, revenueRulesNotAsked, ledgersNotAsked, access_token]);
    const [panelsOpen, setPanelsOpen] = useState([]);
    const panelIsOpen = name => !!panelsOpen.find(it => it === name);
    const onPanelToggle = name => () => {
        const wasInList = !!panelsOpen.find(it => it === name);
        const newList = wasInList ?
            panelsOpen.filter(it => it !== name)
            : [...panelsOpen, name]
        setPanelsOpen(newList);
    }
    const [activeRule, setActiveRule] = useState(null);
    const onClickRule = rule => e => setActiveRule(rule);

    const [selectedPayments, setSelectedPayments] = useState([]);
    const selectionHasEmpty = paymentsDataExt && !!paymentsDataExt.find(payment => (
        selectedPayments.includes(payment.id) && !payment.ledgerId
    ));

    const [actionState, setActionState] = useState({ open: false, selected: {} });
    const onActionOpen = (newActionOpenState) => {
        setActionState({
            open: newActionOpenState,
            selected: {}
        });
    }
    const onActionSubmit = (access_token) => {
        setActionState({
            ...actionState,
            open: false
        });
        const selectedPaymentswithUpdate = paymentsDataExt
            .filter(payment => selectedPayments.includes(payment.id))
            .map(payment => { return { 
                payment, 
                ledgerId: payment.ledgerId || actionState.selected.value 
            } });
        dispatch(batchBookingPost(selectedPaymentswithUpdate, access_token));
        setSelectedPayments([]);
    }
    const ledgerOptions = ledgers.data && makeValidLedgerOptions(ledgers.data);

    const [filterState, setFilters] = useReducer(updateFilters, initFilters);
    const [filters, rows] = getFilters(paymentsDataExt || [], selectedPayments, filterState);
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
    const filterBadgeTxt = paymentsDataExt && filterCount > 0 ?
        `${rows.length} van ${paymentsDataExt.length}`
        : '';

    const handleSubmitRules = (id, rule, callback) => {
        const newRule = rule.order ? rule : { ...rule, order: newRuleOrder(rule, revenueRules.data) }
        dispatch(saveRevenueConfig(id, newRule, callback));
        const newData = { id, data: JSON.stringify(newRule) };
        dispatch({ type: SET_REVENUE_CONFIG_MANUAL, payload: newData });
        setActiveRule(null);
    }
    const handleDelete = (id) => {
        dispatch(deleteRevenueConfig(id));
        dispatch({ type: DEL_REVENUE_CONFIG_MANUAL, payload: { id } });
    }

    return <div>
        <RevenuesData access_token={access_token}
            payments={payments} revenueConfig={revenueConfig} ledgers={ledgersNew}
            accounts={accountsNew}
            expanded={panelIsOpen('data')}
            onChange={onPanelToggle('data')}
        />
        <ExpansionPanel expanded={panelIsOpen('config')} onChange={onPanelToggle('config')}>
            <ExpansionPanelSummary
                expandIcon={<Icon>expand_more</Icon>}>
                <Icon color='secondary' style={{ marginRight: '1rem' }}>settings</Icon>
                <Typography>
                    {`Boekingsregels ${revenueRules.data ? '(' + revenueRules.data.length + ')' : ''}`}
                </Typography>
            </ExpansionPanelSummary>
            <BookingRules
                accounts={accounts} ledgers={ledgers} revenueRules={revenueRules}
                onDelete={handleDelete}
                onEdit={onClickRule}
                onSubmit={handleSubmitRules}
            />
            <BookingRuleAdd onClick={onClickRule({ id: null })} />
        </ExpansionPanel>
        {paymentsDataExt && <ExpansionPanel expanded={panelIsOpen('filters')} onChange={onPanelToggle('filters')}>
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
        </ExpansionPanel>}
        {paymentsDataExt &&
            <RevenuesTable rows={rows} selected={selectedPayments} onSelect={setSelectedPayments}
                onMulti={() => onActionOpen(true)}
            />
        }
        {/* <pre>{JSON.stringify({selectionHasEmpty})}</pre> */}
        {/* <pre>{JSON.stringify(paymentsDataExt, null, 2)}</pre> */}
        <BookingRuleAddDialog accounts={accounts} ledgers={ledgers}
            open={!!activeRule} rule={activeRule}
            onAbort={onClickRule(null)} onSubmit={handleSubmitRules} />
        <Dialog
            open={actionState.open}
            dialogTitle={`${selectedPayments.length} betaling${selectedPayments.length === 1 ? '' : 'en'} boeken`}
            dialogText={selectionHasEmpty? 
                'Je selectie bevat ook betalingen zonder automatische toewijzing. ' +
                'Kies een nieuwe categorie voor deze betalingen.'
                : 'Alle betalingen hebben een automatische toewijzing. ' +
                'Klik om ze in Moneybird te verwerken.'
            }
            options={selectionHasEmpty && ledgerOptions}
            onChange={selectionHasEmpty && (item => setActionState({ open: true, selected: item }))}
            placeholder='kies een categorie'
            label='Categorie'
            onHandleClose={() => onActionOpen(false)}
            onSubmit={() => onActionSubmit(access_token)}
            selected={selectionHasEmpty && actionState.selected}
        />
    </div>
}

export default Revenues;

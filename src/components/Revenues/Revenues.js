// Revenues.js
// to book payments on ledger account

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";

import {
    getAccounts, getLedgers,
    getRevenueConfig, saveRevenueConfig, deleteRevenueConfig
} from '../../actions/apiActions-new';
import { SET_REVENUE_CONFIG_MANUAL, DEL_REVENUE_CONFIG_MANUAL } from '../../store/action-types';
import BookingRules from './BookingRules';
import { BookingRuleAdd, BookingRuleAddDialog } from './BookingRuleAdd';
import { newRuleOrder } from './BookingRule-helpers';
import RevenuesData from './RevenuesData';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';

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
    const accounts = accountsNew.toJS();
    const accountsNotAsked = accounts.notAsked;
    const revenueRules = revenueConfig.toJS();
    const revenueRulesNotAsked = revenueRules.notAsked;
    const ledgers = ledgersNew.toJS();
    const ledgersNotAsked = ledgers.notAsked;
    const access_token = accessToken.data
    useEffect(() => {
        if (accountsNotAsked) dispatch(getAccounts(access_token));
        if (revenueRulesNotAsked) dispatch(getRevenueConfig());
        if (ledgersNotAsked) dispatch(getLedgers(access_token));
    }, [dispatch, accountsNotAsked, revenueRulesNotAsked, ledgersNotAsked, access_token]);
    const [panelsOpen, setPanelsOpen] = useState([]);
    const panelIsOpen = name => !!panelsOpen.find(it => it === name);
    const [activeRule, setActiveRule] = useState(null);
    const onClickRule = rule => e => setActiveRule(rule);
    const onPanelToggle = name => () => {
        const wasInList = !!panelsOpen.find(it => it === name);
        const newList = wasInList ?
            panelsOpen.filter(it => it !== name)
            : [...panelsOpen, name]
        setPanelsOpen(newList);
    }
    const handleSubmit = (id, rule, callback) => {
        console.log({id, order: rule.order})
        const newRule = rule.order? rule : {...rule, order: newRuleOrder(rule,revenueRules.data)}
        dispatch(saveRevenueConfig(id, newRule, callback));
        const newData = { id, data: JSON.stringify(newRule)};
        dispatch({ type: SET_REVENUE_CONFIG_MANUAL, payload: newData});
        setActiveRule(null);
    }
    const handleDelete = (id) => {
        dispatch(deleteRevenueConfig(id));
        dispatch({ type: DEL_REVENUE_CONFIG_MANUAL, payload: { id }});
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
                <Typography>
                    {`Boekingsregels ${revenueRules.data ? '(' + revenueRules.data.length + ')' : ''}`}
                </Typography>
            </ExpansionPanelSummary>
            <BookingRules
                accounts={accounts} ledgers={ledgers} revenueRules={revenueRules}
                onDelete={handleDelete}
                onEdit={onClickRule}
                onSubmit={handleSubmit}
            />
            <BookingRuleAdd onClick={onClickRule({id:null})} />
        </ExpansionPanel>
        <BookingRuleAddDialog accounts={accounts} ledgers={ledgers}
            open={!!activeRule} rule={activeRule}
            onAbort={onClickRule(null)} onSubmit={handleSubmit} />
    </div>
}

export default Revenues;

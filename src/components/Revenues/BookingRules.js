// BookingRules.js
import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import CircularProgress from '@material-ui/core/CircularProgress';

import { inSameGroup } from './BookingRule-helpers';

const useStyles = makeStyles(theme => ({
    root: {
        flexDirection: 'column'
    },
    loader: {
        marginRight: theme.spacing(2)
    },
    row: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        minHeight: '48px'
    },
    headerRow: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.text.secondary
    },
    ruleAccount: {
        width: '144px',
        marginRight: theme.spacing(2)
    },
    ruleIsPositive: {
        width: '48px',
        marginRight: theme.spacing(2)
    },
    ruleKeywords: {
        width: '200px',
        marginRight: theme.spacing(2),
        flex: 1
    },
    ruleLedger: {
        width: '240px',
        marginRight: theme.spacing(2)
    },
    ruleActions: {
        width: '100px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    button: {
        marginRight: '60px'
    },
    buttonFiller: {
        minWidth: '30px'
    }
}));

const Loader = ({ data, title }) => {
    const classes = useStyles();
    return <ExpansionPanelDetails>
        <CircularProgress size={24} className={classes.loader} />
        <Typography color='secondary'>
            {data.isError && `Fout bij ophalen ${title}.`}
            {!data.isError && `Ophalen ${title}.`}
        </Typography>
    </ExpansionPanelDetails>
}

const RuleRow = ({ rule, isHeader, selForDelete, onClickDel, onEdit, handleSwap }) => {
    const { id, data, prev, next } = rule;
    const ruleData = isHeader ? rule : data;
    const classes = useStyles();
    const isSelForDelete = id && id === selForDelete;
    const delColor = isSelForDelete ? 'error' : 'primary';
    const delButton = isSelForDelete ? 'delete_forever' : 'delete';
    const onMove = otherId => e => handleSwap(id, otherId);
    return <div className={isHeader ? classes.headerRow : classes.row}>
        <Typography className={classes.ruleAccount}>{ruleData.account}</Typography>
        <Typography className={classes.ruleIsPositive}>{ruleData.isPositive}{ruleData.order}</Typography>
        <Typography className={classes.ruleKeywords} variant='body2'>{ruleData.include}</Typography>
        <Typography className={classes.ruleKeywords} variant='body2'>{ruleData.exclude}</Typography>
        <Typography className={classes.ruleLedger}>{ruleData.ledger}</Typography>
        <div className={classes.ruleActions}>
            {!isHeader && <>
                <IconButton color='primary' size='small' onClick={onEdit(id)}>
                    <Icon>edit</Icon>
                </IconButton>
                <IconButton size='small' onClick={onClickDel(id)}>
                    <Icon color={delColor}>{delButton}</Icon>
                </IconButton>
                {prev && <IconButton color='primary' size='small' onClick={onMove(prev)}>
                    <Icon>arrow_upward</Icon>
                </IconButton>}
                {!prev && <div className={classes.buttonFiller} />}
                {next && <IconButton color='primary' size='small' onClick={onMove(next)}>
                    <Icon>arrow_downward</Icon>
                </IconButton>}
                {!next && <div className={classes.buttonFiller} />}
            </>}
            {isHeader && <>
                <IconButton size='small' className={classes.button} onClick={onClickDel()}
                    disabled={!selForDelete}>
                    <Icon >close</Icon>
                </IconButton>
            </>}
        </div>
    </div>
}

const BookingRules = props => {
    const { accounts, ledgers, revenueRules, onDelete, onEdit, onSubmit } = props;
    const accountsData = accounts.data || [];
    const ledgersData = ledgers.data || [];
    const classes = useStyles();
    const [selForDelete, setSelForDelete] = useState(null);
    const onClickDel = id => e => {
        if (id === selForDelete) {
            onDelete(id)
            setSelForDelete(null);
        }
        else setSelForDelete(id);
    }
    const handleEdit = id => {
        return onEdit(revenueRules.data.find(rule => rule.id === id))
    }
    if (!revenueRules.hasAllData || !accounts.hasAllData || !ledgers.hasAllData) {
        return <Loader data={revenueRules} title='boekingsregels' />
    }
    const rules = revenueRules.data.map(rule => {
        const data = JSON.parse(rule.data);
        const account = accountsData.find(it => it.id === data.account);
        const ledger = ledgersData.find(it => it.id === data.ledger);
        return {
            id: rule.id,
            data: {
                ...data,
                account: account && account.name,
                ledger: ledger && ledger.name
            }
        }
    });
    const sortedRules = rules.sort((aRule, bRule) => {
        const a = aRule.data;
        const b = bRule.data;
        const aKey = a.account + a.isPositive + a.order;
        const bKey = b.account + b.isPositive + b.order;
        return aKey > bKey ? 1
            : aKey < bKey ? -1
                : 0;
    });
    const sortedRulesExt = sortedRules.map((rule, i) => {
        const prev = i > 0 && inSameGroup(rule, sortedRules[i - 1]) && sortedRules[i - 1].id;
        const next = inSameGroup(rule, sortedRules[i + 1]) && sortedRules[i + 1].id;
        return {
            ...rule,
            prev,
            next
        }
    });
    const handleSwap = (id1, id2) => {
        const rule1 = revenueRules.data.find(rule => rule.id === id1);
        const data1 = rule1 && JSON.parse(rule1.data);
        const rule2 = revenueRules.data.find(rule => rule.id === id2);
        const data2 = rule2 && JSON.parse(rule2.data);
        onSubmit(
            rule1.id,
            { ...data1, order: data2.order },
            () => onSubmit(rule2.id, { ...data2, order: data1.order }));
    }
    return <ExpansionPanelDetails className={classes.root}>
        <RuleRow isHeader onClickDel={onClickDel} selForDelete={selForDelete} rule={{
            account: 'Bankrekening',
            isPositive: 'Bij/ af',
            include: 'Met keywords',
            exclude: 'Zonder keywords',
            ledger: 'Boeken op'
        }} />
        {sortedRulesExt.map(rule => (
            <RuleRow rule={rule} key={rule.id}
                onClickDel={onClickDel} selForDelete={selForDelete}
                onEdit={handleEdit}
                handleSwap={handleSwap} />
        ))}
    </ExpansionPanelDetails>
}

export default BookingRules;
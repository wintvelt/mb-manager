import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import { TableLink, AmountBlock } from '../Page/helpers';

// styles
const useStyles = makeStyles(theme => ({
    matchCard: {
        margin: '16px 0 0 0',
        fontSize: '0.9375rem'
    },
    actionBar: {
        backgroundColor: '#eeeeee'
    },
    paymentBadge: {
        marginRight: '8px',
        backgroundColor: '#e0e0e0',
        fontSize: 'smaller',
        verticalAlign: 'text-bottom'
    },
    paymentText: {
        marginRight: '8px',
        flexShrink: 0
    },
    paymentTextAfter: {
        marginLeft: '8px',
        marginRight: '8px'
    },
    scoreContainer: {
        height: '18px',
        flexShrink: 0,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: blue.A400,
        backgroundColor: 'white',
        borderRadius: '4px',
        width: '64px',
        overflow: 'hidden',
        marginRight: '16px'
    },
    scoreBar: {
        height: '14px',
        backgroundColor: blue.A400
    },
    suggestionCheckbox: {
        minWidth: '36px'
    },
    suggestionText: {
        display: 'flex',
        alignItems: 'center'
    }
}));

const baseInvUrl = 'https://moneybird.com/243231934476453244/documents/';
const basePayUrl = 'https://moneybird.com/243231934476453244/financial_mutations/';

const PayItem = (props) => {
    const classes = useStyles();
    const { payment } = props;
    return <ListItem>
        <ListItemText
            primary={<>
                <span className={classes.paymentBadge}>{payment.date}</span>
                <span className={classes.paymentBadge}>{payment.account_name}</span>
                <span className={classes.paymentText}>{payment.contra_account_name}</span>
                <span className={classes.paymentText}>{payment.contra_account_number}</span>
            </>}
            secondary={<TableLink
                hrefBase={basePayUrl}
                hrefEnd={payment.id}
                initValue={payment.message} />
            }
        />
        <AmountBlock amount={parseFloat(payment.amount)} />
    </ListItem>
}

const LinkedDoc = (props) => {
    const { payItem } = props;
    return <ListItem>
        <ListItemAvatar>
            <Avatar>
                <Icon size='small'>receipt</Icon>
            </Avatar>
        </ListItemAvatar>
        <div style={{ flex: 1 }}>
            <TableLink
                hrefBase={baseInvUrl}
                hrefEnd={payItem.invoice_id}
                initValue='Gekoppeld aan bonnetje of factuur' />
        </div>
        <AmountBlock amount={-parseFloat(payItem.price_base)} indent secondary />
    </ListItem>
}

const LinkedCat = (props) => {
    const { ledgerItem } = props;
    const classes = useStyles();

    const content = `Gekoppeld aan categorie ${ledgerItem.ledger_name}`;
    return <ListItem>
        <ListItemAvatar>
            <Avatar>
                <Icon size='small'>euro</Icon>
            </Avatar>
        </ListItemAvatar>
        <div style={{ flex: 1 }}>
            {content}
        </div>
        <AmountBlock amount={parseFloat(ledgerItem.price)} />
    </ListItem>
}

const SuggestionLine = props => {
    const { related, selected, onSelect } = props;
    const classes = useStyles();
    return <ListItem key={related.id} button dense component='li'
        style={{ fontSize: '.875rem', paddingRight: '32px' }}
        selected={selected}
        onClick={onSelect}>
        <ListItemIcon className={classes.suggestionCheckbox}>
            <Checkbox
                color='primary'
                edge="start"
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': related.id }}
                checked={selected}
            />
        </ListItemIcon>
        <div className={classes.scoreContainer}>
            <div className={classes.scoreBar} style={{ width: `${related.percScore}%` }}></div>
        </div>
        <span className={classes.paymentText}>{related.date}</span>
        <span className={classes.paymentText}>{related.type}</span>
        <span>
            <TableLink
                hrefBase={'https://moneybird.com/243231934476453244/documents/'}
                hrefEnd={related.id}
                initValue={related.message} />
            <span className={classes.paymentTextAfter}>{related.detailText}</span>
        </span>
        <AmountBlock amount={related.amount} openAmount={related.openAmount} indent secondary />
    </ListItem>
}

const SuggestionBlock = props => {
    const { payment, selected, onSelect } = props;
    const related = payment.related || [];
    const [selectedSuggestion, setSelectedSuggestion] = useState(selected);
    const midCount = related.filter(it => it.percScore >= 50 && it.percScore < 90
        && it.id !== selectedSuggestion).length;
    const lowCount = related.filter(it => it.percScore < 50
        && it.id !== selectedSuggestion).length;
    const [scoreShown, setScoreShown] = useState(90);
    const relatedToShow = related.filter(it => it.percScore >= scoreShown || it.id === selectedSuggestion);
    const shownCount = relatedToShow.length;
    const moreSuggestions = scoreShown === 90 ? midCount + lowCount
        : scoreShown === 50 ? lowCount : 0;
    const hasMore = moreSuggestions > 0;
    const hasLess = scoreShown < 90 && midCount + lowCount > 0;

    const classes = useStyles();

    const handleSelect = id => e => {
        if (e.target.parentNode && e.target.parentNode.href) return;
        setSelectedSuggestion(id !== selectedSuggestion && id);
        onSelect(id);
    }
    const onMore = e => {
        const newScoreShown =
            scoreShown === 0 ? 90
                : scoreShown === 50 ?
                    lowCount > 0 ? 0 : 90
                    : midCount > 0 ? 50 : 0;
        setScoreShown(newScoreShown);
    }
    return <div className={classes.actionBar}>
        <List>
            {relatedToShow.map(r => {
                const isSelected = r.id === selectedSuggestion;
                return <SuggestionLine related={r} key={r.id}
                    selected={isSelected} onSelect={handleSelect(r.id)} />
            }
            )}
            {(hasMore || hasLess) && <ListItem>
                <Button color='primary' aria-label="suggestions"
                    onClick={onMore}>
                    <Icon>{hasMore ? 'expand_more' : 'expand_less'}</Icon>
                    {hasMore ? `${shownCount? 'meer' : 'toon'} suggesties (${moreSuggestions})` : 'minder tonen'}
                </Button>
            </ListItem>}
        </List>
    </div>
}

const MatchCard = (props) => {
    const classes = useStyles();
    const { payment, onSelect, selected } = props;
    const relatedCount = payment.related ? payment.related.length : 0;
    const handleSelect = invoiceId => {
        onSelect(payment.id, invoiceId);
    }

    return <Card className={classes.matchCard}>
        <CardContent>
            <List>
                <PayItem payment={payment} />
                {payment.payments.map(payItem => <LinkedDoc key={payItem.id} payItem={payItem} />)}
                {payment.ledger_account_bookings.map(item => <LinkedCat key={item.id} ledgerItem={item} />)}
            </List>

        </CardContent>
        {(relatedCount > 0) && <SuggestionBlock payment={payment} onSelect={handleSelect} selected={selected} />}
    </Card>
}

export default function MatchTable(props) {
    const { rows, selected, onSelect, onDownload, onMulti } = props;

    const handleSelect = (paymentId, invoiceId) => {
        const newPayment = { paymentId, invoiceId };
        const oldPaymentInSelected = selected && selected.find(s => s.paymentId === paymentId);
        const shouldRemoveOld = oldPaymentInSelected && oldPaymentInSelected.invoiceId === invoiceId;
        const newSelected = oldPaymentInSelected ?
            shouldRemoveOld ?
                selected.filter(s => s.paymentId !== paymentId)
                : selected.map(s => s.paymentId === paymentId ? newPayment : s)
            : [...selected, newPayment]
        onSelect(newSelected);
    }

    return <>
        {rows.map((row, i) => {
            const paymentInSelected = selected && selected.find(s => s.paymentId === row.id);
            const selectedInvoice = paymentInSelected && paymentInSelected.invoiceId;
            return <MatchCard payment={row} idx={i} key={i} selected={selectedInvoice} onSelect={handleSelect} />
        })}
    </>
}
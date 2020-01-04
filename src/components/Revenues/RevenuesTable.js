import React from 'react';
import { EnhancedTable } from '../Page/TablePanel';
import { adminCode } from '../../actions/apiActions-new';

import Icon from '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

const headCells = [
    { id: 'date', numeric: true, disablePadding: true, wider: '2rem', label: 'Datum' },
    { id: 'account_name', label: 'Rekening' },
    { id: 'amount', numeric: true, label: 'Bedrag' },
    { id: 'message', label: 'Omschrijving' },
    { id: 'ledger_name', label: 'Categorie volgens regels' }
];

const withThousand = (amtStr) => {
    return (amtStr.slice(0, 1) === '-') ?
        (amtStr.length > 4) ?
            withThousand(amtStr.slice(0, -3)) + '.' + amtStr.slice(-3)
            : amtStr
        : (amtStr.length > 3) ?
            withThousand(amtStr.slice(0, -3)) + '.' + amtStr.slice(-3)
            : amtStr
}

const prettyAmount = (amount) => {
    const mainAmt = Math.floor(amount);
    const cents = Math.round(amount * 100 - mainAmt * 100);
    const centStr = (cents < 10) ? '0' + cents : cents.toString();
    return <>
        <span>{withThousand(mainAmt.toString())},</span>
        <span style={{ fontSize: '.6rem', verticalAlign: 'top' }}>{centStr}</span>
    </>
}

const rowCells = [
    { key: 'date', padding: 'none', align: 'right' },
    { key: 'account_name' },
    { key: 'amount', align: 'right', prettify: prettyAmount },
    {
        key: 'message',
        hrefBase: `https://moneybird.com/${adminCode}/financial_mutations/`,
        hrefKey: 'id',
        prettify: (message) => message.replace(/\//g, ' ')
    },
    {
        key: 'ledger_name', style: { width: '240px' },
        render: (row) => (
            row.booked_name && row.booked_name !== row.ledger_name ?
                <Tooltip title={<Typography>{row.booked_name}</Typography>} placement='top'>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {row.ledger_name}{'\u00A0'}
                        <Icon color='error'>warning</Icon>
                    </div>
                </Tooltip>
                : row.ledger_name
        )
    }
]

export default function RevenuesTable(props) {
    const { rows, selected, onSelect, onMulti, simulation } = props;
    const title = simulation ? 'Ontvangsten voor simulatie' : 'Betalingen voor verwerking';
    return <EnhancedTable rows={rows}
        selected={selected} onSelect={onSelect}
        tableTitle={title}
        onMulti={simulation ? undefined : onMulti}
        headCells={headCells}
        rowCells={rowCells}
    />
}
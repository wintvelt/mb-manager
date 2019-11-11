import React from 'react';
import { EnhancedTable } from '../Page/TablePanel';
import { adminCode } from '../../actions/apiActions';

const headCells = [
  { id: 'date', numeric: true, disablePadding: true, wider: '2rem', label: 'Datum' },
  { id: 'account_name', numeric: true, disablePadding: false, label: 'Rekening' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Contact' },
  { id: 'amount', numeric: true, disablePadding: false, label: 'Bedrag' },
  { id: 'owner', numeric: true, disablePadding: false, label: 'Owner' },
  { id: 'state', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'message', numeric: false, disablePadding: false, label: 'Omschrijving' },
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
  { key: 'account_name', align: 'right' },
  {
    key: 'name',
    hrefBase: `https://moneybird.com/${adminCode}/documents/filter/state:open%7Clate,contact_id:`,
    hrefKey: 'contactId'
  },
  { key: 'amount', align: 'right', prettify: prettyAmount },
  { key: 'owner', align: 'right' },
  {
    key: 'state',
    align: 'center',
    prettify: (state) => {
      const styles = {
        badgeOK: {
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#61B9AD',
          color: 'white',
          fontSize: '0.7rem'
        },
        badgeNOK: {
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#EE2B29',
          color: 'white',
          fontSize: '0.7rem'
        }
      };
      return <span style={state === 'processed' ? styles.badgeOK : styles.badgeNOK} >
        {state === 'processed' ? 'ok' : 'open'}
      </span >
    }
  },
  {
    key: 'message',
    hrefBase: 'https://moneybird.com/243231934476453244/financial_mutations/',
    hrefKey: 'id',
    prettify: (message) => message.replace(/\//g, ' ')
  }
]

export default function PaymentsTable(props) {
  const { rows, selected, onSelect, onDownload, onMulti } = props;
  return <EnhancedTable rows={rows}
    selected={selected} onSelect={onSelect}
    tableTitle='Banktransacties'
    onDownload={onDownload}
    onMulti={onMulti}
    headCells={headCells}
    rowCells={rowCells}
  />
}
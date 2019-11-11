import React from 'react';
import { EnhancedTable } from '../Page/TablePanel';
import { adminCode } from '../../actions/apiActions';

/*
Datum
Referentie
Leverancier
Bedrag
Status
Owner
Categorie
*/


const headCells = [
  { id: 'date', numeric: true, disablePadding: true, wider: '2rem', label: 'Datum' },
  { id: 'reference', numeric: false, disablePadding: false, label: 'Referentie' },
  { id: 'contact_name', numeric: false, disablePadding: false, label: 'Leverancier' },
  { id: 'amount', numeric: true, disablePadding: false, label: 'Bedrag' },
  { id: 'state', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'owner', numeric: false, disablePadding: false, label: 'Owner' },
  { id: 'ledger_name', numeric: false, disablePadding: false, label: 'Categorie' },
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
  { key: 'reference', align: 'left' },
  {
    key: 'contact_name',
    hrefBase: `https://moneybird.com/${adminCode}/documents/filter/state:open%7Clate,contact_id:`,
    hrefKey: 'contactId'
  },
  { key: 'amount', align: 'right', prettify: prettyAmount },
  {
    key: 'state',
    align: 'center',
    prettify: (state) => {
      const styles = {
        badgePaid: {
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#61B9AD',
          color: 'white',
          fontSize: '0.7rem'
        },
        badgeLate: {
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#EE2B29',
          color: 'white',
          fontSize: '0.7rem'
        },
        badgeOpen: {
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: '#DE9E36',
          color: 'white',
          fontSize: '0.7rem'
        },
      };
      const stateStyle = (state === 'paid' || state === 'payment_pending') ?
        styles.badgePaid
        : (state === 'late') ?
          styles.badgeLate
          : styles.badgeOpen;
      return <span style={stateStyle} >
        {state === 'payment_pending' ? 'paying' : state}
      </span >
    }
  },
  { key: 'owner', align: 'left' },
  { key: 'ledger_name', align: 'left' }
]

export default function IncomingTable(props) {
  const { rows, selected, onSelect, onDownload, onMulti, tableTitle } = props;
  return <EnhancedTable rows={rows}
    selected={selected} onSelect={onSelect}
    tableTitle={tableTitle}
    onDownload={onDownload}
    onMulti={onMulti}
    headCells={headCells}
    rowCells={rowCells}
  />
}
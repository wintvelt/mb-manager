// Match-Main.js
import React from 'react';
import { loadComp } from '../constants/helpers';

const MatchMain = (props) => {
    const { matchStuff, filterState } = props;
    const { invoices, payments, invoiceIds, paymentIds } = matchStuff;
    if (payments.isLoading || paymentIds.isLoading) {
        return <div className="section">
            <div className='row'>
                <h5>Matchen van betalingen aan bonnetjes</h5>
                <p>{invoices.data && invoices.data.length + ' invoices opgehaald'}</p>
                {loadComp(invoiceIds, 'Ophalen IDs van bonnetjes', 'Foutje', 'IDs van bonnetjes binnen')}
                {loadComp(invoices, 'Ophalen bonnetjes', 'Foutje', 'Bonnetjes binnen')}
                {loadComp(paymentIds, 'Ophalen IDs van betalingen', 'Foutje', 'IDs van betalingen binnen')}
                {loadComp(payments, 'Ophalen betalingen', 'Foutje', 'Betalingen binnen')}
            </div>
        </div>
    }
    if (payments.hasAllData && paymentIds.hasAllData) {
        const data = payments.data.filter(p => (!filterState.onlyOpen || p.state !== 'processed'));
        return <div>
            <h5>No worries, got data</h5>
            <ul>
                {data.map(payment => {
                    return <Payment key={payment.id} payment={payment} invoices={invoices} />
                })}
                <Pre data={data} id='financial_account_id' />
            </ul>
        </div>
    }
    if (invoices.notAsked && payments.notAsked) {
        return <div>Maak eerst een selectie</div>
    }
    return <div>
        <h5>something else?</h5>
        <pre></pre>
    </div>
}

const Payment = (props) => {
    const { payment, invoices } = props;
    const { id, state, date, message, amount, amount_open, payments, ledger_account_bookings } = payment;
    // (invoice_id) type (afgeleide)
    // (invoice_id) factuurnr
    // (invoice_id) contact.company_name
    // (invoice_id) date
    // (invoice_id) total_price_incl_tax_base
    // (invoice_id) details
    // amount
    // description
    return <li className='row card'>
        <ul>
            <li>
                <ul className='flex payment'>
                    <li className='pay-icon'><PayState state={state} id={id} /></li>
                    <li style={{ flex: '1' }}>
                        <p style={{ fontSize: '110%' }}>
                            <span className='grey lighten-3'>{date}</span>
                            {message}
                        </p>
                    </li>
                    <li>
                        <Amount amount={amount} amount_open={amount_open} />
                    </li>
                </ul>
            </li>
            {(payments && payments.length > 0) ?
                payments.map(inv => <Booking key={inv.id} type='inv' item={inv} />)
                : <></>
            }
            {(ledger_account_bookings && ledger_account_bookings.length > 0) ?
                ledger_account_bookings.map(bkg => <Booking key={bkg.id} type='ledger' item={bkg} />)
                : <></>
            }
            {(amount_open !== '0.0' && invoices.hasData) ?
                <ConnectRow payment={payment} invoices={invoices} />
                : <></>
            }
        </ul>
    </li>
}

const baseUrl = 'https://moneybird.com/243231934476453244/financial_mutations/';
const btnBaseClass = 'btn btn-floating btn-flat waves-effect';


const PayState = (props) => {
    const { state, id } = props;
    const link = baseUrl + id;
    const [btnClass, icon] = (state === 'processed') ?
        [btnBaseClass + ' teal', 'link']
        : [btnBaseClass + ' orange', 'radio_button_unchecked'];
    return <a className={btnClass} href={link} target='_blank' rel='noopener noreferrer'>
        <i className='material-icons'>{icon}</i>
    </a>
}

const Amount = (props) => {
    const { amount, amount_open } = props;
    return <div className='amount-container'>
        <FormattedAmount amount={amount} />
        {(amount_open && amount_open !== '0.0' && amount_open !== amount) ?
            <FormattedAmount amount={amount_open} className='smaller' preText={'open:'} />
            : <></>
        }
    </div>

}

const FormattedAmount = (props) => {
    const { amount, className, preText } = props;
    const [eurs, cents] = amount.split('.');
    const amountCls = (className) ? 'amount ' + className : 'amount';
    return <div className={amountCls}>
        <span className='cur'>{preText} € {addComma(eurs) + ','}</span>
        <span>{twoDigits(cents)}</span>
    </div>

}

const addComma = (str, end = '') => {
    if (str.length <= 3) return str + end;
    if (str.length === 4 && str.slice(0, 1) === '-') return str + end;
    return addComma(str.slice(0, -3), '.' + str.slice(-3) + end)
}

const twoDigits = amountStr => {
    if (amountStr.length === 1) return amountStr + '0';
    return amountStr
}

const baseInvUrl = 'https://moneybird.com/243231934476453244/documents/';

// helper for invoice line
const Booking = (props) => {
    const { item, type } = props;
    const { id, invoice_id, price_base, price } = item;
    const amount = (type === 'inv') ? flip(price_base) : price;
    const btnClass = btnBaseClass + ' grey';
    const icon = (type === 'inv') ? 'note' : 'euro_symbol';
    return <li className='booking'>
        <ul className='flex payment'>
            <li className='book-icon'>
                <a className={btnClass} href='#' target='_blank' rel='noopener noreferrer'>
                    <i className='material-icons'>{icon}</i>
                </a>
            </li>
            <li style={{ flex: 1 }}>
                {(type === 'inv') ?
                    <a className='flex' href={baseInvUrl + invoice_id}
                        target='_blank' rel='noopener noreferrer'>
                        Gekoppeld aan factuur of bonnetje{'\u00A0'}<i className='material-icons tiny'>launch</i>
                    </a>
                    : <span className='flex grey-text text-darken-2'>
                        Direct gekoppeld aan een categorie
                </span>
                }
            </li>
            <li style={{ color: '#757575' }}>
                <Amount amount={amount} />
            </li>
        </ul>
    </li>

}

const flip = (str) => {
    if (!str) return str;
    return (str.slice(0, 1) === '-') ? str.slice(1) : '-' + str;
}

// helper to connect payment to invoice
const ConnectRow = (props) => {
    const { payment, invoices } = props;
    const closeInvoices = getRelated(payment, invoices.data);
    return <li className='grey lighten-2'>
        <ul className='flex payment'>
            <li className='book-icon'>
                <span className={btnBaseClass + ' grey'} href='#' target='_blank' rel='noopener noreferrer'>
                    <i className='material-icons'>link</i>
                </span>
            </li>
            <li style={{ flex: 1 }}>
                <ul>
                    {(closeInvoices.map(inv => {
                        return <ConnectOption key={inv.id} inv={inv} />
                    }))}
                </ul>
            </li>
        </ul>
    </li>
}
const THRESHOLD = 1;

const getRelated = (payment, invoices) => {
    const { amount, date, message } = payment;
    const amt = parseFloat(amount);
    const related = [...invoices].filter(inv => {
        const diff = parseFloat(flip(inv.total_price_incl_tax_base)) - amt;
        return (diff > -THRESHOLD && diff < THRESHOLD)
    })
    return related;
}

const ConnectOption = (props) => {
    const { inv } = props;
    const link = baseInvUrl+inv.id;
    return <li className='connect'>
        <ul className='flex payment'>
            <li><StateDing state={inv.state} /></li>
            <li style={{ minWidth: '92px' }}>{inv.date}</li>
            <li>{(inv.type === 'receipt') ? 'BON' : 'INK'}</li>
            <li style={{ flex: 1 }}>
                <a href={link} target='_blank' rel='noopener noreferrer'>
                    {inv.reference} - {inv.contact && inv.contact.company_name}
                    {'\u00A0'}<i className='material-icons tiny'>launch</i>
                </a>
            </li>
            <li></li>
            <li style={{ color: '#757575' }}>
                <Amount amount={inv.total_price_incl_tax_base || '0.0'} />
            </li>
        </ul>
    </li>
}

const StateDing = (props) => {
    const { state } = props;
    const dingColor = (state === 'paid') ? 'green'
        : (state === 'payment_pending') ? 'blue'
            : (state === 'late') ? 'red'
                : 'orange'
    const dingClass = 'state-ding ' + dingColor;
    return <div className={dingClass}></div>
}

// helper component for dev
const Pre = (props) => {
    const { data, id } = props;
    const newData = data.map(it => it[id]);
    return <pre>
        {JSON.stringify(newData, null, 2)}
    </pre>
}

export default MatchMain;
// Match-Main.js
import React, { useState } from 'react';
import { loadComp } from '../constants/helpers';

const MatchMain = (props) => {
    const { matchStuff, filterState } = props;
    const { invoices, payments, invoiceIds, paymentIds } = matchStuff;
    if (payments.isLoading || paymentIds.isLoading) {
        return <div className="container">
            <div className='row'>
                <h5>Matchen van betalingen aan bonnetjes</h5>
                {loadComp(payments, 'Ophalen betalingen', 'Foutje', 'Betalingen', paymentIds.data)}
            </div>
        </div>
    }
    if (payments.hasAllData && paymentIds.hasAllData) {
        const data = payments.data.filter(p => {
            return (
                (!filterState.onlyOpen || p.state !== 'processed')
                && (!filterState.onlyMatched || p.hasToppers)
            )
        });
        const Payments = () => {
            return <ul>
                {data.map(payment => {
                    return <Payment key={payment.id} payment={payment} />
                })}
            </ul>
        }

        return <div className='container'>
            <div className='row'>
                <button className='btn right'>Selectie Koppelen</button>
            </div>
            {loadComp(invoices, 'Ophalen bonnetjes', 'Foutje', 'Bonnetjes', invoiceIds.data)}
            <Payments />
        </div>
    }
    if (invoices.notAsked && payments.notAsked) {
        return <div>Maak eerst een selectie</div>
    }
    return <div>
        <h5>something else?</h5>
    </div>
}

const Payment = (props) => {
    const { payment } = props;
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
        <ul className='pay-card'>
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
            {(amount_open !== '0.0') ?
                <ConnectRow payment={payment} />
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
    const { invoice_id, price_base, price } = item;
    const amount = (type === 'inv') ? flip(price_base) : price;
    const btnClass = btnBaseClass + ' disabled';
    const icon = (type === 'inv') ? 'note' : 'euro_symbol';
    return <li className='booking'>
        <ul className='flex payment'>
            <li className='book-icon'>
                <div className={btnClass}>
                    <i className='material-icons'>{icon}</i>
                </div>
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
    const { payment } = props;
    const { related, thresholds } = payment;
    const [state, setState] = useState(10);
    if (related && related.length > 0) {
        const relatedShown = related.filter(inv => (inv.totalScore > state));
        const hasMore = (related.length - relatedShown.length > 0);
        const btnClass = (hasMore) ? btnBaseClass + ' grey' : btnBaseClass + ' grey';
        const icon = (hasMore) ? 'expand_more' : 'expand_less';
        const direction = (hasMore) ? 1 : -1;
        const onMore = (direction) => {
            const newThreshold = (direction > 0) ?
                thresholds[thresholds.indexOf(state) + direction]
                : 10;
            setState(newThreshold);
        }
        return <li className='grey lighten-2'>
            <ul className='flex payment'>
                <li className='book-icon'>
                    <button className={btnClass} onClick={() => onMore(direction)}>
                        <i className='material-icons'>{icon}</i>
                    </button>
                </li>
                <li style={{ flex: 1 }}>
                    {(relatedShown.length > 0) ?
                        <ul>
                            {(relatedShown.map(inv => {
                                return <ConnectOption key={inv.id} inv={inv} />
                            }))}
                        </ul>
                        : <span className='btn-flat' onClick={() => onMore(1)}>Klik om suggesties te zien</span>
                    }
                </li>
            </ul>
        </li>
    }
    return <li className='grey lighten-2'>
        <ul className='flex payment'>
            <li className='book-icon'>
                <span className={btnBaseClass + ' disabled'}>
                    <i className='material-icons'>close</i>
                </span>
            </li>
            <li style={{ flex: 1 }}>
            </li>
        </ul>
    </li>
}

const ConnectOption = (props) => {
    const { inv } = props;
    const link = baseInvUrl + inv.id;
    return <li className='connect'>
        <ul className='flex payment'>
            <li><StateDing state={inv.state} /></li>
            <li style={{ minWidth: '80px' }}>
                <div className='score-bar outer'>
                    <div className='score-bar inner' style={{ width: scorePerc(inv.totalScore) }}></div>
                </div>
            </li>
            <li style={{ minWidth: '50px' }}>{inv.totalScore}</li>
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

// helper for score calc
const scorePerc = (score) => {
    const perc = (score > 15) ? 100
        : (score >= 10) ? 75
            : (score >= 5) ? 50
                : (score > 0) ? 10
                    : 1;
    return perc + '%';
}

const StateDing = (props) => {
    const { state } = props;
    const dingColor = (state === 'paid') ? 'green'
        : (state === 'payment_pending') ? 'blue'
            : (state === 'late') ? 'red'
                : 'orange'
    const dingClass = 'state-ding ' + dingColor;
    return <label className='flex'>
        <input type="checkbox" />
        <span className='checkbox-span'></span>
    </label>
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
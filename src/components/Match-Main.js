// Match-Main.js
import React, { useState } from 'react';
import { loadComp } from '../constants/helpers';

const MatchMain = (props) => {
    const { matchStuff, filterState, accounts, selected, setSelected } = props;
    const { invoices, payments, invoiceIds, paymentIds } = matchStuff;

    const onSubmit = () => {
        console.log({ selected });
    }

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
                && (!filterState.onlySelection || selected.find(s => (s.payId === p.id)))
            )
        });
        const btnClass = (selected.length > 0) ? 'btn right' : 'btn right disabled';
        const btnText = (selected.length === 1) ?
            `${selected.length} betaling koppelen`
            : (selected.length > 1) ?
                `${selected.length} betalingen koppelen`
                : 'Selectie koppelen';

        return <div className='container'>
            <div className='row'>
                <button className={btnClass} onClick={onSubmit}>{btnText}</button>
            </div>
            {loadComp(invoices, 'Ophalen bonnetjes', 'Foutje', 'Bonnetjes', invoiceIds.data)}
            <Payments data={data} accounts={accounts} selected={selected} onSelect={setSelected} />
        </div>
    }
    if (invoices.notAsked && payments.notAsked) {
        return <div>Maak eerst een selectie</div>
    }
    return <div>
        <h5>something else?</h5>
    </div>
}

const Payments = (props) => {
    const { data, accounts, selected, onSelect } = props;

    return <ul>
        {data.map(payment => {
            return <Payment key={payment.id} payment={payment} accounts={accounts}
                selected={selected} onSelect={onSelect} />
        })}
    </ul>
}


const Payment = (props) => {
    const { payment, accounts, selected, onSelect } = props;
    const { id, state, date, message, amount, amount_open, financial_account_id,
        payments, ledger_account_bookings } = payment;
    const account = accounts.find(ac => (ac.id === financial_account_id));
    const accountName = (account) ? `${account.name}` : '';
    const spanClass = 'grey lighten-2';
    const paySelObj = selected.find(it => (it.payId === id));
    const paySelected = paySelObj && paySelObj.invId;
    return <li className='row card'>
        <ul className='pay-card'>
            <li>
                <ul className='flex payment'>
                    <li className='pay-icon'><PayState state={state} id={id} /></li>
                    <li style={{ flex: '1' }}>
                        <p style={{ fontSize: '110%' }}>
                            <span className={spanClass}>{date}</span>
                            <span className={spanClass}>{accountName}</span>
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
            <ConnectRow payment={payment} selected={paySelected} onSelect={onSelect} />
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
    const [shownState, setShownState] = useState(10);
    const { payment, selected, onSelect } = props;
    const { id, related, thresholds, amount_open } = payment;
    const onSelectInv = (invId, amount) => {
        onSelect(id, invId, flip(amount));
    }
    const myRelated = related || [];
    const relatedShown = myRelated.filter(inv => (inv.totalScore > shownState));
    const hasMore = (myRelated.length - relatedShown.length > 0);
    const btnColor = (selected) ? btnBaseClass + ' blue' : btnBaseClass + ' grey';
    const btnClass = (myRelated.length > 0) ?
        (hasMore) ? btnColor : btnColor
        : btnColor + ' disabled';
    const icon = (myRelated.length > 0) ?
        (hasMore) ? 'expand_more' : 'expand_less'
        : 'close';
    const direction = (hasMore) ? 1 : -1;
    const onMore = (direction) => {
        const newThreshold = (direction > 0) ?
            thresholds[thresholds.indexOf(shownState) + direction]
            : 10;
        setShownState(newThreshold);
    }
    return (amount_open !== '0.0') ?
        <li className='grey lighten-2'>
            <ul className='flex payment'>
                <li className='book-icon'>
                    <button className={btnClass} onClick={() => onMore(direction)}>
                        <i className='material-icons'>{icon}</i>
                    </button>
                </li>
                <li style={{ flex: 1 }}>
                    {(myRelated.length > 0) ?
                        (relatedShown.length > 0) ?
                            <ul>
                                {(relatedShown.map(inv => {
                                    return <ConnectOption key={inv.id} inv={inv} onSelect={onSelectInv} selected={selected} />
                                }))}
                            </ul>
                            : <span className='btn-flat' onClick={() => onMore(1)}>Klik om suggesties te zien</span>
                        : <></>
                    }
                </li>
            </ul>
        </li>
        : <></>
}

const ConnectOption = (props) => {
    const { inv, onSelect, selected } = props;
    const link = baseInvUrl + inv.id;
    const onSelectInv = () => {
        onSelect(inv.id, inv.total_price_incl_tax_base);
    }
    return <li className='connect'>
        <ul className='flex payment' onClick={onSelectInv}>
            <li><StateDing selected={selected} id={inv.id} /></li>
            <li style={{ minWidth: '80px' }}>
                <div className='score-bar outer'>
                    <div className='score-bar inner' style={{ width: scorePerc(inv.totalScore) }}></div>
                </div>
            </li>
            <li style={{ minWidth: '92px' }}>{inv.date}</li>
            <li>{(inv.type === 'receipt') ? 'BON' : 'INK'}</li>
            <li style={{ flex: 1 }}>
                <a href={link} target='_blank' rel='noopener noreferrer'>
                    {inv.reference} - {inv.contact && inv.contact.company_name}
                    {'\u00A0'}<i className='material-icons tiny'>launch</i>
                </a>
                {(inv.details && inv.details.length > 1) ?
                    <span>{inv.details.map(d => `${d.amount} ${amtFmt(d.price)}`).join(', ')}</span>
                    : <></>
                }
            </li>
            <li></li>
            <li style={{ color: '#757575' }}>
                <Amount amount={inv.total_price_incl_tax_base || '0.0'} />
            </li>
        </ul>
    </li>
}

// helper for amount
const amtFmt = (amtStr) => {
    const [eur, cnt] = amtStr.split('.');
    const cntStr = (cnt) ? (cnt.length === 1) ? cnt + '0' : cnt : '00';
    return `€ ${eur},${cntStr}`;
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
    const { selected, id } = props;
    const checked = (selected === id);
    return <div className='flex'>
        <input type="checkbox" checked={checked} readOnly />
        <span className='checkbox-span'></span>
    </div>
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
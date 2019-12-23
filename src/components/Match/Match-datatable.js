// Match-datatable.js
// to create derived datatable for matching invoices/ receipts to open payments

/*
Base payments
id
financial_account_id -> account_name
date
message + contra_account_name
amount
amount_open
payments
    id -> match_id
    invoice_id
    payment_date
    financial_mutation_id
    price_base
ledger_account_bookings
    id
    ledger_account_id -> ADD ledger_name
    price
isTopper (from related scores)

Base invoices/ receipts
id
type (derived)
date
total_price_incl_tax_base
total_price_incl_tax (in originele currency)
state
amount_open (indien payments && state != verwerkt)

ADD related (invoices/ receipts) to payments
    id -> invoice_id
    type
    date
    reference
    contact.company_name
    details
        amount (aantal)
        price
    total_price_incl_tax_base -> amount
    amount_open
    score
*/

// to add open amount for matching
const getOpenAmount = (incoming, isForCur = false) => {
    const withBase = isForCur ? '' : '_base';
    const { payments } = incoming;
    if (payments && payments.length > 0) {
        const amt = -parseFloat(incoming['total_price_incl_tax' + withBase]);
        let openAmt = amt;
        for (const payment of payments) {
            openAmt += parseFloat(payment['price' + withBase]);
        }
        const roundedOpenAmt = Math.round(openAmt * 100) / 100;
        return roundedOpenAmt !== amt ? roundedOpenAmt : null
    } else {
        return null;
    }
}

const amtFmt = (amtStr, currency = '€') => {
    const [eur, cnt] = amtStr.split('.');
    const cntStr = (cnt) ? (cnt.length === 1) ? cnt + '0' : cnt : '00';
    return `${currency} ${eur},${cntStr}`;
}

const getKeywords = contact => {
    const kwObj = contact && contact.custom_fields &&
        contact.custom_fields.find(cf => (cf.name === 'Keywords'));
    return (kwObj) ? kwObj.value.split(',').map(word => word.trim().toLowerCase()) : [];
}

const mapIncoming = type => incoming => {
    const company = incoming.contact && incoming.contact.company_name;
    const isInEur = (incoming.currency === 'EUR');
    const currency = isInEur ? '€' : incoming.currency;
    const detailText = incoming.details.map(d => `${d.amount} ${amtFmt(d.price, currency)}`).join(', ')
    return {
        id: incoming.id,
        type,
        date: incoming.date,
        message: incoming.reference + (company && (' - ' + company)),
        keywords: getKeywords(incoming.contact),
        detailText,
        details: incoming.details,
        amount: -parseFloat(incoming.total_price_incl_tax_base),
        amountForeign: !isInEur && -parseFloat(incoming.total_price_incl_tax),
        openAmount: getOpenAmount(incoming),
        openAmountForeign: !isInEur && getOpenAmount(incoming, true)
    }
}

const makeIncoming = (receipts, purchaseInvoices) => [
    ...receipts.map(mapIncoming('BON')),
    ...purchaseInvoices.map(mapIncoming('INK')),
];

// const flip = (str) => {
//     if (!str) return str;
//     return (str.slice(0, 1) === '-') ? str.slice(1) : '-' + str;
// }
// to calc days difference
const daysDiff = (a, b) => {
    const d1 = new Date(a);
    const d2 = new Date(b);
    const timeDiff = d2.getTime() - d1.getTime();
    const dDiff = timeDiff / (1000 * 3600 * 24);
    return (dDiff < 0) ? -dDiff : dDiff;
}

// helper for score calc
const scorePerc = (score) => {
    const perc = (score > 15) ? 100
        : (score >= 10) ? 80
            : (score >= 5) ? 50
                : (score > 0) ? 10
                    : 1;
    return perc;
}

const scoreSort = (a, b) => {
    return (a.totalScore < b.totalScore) ? 1
        : (a.totalScore > b.totalScore) ? -1
            : 0;
}


const THRESHOLD_AMOUNT = 1;
const THRESHOLD_DAYS = 3;
const THRESHOLD_TOPPER = 75;

const getRelated = (payment, invoiceData) => {
    const { amount, amount_open: amount_openStr, date, message } = payment;
    const amount_open = parseFloat(amount_openStr);
    const amt = parseFloat(amount);
    const related = invoiceData.map(inv => {
        const amDiff = inv.amount - amt;
        const amountScore =
            (amt === inv.amount) ? 5
                : (amDiff > -THRESHOLD_AMOUNT && amDiff < THRESHOLD_AMOUNT) ? 2
                    : 0;
        const openScore = (amount_open === 0) ? 0
            : (amount_open === inv.amount) ? 5
                : (amDiff > -THRESHOLD_AMOUNT && amDiff < THRESHOLD_AMOUNT) ? 2
                    : 0;
        const openInvScore = (amount_open !== 0 && amount_open === inv.amount_open) ? 5 : 0;
        const detailScore = (inv.details && inv.details.length > 1) ?
            (inv.details.find(d => (d.amount === '1 x' && parseFloat(d.price) === -amt))) ? 5 : 0 : 0;
        let kwScore = 0;
        for (const kw of inv.keywords) {
            if (message.toLowerCase().includes(kw)) kwScore += 5;
        }
        const dateScore =
            (date === inv.date) ? 3
                : (daysDiff(date, inv.date) < THRESHOLD_DAYS) ? 1
                    : 0;
        const totalScore = dateScore + amountScore + openScore + openInvScore + detailScore + kwScore;
        const percScore = scorePerc(totalScore);
        const isTopper = percScore > THRESHOLD_TOPPER;
        const scores = [amountScore, openScore, openInvScore, detailScore, kwScore, dateScore];
        return {
            ...inv,
            total_price_incl_tax_base: amt,
            totalScore,
            percScore,
            isTopper,
            scores
        }
    })
        .filter(inv => (inv.totalScore > 0));
    return related.sort(scoreSort);
}

export const derivedMatch = (payments, accounts, ledgers, receipts = [], purchaseInvoices = []) => {
    if (!(payments && accounts && ledgers)) return [];
    const incomingData = makeIncoming(receipts, purchaseInvoices);
    const newPayments = payments.map(p => {
        const account = accounts.find(a => a.id === p.financial_account_id);
        const account_name = account && account.name;
        const ledger_account_bookings = p.ledger_account_bookings.map(booking => {
            const ledger = ledgers.find(l => l.id === booking.ledger_account_id);
            const ledger_name = ledger && ledger.name;
            return { ...booking, ledger_name }
        });
        const related = getRelated(p, incomingData);
        return {
            ...p,
            account_name,
            ledger_account_bookings,
            related,
            isTopper: !!related.find(r => r.isTopper)
        }
    })
    return newPayments;
};
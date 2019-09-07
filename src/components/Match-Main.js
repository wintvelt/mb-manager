// Match-Main.js
import React from 'react';
import { loadComp } from '../constants/helpers';

const MatchMain = (props) => {
    const { matchStuff } = props;
    const { invoices, payments, invoiceIds, paymentIds } = matchStuff;
    if (invoices.hasAllData && payments.hasAllData) {
        return <div>
            <h5>No worries, got data</h5>
            <Pre data={payments.data || []} id='financial_account_id'/>
        </div>
    }
    if (invoices.isLoading || payments.isLoading) {
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
    if (invoices.notAsked && payments.notAsked) {
        return <div>Maak eerst een selectie</div>
    }
    return <div>
        <h5>something else?</h5>
        <pre></pre>
    </div>
}

const Payment = (props) => {
    // state (processed, open etc)
    // date yyyy-mm-dd
    // message
    // amount
    // amount_open
    // payments
        // (invoice_id) type (afgeleide)
        // (invoice_id) factuurnr
        // (invoice_id) contact.company_name
        // (invoice_id) date
        // (invoice_id) total_price_incl_tax_base
        // (invoice_id) details
            // amount
            // description

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
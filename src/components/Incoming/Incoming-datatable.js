//Incoming-datatable.js
// to create datatable for receipts & purchase_invoices

/* from receipts/purchase_invoices list
id
type (derived)
date
reference
state
amount - total_price_incl_tax_base (eur prijs)
state
--
from contacts in receipt:
contactId
contact_name
owner
std_ledger
--
from details[0] in receipts:
ledger_account_id
ledger_name - name
*/
export const derivedIncoming = (receipts, purchaseInvoices, ledgers) => {
    if ((!receipts && !purchaseInvoices) || !ledgers) return [];
    const incoming = [
        ...receipts.map(r => { return { ...r, type: 'receipt' } }),
        ...purchaseInvoices.map(r => { return { ...r, type: 'purchase_invoice' } }),
    ]
    return addInfo(incoming, ledgers);
};

export const addInfo = (incoming, ledgers) => {
    return incoming.map(oldIncoming => {
        const newIncoming = {
            id: oldIncoming.id,
            type: oldIncoming.type,
            date: oldIncoming.date,
            reference: oldIncoming.reference,
            state: oldIncoming.state,
            ledger_account_id: oldIncoming.details[0].ledger_account_id,
            details: oldIncoming.details,
            amount: oldIncoming.total_price_incl_tax_base && parseFloat(oldIncoming.total_price_incl_tax_base),
            contactId: oldIncoming.contact_id,
            contact_name: oldIncoming.contact && oldIncoming.contact.company_name
        }
        const ledger = ledgers.find(a => a.id === newIncoming.ledger_account_id);
        const ledger_name = ledger && ledger.name;
        const custom_fields = (oldIncoming.contact && oldIncoming.contact.custom_fields) || [];
        const owner = custom_fields.find(cf => cf.name === 'Owner intern');
        const std_ledger = custom_fields.find(cf => cf.name === 'Standaard categorie');
        return {
            ...newIncoming,
            ledger_name,
            owner: owner && owner.value,
            std_ledger: std_ledger && std_ledger.value
        }
    })
}
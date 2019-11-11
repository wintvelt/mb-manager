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
export const derivedIncoming = (receipts, ledgers) => {
    if (!receipts || !ledgers) return [];
    return addInfo(receipts, ledgers);
};

export const addInfo = (receipts, ledgers) => {
    return receipts.map(oldReceipt => {
        const receipt = {
            id: oldReceipt.id,
            type: 'receipt',
            date: oldReceipt.date,
            reference: oldReceipt.reference,
            state: oldReceipt.state,
            ledger_account_id: oldReceipt.details[0].ledger_account_id,
            amount: oldReceipt.total_price_incl_taxe_base && parseFloat(oldReceipt.total_price_incl_taxe_base),
            contactId: oldReceipt.contact_id,
            contact_name: oldReceipt.contact && oldReceipt.contact.company_name
        }
        const ledger = ledgers.find(a => a.id === receipt.ledger_account_id);
        const ledger_name = ledger && ledger.name;
        const custom_fields = (oldReceipt.contact && oldReceipt.contact.custom_fields) || [];
        const owner = custom_fields.find(cf => cf.name === 'Owner intern');
        const std_ledger = custom_fields.find(cf => cf.name === 'Standaard categorie');
        return { 
            ...receipt, 
            ledger_name,
            owner: owner && owner.value,
            std_ledger: std_ledger && std_ledger.value
        }
    })
}


//Payments-table

/* from contacts
id
company_name
country
customer_id
--
custom_fields:
Owner intern as owner
Standaard betaling as std_payment
Standaard categorie as std_ledger_name
Keywords as keywords
--
from ledgers add:
name as std_ledger_id
*/
export const derivedContacts = (contacts, ledgers) => {
    if (!contacts || !ledgers) return [];
    return addInfo(contacts, ledgers);
};

/* make consolidated set from contacts and ledgers
(only when contacts or ledgers updates, so in useMemo)
*/
const getFromCustom = (customfields = []) => (name, key = 'value') => {
    const field = customfields.find(field => field.name === name)
    return field && field[key];
}

export const addInfo = (contacts, ledgers) => {
    return contacts.map(rawContact => {
        const getCustomField = getFromCustom(rawContact.custom_fields);
        const std_ledger_name = getCustomField('Standaard categorie');
        const std_ledger = ledgers.find(ledger => ledger.name === std_ledger_name);
        const contact = {
            id: rawContact.id,
            company_name: rawContact.company_name,
            country: rawContact.country,
            customer_id: rawContact.customer_id,
            owner: getCustomField('Owner intern'),
            std_payment: getCustomField('Standaard betaling'),
            std_ledger_name,
            std_ledger_id: std_ledger && std_ledger.id,
            keywords: getCustomField('Keywords'),
            keywordsId: getCustomField('Keywords', 'id')
        }
        return contact;
    })
}


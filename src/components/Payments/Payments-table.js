//Payments-table

/* from payment list
id
date
financial_account_id
currency
amount
state
message
--
from contacts add:
contactId
name
owner
--
from accounts add:
name as account_name
*/
export const derivedPayments = (payments, contacts, accounts) => {
    if (!payments || !contacts || !accounts) return [];
    const keywords = extractKeywords(contacts);
    return addInfo(payments, keywords, accounts);
};

/* get keywords from contacts 
(only when contacts updated, so in useMemo)
[ { keyword, contactId, name, owner } ]
*/
export const extractKeywords = (contacts) => {
    let outArr = []
    for (const contact of contacts) {
        const contactKeywords = contact.custom_fields && contact.custom_fields.find(f => f.name === 'Keywords');
        const contactOwner = contact.custom_fields && contact.custom_fields.find(f => f.name === 'Owner intern');
        if (contactKeywords) {
            const contactObj = {
                contactId: contact.id,
                name: contact.company_name,
                owner: contactOwner && contactOwner.value
            }
            for (const keyword of contactKeywords.value.toLowerCase().split(',')) {
                outArr.push({ ...contactObj, keyword: keyword.trim() })
            }
        }
    }
    return outArr;
}

/* try and find keywords in message, and add to payment
(only when payments updates, so in useMemo)
*/
export const addInfo = (payments, keywords, accounts) => {
    return payments.map(oldPayment => {
        const payment = {
            id: oldPayment.id,
            message: oldPayment.message,
            financial_account_id: oldPayment.financial_account_id,
            currency: oldPayment.currency,
            amount: oldPayment.amount && parseFloat(oldPayment.amount),
            state: oldPayment.state,
            date: oldPayment.date
        }
        const message = payment.message && payment.message.toLowerCase();
        const keyItem = message && keywords.find(k => message.includes(k.keyword));
        const account = accounts.find(a => a.id === payment.financial_account_id);
        const account_name = account && account.name;
        return (keyItem) ?
            { ...payment, ...keyItem, account_name }
            : { ...payment, account_name }
    })
}


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
    id -> ledger_booking_id
    ledger_account_id -> ADD ledger_name
    price

Base invoices/ receipts
id
type (derived)
date
total_price_incl_tax_base
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
    total_price_incl_tax_base
    amount_open
    score
*/
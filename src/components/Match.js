// for simpler matching of payments to open invoices
/*
Selection of period (start and end optional)
Bank account selection (optional)
Fetch button

gets open invoices and receipts (with sync logic) nb: only purchases
gets all contacts (to retrieve standard payment method + payment matching keywords)
gets open payments (with sync logic) - NB: only outgoing

lists payments, and allows each payment to be linked to invoice/ receipt
(TODO, allow for currency conversion differences - and booking to currency diff account)
(TODO, allow for booking on account)

when individual link is made, payment line is set to 'Done'/ 'Connected', and green
also, connected invoice no longer linkable

When done, click process button to send all links to Moneybird

Logic to sort for link:
When amount matches + account matches (with standard from contact) + date-diff < 3 days make auto-link
Otherwise match contact keywords, and show all open invoices from contact

(TODO: keyword manager)

(TODO: link logic configurable in setup for admin, retrieved/saved on AWS)
*/
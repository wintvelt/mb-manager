# MoblyBird
## A tool with extended features for [Moneybird](moneybird.com)
Made for Mobly, but code is available to anyone.

This page is in desparate need of more specifics, I know.
They will be provided sometime in the future..

Generic wishlist for cleanup and improvement:
- [ ] Add export for marketing purposes
    - [ ] per category
    - [ ] per month
    - [ ] per supplier
    - [ ] per invoice
- [ ] Approval of invoices by owners?
- [ ] Budget control?



## Financial statements
Per bank account, 
* you can upload a .csv file to Moblybird
* For Admin only: edit mapping for .csv to Moneybird (field names) for file & for individual line

For each csv upload:
* in all cases, unconverted file is saved
* files sent are marked
* one checkmark if conversion to json succeeded
* 2 checkmarks if sent to Moneybird OK

Files cannot be sent to Moneybird more than once.

TODO:
- [ ] Check between 1213 and 1804 files
- [ ] Add download option (server + client-side)
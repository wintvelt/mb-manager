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



## Financial statements (work in progress)
Per bank account, 
* edit mapping for .csv to Moneybird (field names) for file & for individual line
* you can upload a .csv file to Moblybird

For each csv upload:
* review the summary
* when OK, send to Moneybird for processing
* in all cases, unconverted file is saved
* files sent are marked

Files can be sent to Moneybird more than once (only latest datetime is saved): whenever a file is sent, it will check the file IDs in Moneybird to check if the file was already processed. If it was, sending will fail.

---

* Left (or sub)menu with bankaccounts in Moneybird
* Main screen with details for each bankaccount
    * Settings, with possible states:
        * Mapping not yet completed
            * check done if all required fields have mapping
            * 
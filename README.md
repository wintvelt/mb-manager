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

Files can be sent to Moneybird more than once (only latest datetime is saved). But in moneybird, check is needed to ensure that the same payments are not processed twice.

---
### Layout:
* Left menu with bankaccounts in Moneybird
* Main screen with details for each bankaccount
    * Title (shows name of bankaccount)
    * Settings icon:
        * Settings (= mappings) can be OK | NOK
            * OK only if a conversion previously went OK (validated flag in config)
        * Has/is edit button, to show (always if NOK) mapping details editor
            * Button is hidden if there is no csv file
    * upload area (filezone) for csv files
    * 0 or more csv files in list
* Typical steps:
    * upload a file:
        * save file on S3 (with API)
        * if config NOK: open settings to make config, otherwise:
        * convert the just uploaded file
        * save converted file


### Settings for csv conversion - THIS IS TODO
* column with interpreted csv:
    * settings on top:
        * separator
        * decimal
    * 2 columns, with on each row
        * header
        * 3 examples
* detail mappings row:
    * datum, field, input format, examples
    * valuta datum, field, format, examples
    * omschrijving, fields (COMBI of multiple fields possible)
    * bedrag, field, decimal, examples
    * contra name, field, examples
    * contra account, field, examples
    * reference tegenpartij, field, examples
* SAVE button (if validated, will convert and save the csv too)
* (general settings are impossible to change)
    * official date (system: date of upload)
    * official balance (system: default)
    * reference (system: same as csv filename)

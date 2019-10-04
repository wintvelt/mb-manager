import { extractKeywords, addInfo } from '../Payments/Payments-table';

const contacts = [
    {
        "id": "245920628596541212",
        "administration_id": "243231934476453244",
        "company_name": "1Password",
        "custom_fields": [
            {
                "id": "243235712412944078",
                "name": "Owner intern",
                "value": "Alex"
            },
            {
                "id": "243256711800948256",
                "name": "Standaard betaling",
                "value": "Credit card 7050"
            },
            {
                "id": "243301268733298558",
                "name": "Standaard categorie",
                "value": "Computerkosten abonnementen"
            },
            {
                "id": "265583224067982729",
                "name": "Keywords",
                "value": "1pass"
            }
        ],
    },
    {
        "id": "243578690785510871",
        "administration_id": "243231934476453244",
        "company_name": "ABONDANCE CVBA",
        "custom_fields": [
            {
                "id": "243235712412944078",
                "name": "Owner intern",
                "value": "Wouter"
            },
            {
                "id": "243256711800948256",
                "name": "Standaard betaling",
                "value": "Bank"
            },
            {
                "id": "243301268733298558",
                "name": "Standaard categorie",
                "value": "Reis- en verblijfkosten"
            }
        ],
    },
    {
        "id": "243579856595453925",
        "administration_id": "243231934476453244",
        "company_name": "Activecampaign",
        "custom_fields": [
            {
                "id": "243235712412944078",
                "name": "Owner intern",
                "value": "Wouter"
            },
            {
                "id": "243256711800948256",
                "name": "Standaard betaling",
                "value": "Credit card 7050"
            },
            {
                "id": "243301268733298558",
                "name": "Standaard categorie",
                "value": "Marketing tools"
            },
            {
                "id": "265583224067982729",
                "name": "Keywords",
                "value": "activecampaign, test keyword"
            }
        ],
    }
]

const payments = [
    {
        "id": "268296336707683402",
        "administration_id": "243231934476453244",
        "amount": "19.5",
        "code": null,
        "date": "2019-10-02",
        "message": "Europese TEST KEYWORD Van BE67 6718 7599 8987 Bankier Opdrachtgever: Eurbbe99 De Saedeleer -Troncquo Langeweestraat 58 9340 Lede Factuur:20190809 Referentie: Ov-00012519-01060",
        "contra_account_name": "De Saedeleer -Troncquo",
        "contra_account_number": "BE67671875998987",
        "state": "processed",
        "amount_open": "0.0",
        "sepa_fields": null,
        "batch_reference": "BE08736042471213_18-09-2019_tot_02-10-2019",
        "financial_account_id": "243233339071268359",
        "currency": "EUR",
        "original_amount": null,
        "created_at": "2019-10-03T07:22:27.224Z",
        "updated_at": "2019-10-03T07:24:04.774Z",
        "version": 1570087444,
        "financial_statement_id": "268296336646865967",
        "processed_at": "2019-10-03T07:24:04.769Z",
        "account_servicer_transaction_id": null,
        "payments": [],
        "ledger_account_bookings": [
            {
                "id": "268296438985786725",
                "administration_id": "243231934476453244",
                "ledger_account_id": "258518210982184511",
                "description": "",
                "price": "19.5",
                "created_at": "2019-10-03T07:24:04.764Z",
                "updated_at": "2019-10-03T07:24:04.764Z"
            }
        ]
    },
    {
        "id": "268296336705586249",
        "administration_id": "243231934476453244",
        "amount": "14.0",
        "code": null,
        "date": "2019-10-02",
        "message": "Europese activecampaign Van BE67 6718 7599 8987 Bankier Opdrachtgever: Eurbbe99 De Saedeleer -Troncquo Langeweestraat 58 9340 Lede Factuur:20190749 Referentie: Ov-00012519-01244",
        "contra_account_name": "De Saedeleer -Troncquo",
        "contra_account_number": "BE67671875998987",
        "state": "processed",
        "amount_open": "0.0",
        "sepa_fields": null,
        "batch_reference": "BE08736042471213_18-09-2019_tot_02-10-2019",
        "financial_account_id": "243233339071268359",
        "currency": "EUR",
        "original_amount": null,
        "created_at": "2019-10-03T07:22:27.222Z",
        "updated_at": "2019-10-03T11:28:56.132Z",
        "version": 1570102136,
        "financial_statement_id": "268296336646865967",
        "processed_at": "2019-10-03T11:28:56.022Z",
        "account_servicer_transaction_id": null,
        "payments": [],
        "ledger_account_bookings": [
            {
                "id": "268311843877947007",
                "administration_id": "243231934476453244",
                "ledger_account_id": "258518210982184511",
                "description": "",
                "price": "14.0",
                "created_at": "2019-10-03T11:28:56.013Z",
                "updated_at": "2019-10-03T11:28:56.013Z"
            }
        ]
    },
    {
        "id": "268296336703489096",
        "administration_id": "243231934476453244",
        "amount": "17.5",
        "code": null,
        "date": "2019-10-02",
        "message": "Europese 1password Van BE80 6109 5585 6077 Bankier Opdrachtgever: Deutbebexxx Dhr. Ledegen Filip Pachthofstraat 117 9308 Gijzegem",
        "contra_account_name": "Dhr. Ledegen Filip",
        "contra_account_number": "BE80610955856077",
        "state": "processed",
        "amount_open": "0.0",
        "sepa_fields": null,
        "batch_reference": "BE08736042471213_18-09-2019_tot_02-10-2019",
        "financial_account_id": "247030397351757807",
        "currency": "EUR",
        "original_amount": null,
        "created_at": "2019-10-03T07:22:27.220Z",
        "updated_at": "2019-10-03T11:32:39.596Z",
        "version": 1570102359,
        "financial_statement_id": "268296336646865967",
        "processed_at": "2019-10-03T11:32:39.591Z",
        "account_servicer_transaction_id": null,
        "payments": [],
        "ledger_account_bookings": [
            {
                "id": "268312078311228671",
                "administration_id": "243231934476453244",
                "ledger_account_id": "258518210982184511",
                "description": "",
                "price": "17.5",
                "created_at": "2019-10-03T11:32:39.586Z",
                "updated_at": "2019-10-03T11:32:39.586Z"
            }
        ]
    },
    {
        "id": "268296336700343367",
        "administration_id": "243231934476453244",
        "amount": "12.0",
        "code": null,
        "date": "2019-10-02",
        "message": "Europese Overschrijving Van BE81 7320 4645 0624 Bankier Opdrachtgever: Cregbebb Devos Stephane Rue De Namur 86 C 1400 Nivelles Septembre 2019",
        "contra_account_name": "Devos St?phane",
        "contra_account_number": "BE81732046450624",
        "state": "processed",
        "amount_open": "0.0",
        "sepa_fields": null,
        "batch_reference": "BE08736042471213_18-09-2019_tot_02-10-2019",
        "financial_account_id": "247030397351757807",
        "currency": "EUR",
        "original_amount": null,
        "created_at": "2019-10-03T07:22:27.217Z",
        "updated_at": "2019-10-03T11:29:07.254Z",
        "version": 1570102147,
        "financial_statement_id": "268296336646865967",
        "processed_at": "2019-10-03T11:29:07.248Z",
        "account_servicer_transaction_id": null,
        "payments": [],
        "ledger_account_bookings": [
            {
                "id": "268311855652407092",
                "administration_id": "243231934476453244",
                "ledger_account_id": "258518210982184511",
                "description": "",
                "price": "12.0",
                "created_at": "2019-10-03T11:29:07.243Z",
                "updated_at": "2019-10-03T11:29:07.243Z"
            }
        ]
    }
]

const accounts = [
    {
        "id": "247030397351757807",
        "administration_id": "243231934476453244",
        "type": "BankAccount",
        "name": "Credit card 7050",
        "identifier": "NL19INGB0000007050",
        "currency": "EUR",
        "provider": null,
        "active": true,
        "created_at": "2019-02-10T13:49:27.047Z",
        "updated_at": "2019-09-18T09:34:56.999Z"
    },
    {
        "id": "243233339071268359",
        "administration_id": "243231934476453244",
        "type": "BankAccount",
        "name": "KBC 1213",
        "identifier": "BE08736042471213",
        "currency": "EUR",
        "provider": null,
        "active": true,
        "created_at": "2018-12-30T15:56:50.085Z",
        "updated_at": "2019-10-03T07:22:27.241Z"
    },
    {
        "id": "248095636178601670",
        "administration_id": "243231934476453244",
        "type": "BankAccount",
        "name": "KBC 1804",
        "identifier": "BE10736044361804",
        "currency": "EUR",
        "provider": null,
        "active": true,
        "created_at": "2019-02-22T08:00:57.955Z",
        "updated_at": "2019-09-18T09:50:12.644Z"
    },
    {
        "id": "243957415157958515",
        "administration_id": "243231934476453244",
        "type": "BankAccount",
        "name": "Mollie rekening",
        "identifier": "NL30ABNA0524590958",
        "currency": "EUR",
        "provider": null,
        "active": true,
        "created_at": "2019-01-07T15:45:42.850Z",
        "updated_at": "2019-10-03T11:37:31.480Z"
    },
    {
        "id": "248096016911304112",
        "administration_id": "243231934476453244",
        "type": "BankAccount",
        "name": "Paypal",
        "identifier": "NL33INGB0000009999",
        "currency": "EUR",
        "provider": null,
        "active": true,
        "created_at": "2019-02-22T08:07:01.056Z",
        "updated_at": "2019-09-24T15:54:53.434Z"
    },
    {
        "id": "243243853723731183",
        "administration_id": "243231934476453244",
        "type": "CreditCardAccount",
        "name": "Mobly NV",
        "identifier": "7050",
        "currency": "EUR",
        "provider": null,
        "active": false,
        "created_at": "2018-12-30T18:43:57.641Z",
        "updated_at": "2019-03-15T21:14:19.184Z"
    }
]

const expected = [
    { keyword: '1pass', contactId: '245920628596541212', name: '1Password', owner: 'Alex' },
    { keyword: 'activecampaign', contactId: '243579856595453925', name: 'Activecampaign', owner: 'Wouter' },
    { keyword: 'test keyword', contactId: '243579856595453925', name: 'Activecampaign', owner: 'Wouter' },
]

const expectedPayments = [
    {
        id: '268296336707683402', contactId: '243579856595453925', name: 'Activecampaign',
        owner: 'Wouter', account_name: 'KBC 1213'
    },
    {
        id: '268296336705586249', contactId: '243579856595453925', name: 'Activecampaign',
        owner: 'Wouter', account_name: 'KBC 1213'
    },
    {
        id: '268296336703489096', contactId: '268296336703489096', name: '1Password',
        owner: 'Alex', account_name: 'Credit card 7050'
    },
    {
        id: '268296336700343367', contactId: undefined, name: undefined,
        owner: undefined, account_name: 'Credit card 7050'
    }
]

const keywords = extractKeywords(contacts);

describe('Payments table test for extracting keywords', () => {
    for (const keyLine of expected) {
        it(`has the right info for keyword ${keyLine.keyword}`, () => {
            const receivedItem = keywords.find(it => it.keyword === keyLine.keyword);
            const hasItem = (receivedItem) ? true : false
            expect(hasItem).toEqual(true);
            if (hasItem) {
                expect(receivedItem.id).toEqual(keyLine.id);
                expect(receivedItem.name).toEqual(keyLine.name);
                expect(receivedItem.owner).toEqual(keyLine.owner);
            }
        })
    }
    for (const receivedItem of keywords) {
        it(`has received keyword ${receivedItem.keyword} cf expected list`, () => {
            const expectedItem = expected.find(it => it.keyword === receivedItem.keyword);
            const hasItem = (expectedItem) ? true : false
            expect(hasItem).toEqual(true);
        })
    }
})

describe('Payments table adds contact info to payments with keywords', () => {
    const received = addInfo(payments, keywords, accounts);
    for (const payment of received) {
        const expectedPayment = expectedPayments.find(p => p.id === payment.id);
        const hasExpectedPayment = (expectedPayment) ? true : false;
        it(`has payment of id ${payment.id} in expectedlist`, () => {
            expect(hasExpectedPayment).toEqual(true);
        });
        if (hasExpectedPayment) {
            it(`has expected contact name`, () => {
                expect(payment.name).toEqual(expectedPayment.name);
            });
            it(`has expected contact owner`, () => {
                expect(payment.owner).toEqual(expectedPayment.owner);
            });
            it(`has expected contact id`, () => {
                expect(payment.id).toEqual(expectedPayment.id);
            });
        }
    }
})
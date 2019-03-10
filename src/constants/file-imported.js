// for imported files

export const idLookup = (name) => {
    const foundList = jsonTable.filter( (item) => {
      return (item.naam === name)
    });
    if (foundList.length === 0) return "NA";
    return foundList[0].klantcode.toString();
}

export const jsonTable = 
[
  {
    "klantcode": 0,
    "naam": "BTW Administratie / Administration TVA"
  },
  {
    "klantcode": 1,
    "naam": "NESPRESSO BELGIQUE OU NESPRESSO BELGIE NV"
  },
  {
    "klantcode": 2,
    "naam": "VODW Brussels (BDFP)"
  },
  {
    "klantcode": 3,
    "naam": "Telelingua International Sa"
  },
  {
    "klantcode": 4,
    "naam": "Boeykens Jan - Notaris EBVBA"
  },
  {
    "klantcode": 5,
    "naam": "MONIZZE SA"
  },
  {
    "klantcode": 6,
    "naam": "MyFonts Inc."
  },
  {
    "klantcode": 7,
    "naam": "Salar VZW"
  },
  {
    "klantcode": 8,
    "naam": "BALOISE BELGIUM NV"
  },
  {
    "klantcode": 9,
    "naam": "DKV BELGIUM NV"
  },
  {
    "klantcode": 10,
    "naam": "Onkosten"
  },
  {
    "klantcode": 12,
    "naam": "Launch IT"
  },
  {
    "klantcode": 13,
    "naam": "Webbird GCV"
  },
  {
    "klantcode": 14,
    "naam": "Batenborch International NV"
  },
  {
    "klantcode": 15,
    "naam": "ORANGE BELGIUM NV"
  },
  {
    "klantcode": 16,
    "naam": "Diverse leveranciers"
  },
  {
    "klantcode": 17,
    "naam": "BTS Travel Antwerp"
  },
  {
    "klantcode": 18,
    "naam": "Sobegas CVBA"
  },
  {
    "klantcode": 19,
    "naam": "Mastercard"
  },
  {
    "klantcode": 20,
    "naam": "Coolblue NV"
  },
  {
    "klantcode": 21,
    "naam": "Google Ireland Limited"
  },
  {
    "klantcode": 22,
    "naam": "XERIUS SOCIAAL VERZEKERINGSFONDS VZW"
  },
  {
    "klantcode": 23,
    "naam": "Clb Externe Preventie"
  },
  {
    "klantcode": 24,
    "naam": "FSMA"
  },
  {
    "klantcode": 25,
    "naam": "Best Of Publishing En-of New Media Providers En-of"
  },
  {
    "klantcode": 26,
    "naam": "GEVERS & PARTNERS SA"
  },
  {
    "klantcode": 27,
    "naam": "Code Vision s.r.o."
  },
  {
    "klantcode": 29,
    "naam": "Finvision Antwerpen"
  },
  {
    "klantcode": 30,
    "naam": "Envatomarket"
  },
  {
    "klantcode": 32,
    "naam": "Amodo D.O.O."
  },
  {
    "klantcode": 33,
    "naam": "Euromex"
  },
  {
    "klantcode": 34,
    "naam": "Codepress"
  },
  {
    "klantcode": 35,
    "naam": "DAISYCON B.V."
  },
  {
    "klantcode": 36,
    "naam": "KBC bank"
  },
  {
    "klantcode": 37,
    "naam": "Microsoft Ireland Operations Ltd"
  },
  {
    "klantcode": 38,
    "naam": "Apple Distribution Internation"
  },
  {
    "klantcode": 39,
    "naam": "Balsamiq studios"
  },
  {
    "klantcode": 40,
    "naam": "Unbounce"
  },
  {
    "klantcode": 41,
    "naam": "Pixmix BVBA"
  },
  {
    "klantcode": 42,
    "naam": "DEKRA BELGIUM NV"
  },
  {
    "klantcode": 43,
    "naam": "Citycubes BVBA"
  },
  {
    "klantcode": 44,
    "naam": "Begonia reizen BVBA"
  },
  {
    "klantcode": 47,
    "naam": "MailChimp"
  },
  {
    "klantcode": 48,
    "naam": "Amazon Web Services EMEA SARL"
  },
  {
    "klantcode": 49,
    "naam": "Linkedin"
  },
  {
    "klantcode": 50,
    "naam": "Facebook Ireland Limited"
  },
  {
    "klantcode": 51,
    "naam": "Shutterstock NL"
  },
  {
    "klantcode": 52,
    "naam": "Yoast B.V."
  },
  {
    "klantcode": 53,
    "naam": "Snelvertaler B.V."
  },
  {
    "klantcode": 54,
    "naam": "PUB/MGM ALUMNI VZW VZW"
  },
  {
    "klantcode": 55,
    "naam": "Inc. Management B.V."
  },
  {
    "klantcode": 56,
    "naam": "Coosto B.V."
  },
  {
    "klantcode": 57,
    "naam": "Nekkra UG"
  },
  {
    "klantcode": 59,
    "naam": "APP-ART BVBA"
  },
  {
    "klantcode": 60,
    "naam": "AUTOMOTIVE APPLICATION SERVICES PROVIDER B.V."
  },
  {
    "klantcode": 61,
    "naam": "Kinepolis Group Belgium nv"
  },
  {
    "klantcode": 62,
    "naam": "VLERICK BUSINESS SCHOOL SON"
  },
  {
    "klantcode": 63,
    "naam": "Geckoboard - Datachoice Solutions LTD"
  },
  {
    "klantcode": 64,
    "naam": "GoDaddy.com, LLC - Manage WP"
  },
  {
    "klantcode": 65,
    "naam": "Vistaprint BV"
  },
  {
    "klantcode": 66,
    "naam": "Cynthia Tsai"
  },
  {
    "klantcode": 67,
    "naam": "CUREGROUP BVBA"
  },
  {
    "klantcode": 68,
    "naam": "Bloovi Comm. V."
  },
  {
    "klantcode": 69,
    "naam": "Cegeka NV"
  },
  {
    "klantcode": 70,
    "naam": "Belgisch Pers-telegraafagentschap NV"
  },
  {
    "klantcode": 71,
    "naam": "DESIGNCENTER DE WINKELHAAK NV"
  },
  {
    "klantcode": 72,
    "naam": "Synio"
  },
  {
    "klantcode": 74,
    "naam": "We Like You (Koo)"
  },
  {
    "klantcode": 75,
    "naam": "Van Bavel BVBA"
  },
  {
    "klantcode": 77,
    "naam": "HYBRID MEDIA BVBA"
  },
  {
    "klantcode": 78,
    "naam": "Beyond Borders Media"
  },
  {
    "klantcode": 79,
    "naam": "ROTKOP GCV"
  },
  {
    "klantcode": 80,
    "naam": "Snelvertaler Bv"
  },
  {
    "klantcode": 81,
    "naam": "LANTSOGHT, PIETER"
  },
  {
    "klantcode": 82,
    "naam": "Federale Overheidsdienst Financien"
  },
  {
    "klantcode": 83,
    "naam": "CLEARXPERTS SALES & MARKETING BVBA"
  },
  {
    "klantcode": 84,
    "naam": "BASKERVILLE NV"
  },
  {
    "klantcode": 85,
    "naam": "KUWAIT PETROLEUM (BELGIUM) NV"
  },
  {
    "klantcode": 86,
    "naam": "Arno Boomputte"
  },
  {
    "klantcode": 88,
    "naam": "TyperForm S.L"
  },
  {
    "klantcode": 89,
    "naam": "Zapier Inc."
  },
  {
    "klantcode": 90,
    "naam": "Atlassian Pty Ltd"
  },
  {
    "klantcode": 91,
    "naam": "Adobe Systems Software Ireland Ltd"
  },
  {
    "klantcode": 92,
    "naam": "Slack Technologies Limited"
  },
  {
    "klantcode": 93,
    "naam": "Lucid Software Inc"
  },
  {
    "klantcode": 94,
    "naam": "Zendesk, Inc"
  },
  {
    "klantcode": 95,
    "naam": "Twilio, Inc."
  },
  {
    "klantcode": 96,
    "naam": "Intercom R&D"
  },
  {
    "klantcode": 97,
    "naam": "INTERVEST OFFICES & WAREHOUSES NV"
  },
  {
    "klantcode": 98,
    "naam": "Google Inc."
  },
  {
    "klantcode": 99,
    "naam": "1Password"
  },
  {
    "klantcode": 100,
    "naam": "Albers & Klein"
  },
  {
    "klantcode": 101,
    "naam": "IREPAIRSHOP BVBA"
  },
  {
    "klantcode": 102,
    "naam": "JetBrains s.r.o."
  },
  {
    "klantcode": 103,
    "naam": "Adobe Typekit"
  },
  {
    "klantcode": 104,
    "naam": "Silviurunceanu"
  },
  {
    "klantcode": 105,
    "naam": "ASKIT - COMMUNICATIONS BVBA"
  },
  {
    "klantcode": 106,
    "naam": "Bol.com B.V."
  },
  {
    "klantcode": 107,
    "naam": "D HERTOGE, MARC"
  },
  {
    "klantcode": 108,
    "naam": "FUSA CIPRIAN PERSOANA FIZICA AUTORIZATA"
  },
  {
    "klantcode": 109,
    "naam": "A.A.B.O. EBVBA - Detective agentschap"
  },
  {
    "klantcode": 110,
    "naam": "PROFACTS BVBA"
  },
  {
    "klantcode": 111,
    "naam": "DEFI LINE SPRL"
  },
  {
    "klantcode": 113,
    "naam": "Socialbloom"
  },
  {
    "klantcode": 114,
    "naam": "Mollie B.V."
  },
  {
    "klantcode": 115,
    "naam": "Visual Design BVBA"
  },
  {
    "klantcode": 116,
    "naam": "Itds Groep B.V."
  },
  {
    "klantcode": 117,
    "naam": "Peter Marcely"
  },
  {
    "klantcode": 118,
    "naam": "Transip B.V."
  },
  {
    "klantcode": 119,
    "naam": "Avangate B.V."
  },
  {
    "klantcode": 120,
    "naam": "Skondras"
  },
  {
    "klantcode": 121,
    "naam": "DIGITI BVBA"
  },
  {
    "klantcode": 122,
    "naam": "ABONDANCE CVBA"
  },
  {
    "klantcode": 123,
    "naam": "BREWERY OF IDEAS BVBA"
  },
  {
    "klantcode": 124,
    "naam": "Tristar GmbH"
  },
  {
    "klantcode": 125,
    "naam": "MEDIAHUIS NV"
  },
  {
    "klantcode": 126,
    "naam": "Onbekende leverancier / Fournisseur inconnu"
  },
  {
    "klantcode": 127,
    "naam": "Advocatenkantoor Vandendriessc"
  },
  {
    "klantcode": 128,
    "naam": "PRINTDEAL.BE BVBA"
  },
  {
    "klantcode": 129,
    "naam": "LAUWERIJSSEN, NICKY"
  },
  {
    "klantcode": 130,
    "naam": "Noun Project"
  },
  {
    "klantcode": 131,
    "naam": "Sentry"
  },
  {
    "klantcode": 132,
    "naam": "Datachoice Solutions LTD"
  },
  {
    "klantcode": 133,
    "naam": "ALD Automotive"
  },
  {
    "klantcode": 134,
    "naam": "Verenigde producties VZW"
  },
  {
    "klantcode": 135,
    "naam": "EC rent"
  },
  {
    "klantcode": 136,
    "naam": "Paypall"
  },
  {
    "klantcode": 137,
    "naam": "Transifex"
  },
  {
    "klantcode": 138,
    "naam": "Walter Van Gastel"
  },
  {
    "klantcode": 139,
    "naam": "Standaard Boekhandel"
  },
  {
    "klantcode": 140,
    "naam": "Digital Ocean"
  },
  {
    "klantcode": 141,
    "naam": "PERSONAL COPY SPRL"
  },
  {
    "klantcode": 142,
    "naam": "BPOST SA"
  },
  {
    "klantcode": 143,
    "naam": "SMART & CO NV"
  },
  {
    "klantcode": 144,
    "naam": "PRODUCTIONS ASSOCIÉES ASBL"
  },
  {
    "klantcode": 145,
    "naam": "CarTalk International B.V."
  },
  {
    "klantcode": 146,
    "naam": "Mediaplanet"
  },
  {
    "klantcode": 147,
    "naam": "Double Digit Growth BVBA"
  },
  {
    "klantcode": 148,
    "naam": "FRIENDSHIP INC BVBA"
  },
  {
    "klantcode": 149,
    "naam": "GMGROUP NV"
  },
  {
    "klantcode": 150,
    "naam": "Provincie Antwerpen"
  },
  {
    "klantcode": 151,
    "naam": "Monkeyshot"
  },
  {
    "klantcode": 152,
    "naam": "Unique"
  },
  {
    "klantcode": 171,
    "naam": "Online Activity"
  },
  {
    "klantcode": 172,
    "naam": "Comfort Line d.o.o"
  },
  {
    "klantcode": 173,
    "naam": "Hotel Metropol"
  },
  {
    "klantcode": 174,
    "naam": "La Fourchette Suisse"
  },
  {
    "klantcode": 177,
    "naam": "Intracto Group Nv"
  },
  {
    "klantcode": 178,
    "naam": "SODEXO BELGIUM SA NV"
  },
  {
    "klantcode": 179,
    "naam": "KUNNIG VZW"
  },
  {
    "klantcode": 180,
    "naam": "Vlerick Mba Alumni Vzw"
  },
  {
    "klantcode": 181,
    "naam": "Grigoriev Sergiu Persoana Fizica Autorizata"
  },
  {
    "klantcode": 182,
    "naam": "VWO - Wingify"
  },
  {
    "klantcode": 184,
    "naam": "FRONTIFY AG"
  },
  {
    "klantcode": 185,
    "naam": "Gowie Sa"
  },
  {
    "klantcode": 186,
    "naam": "Save Potatoes East OÜ"
  },
  {
    "klantcode": 187,
    "naam": "Fiverr International LTD"
  },
  {
    "klantcode": 188,
    "naam": "Europ Assistance Services SA"
  },
  {
    "klantcode": 189,
    "naam": "OFFICE DEPOT INTERNATIONAL BVBA"
  },
  {
    "klantcode": 190,
    "naam": "TELENET GROUP BVBA"
  },
  {
    "klantcode": 191,
    "naam": "SLEUTEL EXPRES BVBA"
  },
  {
    "klantcode": 192,
    "naam": "Belgisch Staatsblad"
  },
  {
    "klantcode": 193,
    "naam": "ROCK LOBSTER BVBA"
  },
  {
    "klantcode": 194,
    "naam": "Combell NV"
  },
  {
    "klantcode": 195,
    "naam": "FastSpring"
  },
  {
    "klantcode": 196,
    "naam": "Metropool"
  },
  {
    "klantcode": 197,
    "naam": "InVision App, Inc."
  },
  {
    "klantcode": 198,
    "naam": "Drukwerkdeal.nl"
  },
  {
    "klantcode": 199,
    "naam": "AppsFlyer Ltd"
  },
  {
    "klantcode": 200,
    "naam": "DRUKKERIJ BULCKENS BVBA"
  },
  {
    "klantcode": 201,
    "naam": "Binex"
  },
  {
    "klantcode": 207,
    "naam": "VERZEKERINGEN NV"
  },
  {
    "klantcode": 208,
    "naam": "Smiirl SAS"
  },
  {
    "klantcode": 209,
    "naam": "SIX, JUSTINE"
  },
  {
    "klantcode": 218,
    "naam": "ASTRIDPLAZA NV"
  },
  {
    "klantcode": 219,
    "naam": "YOURSURPRISE.COM"
  },
  {
    "klantcode": 220,
    "naam": "D'HOOGHE, BRAM"
  },
  {
    "klantcode": 221,
    "naam": "Twitter International Company"
  },
  {
    "klantcode": 222,
    "naam": "THE FACTORY CVBA SO"
  },
  {
    "klantcode": 223,
    "naam": "BRAVO SPORTS S.r.l."
  },
  {
    "klantcode": 224,
    "naam": "RAJAPACK BENELUX NV"
  },
  {
    "klantcode": 225,
    "naam": "Firgun"
  },
  {
    "klantcode": 226,
    "naam": "NG MUNCHEN MESSE"
  },
  {
    "klantcode": 227,
    "naam": "Tefincom S.A."
  },
  {
    "klantcode": 230,
    "naam": "THE PARK ENTERTAINMENT NV"
  },
  {
    "klantcode": 231,
    "naam": "Diverse leveranciers"
  },
  {
    "klantcode": 232,
    "naam": "MEETDISTRICT GENT NV"
  },
  {
    "klantcode": 233,
    "naam": "Matthijs Otterloo"
  },
  {
    "klantcode": 234,
    "naam": "Burocad NV"
  },
  {
    "klantcode": 235,
    "naam": "B.V. Verpakkingsindustrie Veenendaal"
  },
  {
    "klantcode": 236,
    "naam": "Kong BVBA"
  },
  {
    "klantcode": 237,
    "naam": "MADEA MARTA BOGDAt."
  },
  {
    "klantcode": 673,
    "naam": "Auto5 NV"
  },
  {
    "klantcode": 674,
    "naam": "CheapTech"
  },
  {
    "klantcode": 675,
    "naam": "Elastic Projects, Inc."
  },
  {
    "klantcode": 678,
    "naam": "D-ADVICE BVBA"
  },
  {
    "klantcode": 679,
    "naam": "DELORGE BORGLOON BVBA"
  },
  {
    "klantcode": 680,
    "naam": "Merweb"
  },
  {
    "klantcode": 681,
    "naam": "N.M.B.S. Holding NV"
  },
  {
    "klantcode": 683,
    "naam": "Rocketgenius"
  },
  {
    "klantcode": 686,
    "naam": "Smartphoto"
  },
  {
    "klantcode": 687,
    "naam": "Wish"
  },
  {
    "klantcode": 987,
    "naam": "Erik Vinclav"
  },
  {
    "klantcode": 1001,
    "naam": "ITS BELGIUM VZW"
  },
  {
    "klantcode": 1002,
    "naam": "Heroku"
  },
  {
    "klantcode": 1003,
    "naam": "On the go systems limited - WPML"
  },
  {
    "klantcode": 1004,
    "naam": "Bloomon"
  },
  {
    "klantcode": 1006,
    "naam": "Reddit.com"
  },
  {
    "klantcode": 1007,
    "naam": "Activecampaign"
  },
  {
    "klantcode": 1009,
    "naam": "Mixpanel"
  },
  {
    "klantcode": 1019,
    "naam": "Zendesk, Inc."
  },
  {
    "klantcode": 1020,
    "naam": "Eght"
  },
  {
    "klantcode": 1022,
    "naam": "Mobile Devices Inc"
  },
  {
    "klantcode": 1023,
    "naam": "STIP Legal Consulting"
  },
  {
    "klantcode": 1024,
    "naam": "Gagiu Victor"
  },
  {
    "klantcode": 1026,
    "naam": "Fosbury & Sons"
  },
  {
    "klantcode": 1027,
    "naam": "De Kinderplaneet"
  },
  {
    "klantcode": 1028,
    "naam": "DELHAIZE LE LION/DE LEEUW"
  },
  {
    "klantcode": 1029,
    "naam": "Bonnetjes - Onkosten"
  },
  {
    "klantcode": 1030,
    "naam": "ContentBoost"
  },
  {
    "klantcode": 1038,
    "naam": "Fnac"
  },
  {
    "klantcode": 1039,
    "naam": "IT-pro"
  },
  {
    "klantcode": 1041,
    "naam": "A.A.B.O. EBVBA"
  },
  {
    "klantcode": 1042,
    "naam": "CarMD"
  },
  {
    "klantcode": 1043,
    "naam": "Cloud Group NV"
  },
  {
    "klantcode": 1044,
    "naam": "Diverse Leveranciers marketing"
  },
  {
    "klantcode": 1045,
    "naam": "Europ Assistance Verzekeringen"
  },
  {
    "klantcode": 1046,
    "naam": "Eventbrite"
  },
  {
    "klantcode": 1047,
    "naam": "EY"
  },
  {
    "klantcode": 1048,
    "naam": "Gaasbeek Media"
  },
  {
    "klantcode": 1049,
    "naam": "Gerrit"
  },
  {
    "klantcode": 1050,
    "naam": "Hotjar"
  },
  {
    "klantcode": 1051,
    "naam": "Huaten Global"
  },
  {
    "klantcode": 1052,
    "naam": "Informex SA"
  },
  {
    "klantcode": 1053,
    "naam": "Jenske"
  },
  {
    "klantcode": 1054,
    "naam": "LDV United"
  },
  {
    "klantcode": 1055,
    "naam": "Lina"
  },
  {
    "klantcode": 1056,
    "naam": "Lotte"
  },
  {
    "klantcode": 1057,
    "naam": "MoneyBird B.V."
  },
  {
    "klantcode": 1058,
    "naam": "Musat G. Stefan"
  },
  {
    "klantcode": 1059,
    "naam": "NordVPN"
  },
  {
    "klantcode": 1060,
    "naam": "Parkeerbedrijf Antwerpen"
  },
  {
    "klantcode": 1061,
    "naam": "Reprobel"
  },
  {
    "klantcode": 1062,
    "naam": "Roonas - IcoMoon"
  },
  {
    "klantcode": 1063,
    "naam": "Skype Communications S.a.r.l."
  },
  {
    "klantcode": 1064,
    "naam": "Switch"
  },
  {
    "klantcode": 1065,
    "naam": "Total Belgium SA"
  },
  {
    "klantcode": 1066,
    "naam": "Zwart op wit"
  },
  {
    "klantcode": 1067,
    "naam": "Multisafepay"
  }
]
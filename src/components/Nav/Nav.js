import React from 'react';
import { useSelector } from 'react-redux';
import { NavWrapper } from './Nav-helpers';
import { hasData } from '../../store/derived-storestate-helpers';

export const menu = [
    { icon: 'home', link: '/', text: 'Home', public: true },
    {
        icon: 'cloud_upload', link: '/bankupload', text: 'Upload bankfile',
        helpLink: 'https://drive.google.com/open?id=1QdOWgoR2iVNtEirSc5--zElL7qW-tKJEM7GahppQrcY',
        longText: 'Betalingsbestanden (die je als csv van een bank hebt gedownload) uploaden naar Moneybird om daar te verwerken.'
    },
    {
        icon: 'remove_shopping_cart', link: '/betalingen/uitgaven', text: 'Uitgaven zonder bon',
        helpLink: 'https://drive.google.com/open?id=1e5eBWf0bWdqKFSFcargVlGP3KKaDJVKIAQWs5dIdIqE',
        longText: 'Uitgaven zonder bon downloaden, om de owners te vragen om ontbrekende bonnetjes te leveren.'
    },
    {
        icon: 'people', link: '/contacten', text: 'Contacten',
        longText: 'Keywords bij contacten bewerken, om koppeling tussen betaling en contact - en daarmee ook de owner - te verbeteren.'
    },
    {
        icon: 'receipt', link: '/inkomend', text: 'Bonnetjes en facturen',
        longText: 'Openstaande facturen met meer tegelijk koppelen aan een andere categorie (bijvoorbeeld om correcties te maken).'
    },
    {
        icon: 'attachment', link: '/betalingen/match', text: 'Betalingen matchen',
        helpLink: 'https://drive.google.com/open?id=1kQgazR3nxiLSxtklKpKcKVM6XL61XLQN2JO1aYEi9cQ',
        longText: 'Betalingen (uitgaand) matchen met (openstaande) bonnetjes en facturen.'
    },
    {
        icon: 'cake', link: '/revenues', text: 'Omzet verwerken', badge: true,
        helpLink: 'https://docs.google.com/document/d/1GGuChkVYiVbKlFWHGlx2wYlWFeYfoEUdZOqnIfV5NAQ/edit?usp=sharing',
        longText: 'Omzet (ontvangen betalingen), en interbank-betalingen automatisch aan een categorie toewijzen.'
    },
    {
        icon: 'sync', link: '/export', text: 'Export Finvision',
        helpLink: 'https://drive.google.com/open?id=1ztY5_jXGgFWT-gpPUeAJ5h6ykwTUl6h_b-Prbq6kv9E',
        longText: 'Facturen exporteren voor synchronisatie met Exactonline (nieuwe facturen en mutaties sinds laatste export)'
    },
    { icon: 'account_circle', link: '/connection', text: 'Connectie', public: true }
];

const Nav = (props) => {
    const { children, activePath } = props;
    const accessToken = useSelector(store => store.accessToken.toJS());
    const accessVerified = useSelector(store => hasData(store));
    const iconLogin = (accessToken.hasData) ?
        (accessVerified) ? "done_all" : "done" : "do_not_disturb";

    return <NavWrapper menu={menu} activePath={activePath} iconLogin={iconLogin} isConnected={accessToken.hasData}>
        {children}
    </NavWrapper>
}

export default Nav;
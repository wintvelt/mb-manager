import React from 'react';
import { useSelector } from 'react-redux';
import { NavWrapper } from './Nav-helpers';
import { hasData } from '../../store/derived-storestate-helpers';

const menu = [
    { icon: 'import_contacts', link: '/contacten/lijst', text: 'Contacten' },
    { icon: 'spellcheck', link: '/contacten/keywords', text: 'Contacten keywords' },
    { icon: 'receipt', link: '/inkomend', text: 'Bonnetjes en facturen' },
    { icon: 'account_balance', link: '/betalingen/lijst', text: 'Banktransacties' },
    { icon: 'attachment', link: '/betalingen/match', text: 'Betalingen matchen' },
    { icon: 'cloud_upload', link: '/bankmutations', text: 'Upload bankfile', badge: true },
    { icon: 'sync', link: '/export', text: 'Export Finvision' },
    { icon: 'account_circle', link: '/connection', text: 'Connectie' }
];

const Nav = (props) => {
    const { children, activePath } = props;
    const accessToken = useSelector(store => store.accessToken);
    const accessVerified = useSelector(store => hasData(store));
    const iconLogin = (accessToken.hasData) ?
        (accessVerified) ? "done_all" : "done" : "do_not_disturb";

    return <NavWrapper menu={menu} activePath={activePath} iconLogin={iconLogin}>
        {children}
    </NavWrapper>
}

export default Nav;
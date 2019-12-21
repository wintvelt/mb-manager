import React from 'react';
import { useSelector } from 'react-redux';
import { NavWrapper } from './Nav-helpers';
import { hasData } from '../../store/derived-storestate-helpers';

const menu = [
    { icon: 'import_contacts', link: '/contacten', text: 'Contacten' },
    { icon: 'receipt', link: '/inkomend', text: 'Bonnetjes en facturen' },
    { icon: 'remove_shopping_cart', link: '/betalingen/uitgaven', text: 'Uitgaven zonder bon' },
    { icon: 'attachment', link: '/betalingen/match', text: 'Betalingen matchen' },
    { icon: 'cloud_upload', link: '/bankupload', text: 'Upload bankfile' },
    { icon: 'sync', link: '/export', text: 'Export Finvision' },
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
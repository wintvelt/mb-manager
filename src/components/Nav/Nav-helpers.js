import React from 'react';
import clsx from 'clsx';
import { Link as RouterLink } from 'react-router-dom';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import teal from '@material-ui/core/colors/teal';
import Toolbar from '@material-ui/core/Toolbar';
import Icon from '@material-ui/core/Icon';
import Drawer from '@material-ui/core/Drawer';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubHeader from '@material-ui/core/ListSubHeader';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';

const drawerWidth = 240;
const version = 'versie 2.1.2';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    navTitle: {
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center'
    },
    avatar: {
        width: theme.spacing(15),
        height: theme.spacing(15),
        opacity: 0.5,
        transition: theme.transitions.create(['width', 'height'], {
            easing: theme.transitions.easing.sharp,
            duration: '400ms',
        }),
    },
    avatarHidden: {
        width: '48px',
        height: '48px',
        transition: theme.transitions.create(['width', 'height'], {
            easing: theme.transitions.easing.sharp,
            duration: '100ms',
        }),
    },
    help: {
        marginLeft: theme.spacing(1),
        textDecoration: 'none !important'
    },
    appBar: {
        // backgroundColor: deepPurple[300],
        background: 'linear-gradient(90deg, rgba(229,115,115,1) 50%, rgba(239,108,0,1) 100%)',
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    divider: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    drawer: {
        width: drawerWidth,
        backgroundColor: '#424242',
        color: '#ffffff',
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1
    },
    drawerPaper: {
        backgroundColor: '#424242',
        color: '#ffffff',
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: theme.spacing(1, 1, 0, 2),
        ...theme.mixins.toolbar,
        justifyContent: 'space-between',
    },
    list: {
        color: '#ffffff'
    },
    activePath: {
        color: teal['A200']
    },
    mainTitle: {
        padding: theme.spacing(2),
        height: '5rem',
        transition: theme.transitions.create(['height', 'padding'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        zIndex: 1
    },
    mainTitleHide: {
        height: '0px',
        padding: 0,
        overflowY: 'hidden'
    },
    listTitle: {
        color: '#ffffff',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        height: '3rem',
        paddingBottom: theme.spacing(1),
        transition: theme.transitions.create('height', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    textNew: {
        display: 'flex',
        alignItems: 'center'
    },
    iconNew: {
        color: teal['A200'],
        marginLeft: '.4rem'
    },
    listFooter: {
        color: '#ffffff',
        textAlign: 'center',
        padding: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        fontSize: '0.8rem',
        whiteSpace: 'normal',
        width: drawerWidth
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    textHide: {
        height: '0px',
        overflowY: 'hidden'
    },
    hide: {
        display: 'none'
    }
}));

const ListItemLink = (props) => {
    const { icon, text, link, badge, activePath, open } = props;
    const classes = useStyles();

    // weird mojo needed to use react-router with MUI
    const RenderLink = React.useMemo(
        () =>
            React.forwardRef((props, ref) => (
                <RouterLink to={link} {...props} innerRef={ref} />
            )),
        [link],
    );

    const textComp = (badge) ?
        <span className={classes.textNew}>{text}<Icon className={classes.iconNew}>fiber_new</Icon></span>
        : text;

    return <ListItem button component={RenderLink}>
        {!open && <ListItemIcon>
            <Tooltip title={<Typography>{text}</Typography>} placement='right'>
                <Icon className={clsx(classes.list, (link === activePath) && classes.activePath)}>
                    {icon}
                </Icon>

            </Tooltip>
        </ListItemIcon>}
        {open && <ListItemIcon>
            <Icon className={clsx(classes.list, (link === activePath) && classes.activePath)}>
                {icon}
            </Icon>
        </ListItemIcon>}
        <ListItemText className={(link === activePath) ? classes.activePath : ''} primary={textComp} />
    </ListItem>
}

const ListItemLinkDisabled = props => {
    const { icon, text } = props;

    return <ListItem style={{ color: 'grey' }}>
        <ListItemIcon>
            <Icon>
                {icon}
            </Icon>
        </ListItemIcon>
        <ListItemText primary={text} />
    </ListItem>
}

const ConnectionLink = (props) => {
    const { iconLogin, link } = props;

    // weird mojo needed to use react-router with MUI
    const RenderLink = React.useMemo(
        () =>
            React.forwardRef((props, ref) => (
                <RouterLink to={link} {...props} innerRef={ref} />
            )),
        [link],
    );

    return <Button component={RenderLink}
        aria-label="connectie-status"
        aria-controls="menu-appbar"
        color="inherit"
    >
        <Icon style={{ marginRight: '8px' }}>{iconLogin}</Icon>
        <span style={{ height: '1.3rem' }}>Connectie</span>
    </Button>
}

export const NavWrapper = (props) => {
    const { children, menu, activePath, iconLogin, isConnected } = props;
    const activeMenu = menu.find(it => it.link === activePath);
    const navTitle = activeMenu ? activeMenu.text : '';
    const navHelpLink = activeMenu && activeMenu.helpLink;

    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return <div className={classes.root}>
        <CssBaseline />
        <AppBar
            position="fixed"
            className={clsx(classes.appBar, {
                [classes.appBarShift]: open,
            })}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    className={clsx(classes.menuButton, open && classes.hide)}
                >
                    <Icon>menu</Icon>
                </IconButton>
                <Typography variant="h6" noWrap className={classes.navTitle}>
                    {navTitle}
                    {navHelpLink &&
                        <Tooltip title='link naar uitleg' placement='bottom' arrow>
                            <Link href={navHelpLink} className={classes.help}
                                target='_blank' rel='noopener noreferrer'>
                                <IconButton>
                                    <Icon>info_outline</Icon>
                                </IconButton>
                            </Link>
                        </Tooltip>
                    }
                </Typography>
                <ConnectionLink iconLogin={iconLogin} link='/connection' />
            </Toolbar>
        </AppBar>
        <Drawer
            variant="permanent"
            anchor="left"
            open={open}
            className={clsx(classes.drawer, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
            })}
            classes={{
                paper: clsx(classes.drawerPaper, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                }),
            }}>
            <div className={classes.drawerHeader}>
                {/* <Avatar alt="Mobly" src="/favicon%20300x300.ico" className={classes.avatar} /> */}
                <Avatar alt="Mobly" src="/moblybird.png"
                    className={clsx(classes.avatar, { [classes.avatarHidden]: !open })} />
                <IconButton onClick={handleDrawerClose}>
                    <Icon className={classes.list}>
                        {theme.direction === 'ltr' ? 'chevron_left' : 'chevron_right'}
                    </Icon>
                </IconButton>
            </div>
            <Typography variant='h4' className={clsx(classes.mainTitle, { [classes.mainTitleHide]: !open })}>
                MoblyBird
            </Typography>
            <Divider className={classes.divider} />
            <List dense className={classes.list}>
                <ListSubHeader className={clsx(classes.listTitle, { [classes.textHide]: !open })}>
                    Navigatie
                </ListSubHeader>
                {menu.map((item) => (
                    (item.public || isConnected) ?
                        <ListItemLink key={item.text} activePath={activePath} {...item} open={open} />
                        : <ListItemLinkDisabled key={item.text} activePath={activePath} {...item} />
                ))}
            </List>
            <Divider className={classes.divider} />
            <Typography className={clsx(classes.listFooter, { [classes.hide]: !open })} variant='body2'>
                Met liefde, passie gemaakt voor Mobly. Door Wouter, in de nachtelijke uurtjes, in de trein, of allebei.
            </Typography>
            <Typography className={clsx(classes.listFooter, { [classes.hide]: !open })} variant='body2'>
                {version}
            </Typography>
            <Typography className={clsx(classes.listFooter, { [classes.hide]: !open })} variant='body2'>
                <span role='img' aria-label='cheers'>🍻</span> 2019, 2020
            </Typography>
        </Drawer>
        <main
            className={clsx(classes.content)}>
            <div className={classes.drawerHeader} id='back-to-top-anchor' />
            {children}
        </main>
    </div>
}
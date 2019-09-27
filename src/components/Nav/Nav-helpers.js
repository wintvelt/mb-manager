import React from 'react';
import clsx from 'clsx';
import { Link as RouterLink } from 'react-router-dom';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import red from '@material-ui/core/colors/red';
import teal from '@material-ui/core/colors/teal';
import Toolbar from '@material-ui/core/Toolbar';
import Icon from '@material-ui/core/Icon';
import Drawer from '@material-ui/core/Drawer';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubHeader from '@material-ui/core/ListSubHeader';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    navTitle: {
        flexGrow: 1
    },
    appBar: {
        backgroundColor: red[300],
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    divider: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        backgroundColor: '#424242',
        color: '#ffffff',
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1, 0, 2),
        ...theme.mixins.toolbar,
        justifyContent: 'space-between',
    },
    list: {
        color: '#ffffff'
    },
    activePath: {
        color: teal['A200']
    },
    listTitle: {
        color: '#ffffff',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        paddingBottom: theme.spacing(1),
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
        fontSize: '0.8rem'
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
}));

const ListItemLink = (props) => {
    const { icon, text, link, badge, activePath } = props;
    const classes = useStyles();

    // weird mojo needed to use react-router with MUI
    const RenderLink = React.useMemo(
        () =>
            React.forwardRef((props, ref) => (
                <RouterLink to={link} {...props} innerRef={ref} />
            )),
        [link],
    );

    const textComp = (badge)?
     <span className={classes.textNew}>{text}<Icon className={classes.iconNew}>fiber_new</Icon></span>
     : text;

    return <ListItem button component={RenderLink}>
        <ListItemIcon>
            <Icon className={clsx(classes.list, (link === activePath) && classes.activePath)}>
                {icon}
            </Icon>
        </ListItemIcon>
        <ListItemText className={(link === activePath) ? classes.activePath : ''} primary={textComp} />
    </ListItem>
}

const AvatarLink = (props) => {
    const { iconLogin, link } = props;
    const classes = useStyles();

    // weird mojo needed to use react-router with MUI
    const RenderLink = React.useMemo(
        () =>
            React.forwardRef((props, ref) => (
                <RouterLink to={link} {...props} innerRef={ref} />
            )),
        [link],
    );

    return <IconButton component={RenderLink}
        aria-label="connectie-status"
        aria-controls="menu-appbar"
        color="inherit">
        <Avatar alt="Connecties" src={encodeURI(iconLogin)} className={classes.avatar} />
    </IconButton>
}

export const NavWrapper = (props) => {
    const { children, menu, activePath, iconLogin } = props;
    const navTitle = menu.find(it => it.link === activePath).text;

    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(true);

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
                </Typography>
                <AvatarLink iconLogin={iconLogin} link='/connection' />
            </Toolbar>
        </AppBar>
        <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="left"
            open={open}
            classes={{
                paper: classes.drawerPaper,
            }}>
            <div className={classes.drawerHeader}>
                <Avatar alt="Mobly" src="/favicon%20300x300.ico" className={classes.avatar} />
                <IconButton onClick={handleDrawerClose}>
                    <Icon className={classes.list}>
                        {theme.direction === 'ltr' ? 'chevron_left' : 'chevron_right'}
                    </Icon>
                </IconButton>
            </div>
            <Box component='h3' p={2} my={0}>
                MoblyBird
            </Box>
            <Divider className={classes.divider} />
            <List dense className={classes.list}>
                <ListSubHeader className={classes.listTitle}>Navigatie</ListSubHeader>
                {menu.map((item) => (
                    <ListItemLink key={item.text} activePath={activePath} {...item} />
                ))}
            </List>
            <Divider className={classes.divider} />
            <Typography className={classes.listFooter}>
                Met liefde, passie gemaakt voor Mobly, door Wouter, in de nachtelijke uurtjes, in de trein, of allebei.
            </Typography>
        </Drawer>
        <main
            className={clsx(classes.content, {
                [classes.contentShift]: open,
            })}>
            <div className={classes.drawerHeader} />
            {children}
        </main>
    </div>
}
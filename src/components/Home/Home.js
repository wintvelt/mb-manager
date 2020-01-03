//Home.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Icon from '@material-ui/core/Icon';
import Badge from '@material-ui/core/Badge';

import { menu } from '../Nav/Nav';

const useStyles = makeStyles(theme => ({
    cardContainer: {
        marginTop: theme.spacing(4)
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    avatar: {
        height: '64px',
        width: '64px',
        marginBottom: theme.spacing(2),
        backgroundColor: '#00ACC2'
    },
    link: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.6)',
    }
}));

const FeatureCard = props => {
    const { icon, link, text, longText, badge } = props;
    const classes = useStyles();

    // weird mojo needed to use react-router with MUI
    const RenderLink = React.useMemo(
        () =>
            React.forwardRef((props, ref) => (
                <RouterLink to={link} {...props} innerRef={ref} />
            )),
        [link],
    );

    return <Grid item xs={3} className={classes.card}>
        <RenderLink className={classes.link}>
            <Badge badgeContent='NIEUW!' color='error' invisible={!badge}>
                <Avatar className={classes.avatar}>
                    <Icon fontSize='large'>{icon}</Icon>
                </Avatar>
            </Badge>
            <Typography variant='h5' align='center' gutterBottom>{text}</Typography>
        </RenderLink>
        <Typography variant='body1'>{longText}</Typography>
    </Grid>
}

export default function Home(props) {
    const classes = useStyles();
    const bull = <span className={classes.bullet}>•</span>;
    return <Container>
        {/* <Typography variant='h2' align='center' color='primary' paragraph>Moblybird</Typography> */}
        <Typography variant='h2' align='center' color='secondary' paragraph>
            {bull} Moneybird makkelijker voor Mobly {bull}
        </Typography>
        <Grid container spacing={6} justify='center' className={classes.cardContainer}>
            {menu.filter(item => item.longText)
                .map(menuItem => <FeatureCard key={menuItem.link} {...menuItem} />)}
        </Grid>
    </Container>
}
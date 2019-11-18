import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    container: {
        minWidth: 275,
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    button: {
        marginTop: 32,
        marginRight: 16
    }
});

const MyIcon = (props) => <Icon>{props.title}</Icon>

export default function ConnectCard(props) {
    const classes = useStyles();
    const { hasAccess, hasReqToken, accessVerified, buttonList = [] } = props;

    return (
        <Container className={classes.container}>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
                Inlogstatus
            </Typography>
            <Typography variant="h5" component="h2">
                {hasAccess ?
                    <>
                        <MyIcon title={accessVerified ? 'done_all' : 'done'} />
                        Je bent ingelogd
                        </>
                    : hasReqToken ?
                        'Inlog gelukt.'
                        : 'Je moet nog inloggen.'
                }
            </Typography>
            <Typography className={classes.pos} color="textSecondary">
                {hasAccess ?
                    accessVerified ?
                        'Login is ook geverifieerd voor deze sessie.'
                        : '\u00A0'
                    : hasReqToken ?
                        'Je moet inlog nog verifiëren.'
                        : '\u00A0'
                }
            </Typography>
            {buttonList.map((button, i) =>
                <Button className={classes.button}
                    variant='contained'
                    key={button.key} onClick={button.action}
                    color={i === 0 ? 'primary' : 'default'}>
                    {button.title}
                </Button>
            )}
        </Container>
    );
}

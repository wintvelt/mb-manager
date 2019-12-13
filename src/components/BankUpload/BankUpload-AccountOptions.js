//BankUpload-AccountOptions.js
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles(theme => ({
    activeAccount: {
        backgroundColor: '#e0e0e0'
    }
}));

export const AccountOptions = props => {
    const { accounts, activeValue, onChange } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const classes = useStyles();
    const options = accounts.hasData &&
        accounts.data
            .filter(it => it.active)
            .map(it => ({
                label: it.name,
                value: it.id
            }));
    if (!options || options.length === 1) return null;

    const handleClick = e => {
        setAnchorEl(e.currentTarget);
    }

    const handleChange = value => {
        setAnchorEl(null);
        onChange(options && options.find(it => it.value === value))
    }

    const handleClose = () => {
        setAnchorEl(null);
    };

    return <div>
        <Button aria-controls="andere rekening" aria-haspopup="true" color='primary' variant='contained'
            onClick={handleClick}>
            Andere rekening
        </Button>
        <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
            {options.map(it => (
                <MenuItem key={it.value} value={it.value}
                    className={it.value === activeValue? classes.activeAccount : ''}
                    onClick={() => handleChange(it.value)}>
                    {it.label}
                </MenuItem>
            ))}
        </Menu>
    </div>
}

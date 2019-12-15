import React from 'react';
import PropTypes from 'prop-types';
import Downshift from 'downshift';
import { makeStyles, lighten } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';

function renderInput(inputProps) {
    const { InputProps, classes, ref, ...other } = inputProps;
    return (
        <TextField
            InputProps={{
                inputRef: ref,
                classes: {
                    root: classes.inputRoot,
                    input: classes.inputInput,
                },
                ...InputProps,
            }}
            {...other}
        />
    );
}

renderInput.propTypes = {
    /**
     * Override or extend the styles applied to the component.
     */
    classes: PropTypes.object.isRequired,
    InputProps: PropTypes.object,
};

function renderSuggestion(suggestionProps) {
    const { option, index, itemProps, highlightedIndex, selected } = suggestionProps;
    const isHighlighted = highlightedIndex === index;
    const isSelected = (selected || '').indexOf(option.label) > -1;

    return (
        <MenuItem
            {...itemProps}
            key={option.label}
            selected={isHighlighted}
            component="div"
            style={{
                fontWeight: isSelected ? 500 : 400,
            }}
        >
            {option.label}
        </MenuItem>
    );
}

renderSuggestion.propTypes = {
    highlightedIndex: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.number]).isRequired,
    index: PropTypes.number.isRequired,
    itemProps: PropTypes.object.isRequired,
    selectedItem: PropTypes.string.isRequired,
    suggestion: PropTypes.shape({
        label: PropTypes.string.isRequired,
    }).isRequired,
};

function getSuggestions(options, value, selected, { showEmpty = false } = {}) {
    const openOptions = options.filter(o => !selected.includes(o.value));
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    const outStuff = showEmpty
        ? []
        : openOptions.filter(option => {
            const keep =
                count < 20 && (inputLength === 0 || option.label.toLowerCase().includes(inputValue));

            if (keep) {
                count += 1;
            }

            return keep;
        });
    return outStuff;
}

function MultiSelect(props) {
    const { options, placeholder, selected, onChange } = props;
    const classes = useStyles();

    const [inputValue, setInputValue] = React.useState('');

    const handleKeyDown = event => {
        if (selected.length && !inputValue.length && event.key === 'Backspace') {
            onChange(selected.slice(0, selected.length - 1));
        }
    };

    const handleInputChange = event => {
        setInputValue(event.target.value);
    };

    const handleChange = item => {
        let newSelected = [...selected];
        if (newSelected.indexOf(item) === -1) {
            newSelected = [...newSelected, item];
        }
        setInputValue('');
        onChange(newSelected);
    };

    const handleDelete = item => () => {
        const newSelected = [...selected];
        newSelected.splice(newSelected.indexOf(item), 1);
        onChange(newSelected);
    };

    return (
        <Downshift
            id="downshift-multiple"
            inputValue={inputValue}
            onChange={handleChange}
            selected={selected}
        >
            {({
                getInputProps,
                getItemProps,
                getLabelProps,
                isOpen,
                inputValue: inputValue2,
                selected: selected2,
                highlightedIndex,
                openMenu
            }) => {
                const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
                    onKeyDown: handleKeyDown,
                    placeholder: placeholder,
                    onFocus: openMenu
                });

                return (
                    <div className={classes.container}>
                        {renderInput({
                            fullWidth: true,
                            classes,
                            InputLabelProps: getLabelProps(),
                            InputProps: {
                                startAdornment: selected.map(item => (
                                    <Chip
                                        key={item}
                                        tabIndex={-1}
                                        label={item}
                                        className={classes.chip}
                                        onDelete={handleDelete(item)}
                                    />
                                )),
                                onBlur,
                                onChange: event => {
                                    handleInputChange(event);
                                    onChange(event);
                                },
                                onFocus
                            },
                            inputProps,
                        })}

                        {isOpen ? (
                            <Paper className={classes.paper} square>
                                {getSuggestions(options, inputValue2, selected).map((option, index) =>
                                    renderSuggestion({
                                        option,
                                        index,
                                        itemProps: getItemProps({ item: option.label }),
                                        highlightedIndex,
                                        selected: selected2,
                                    }),
                                )}
                            </Paper>
                        ) : null}
                    </div>
                );
            }}
        </Downshift>
    );
}

MultiSelect.propTypes = {
    options: PropTypes.array.isRequired,
    placeholder: PropTypes.string.isRequired,
    selected: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
};

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        height: 250,
    },
    container: {
        flexGrow: 1,
        position: 'relative',
    },
    paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing(1),
        left: 0,
        right: 0,
        maxHeight: '200px',
        overflowY: 'scroll'
    },
    chip: {
        margin: theme.spacing(0.5, 0.25),
        height: '24px',
        backgroundColor: lighten(theme.palette.primary.light, 0.85)
    },
    inputRoot: {
        flexWrap: 'wrap',
    },
    inputInput: {
        width: 'auto',
        flexGrow: 1,
        height: '24px',
        margin: '2px'
    },
    divider: {
        height: theme.spacing(2),
    }
}));

export default MultiSelect;
// page helpers
import React from 'react';
import Link from '@material-ui/core/Link';
import Icon from '@material-ui/core/Icon';

export const TableLink = (props) => {
    const { hrefBase, hrefEnd, initValue, content } = props;
    return ((hrefBase || hrefEnd) && initValue) ?
        <Link href={hrefBase + hrefEnd}
            target='_blank' rel='noopener noreferrer'>
                <span>{content || initValue}</span>
                <Icon fontSize='small' style={{ marginBottom: '-5px', marginLeft: '4px' }}>launch</Icon>
        </Link>
        : null;
}

const withThousand = (amtStr) => {
    return (amtStr.slice(0, 1) === '-') ?
        (amtStr.length > 4) ?
            withThousand(amtStr.slice(0, -3)) + '.' + amtStr.slice(-3)
            : amtStr
        : (amtStr.length > 3) ?
            withThousand(amtStr.slice(0, -3)) + '.' + amtStr.slice(-3)
            : amtStr
}

export const AmountBlock = props => {
    const { amount, openAmount, indent, secondary } = props;
    const baseStyle = {
        width: '128px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        paddingLeft: '16px'
    };
    const blockStyle = {
        ...baseStyle,
        marginRight: indent? '96px' : null,
        flex: indent? '1 0 auto' : 'none',
        color: secondary? '#616161' : 'default'
    }
    return <div style={blockStyle}>
        <PrettyAmount amount={amount} />
        {openAmount && openAmount !== 0 && <PrettyAmount amount={openAmount} isOpen/>}
    </div>

}

export const PrettyAmount = (props) => {
    const { amount, isOpen } = props;
    const absAmount = amount < 0 ? -amount : amount;
    const mainAmt = Math.floor(absAmount);
    const cents = Math.round(absAmount * 100 - mainAmt * 100);
    const centStr = (cents < 10) ? '0' + cents : cents.toString();
    return <div>
        <span style={{ fontSize: isOpen? '.8rem': '1.1rem' }}>
            {isOpen && 'open: '}
            €{'\u00A0'}
            {(amount < 0) && '-'}
            {withThousand(mainAmt.toString())},
        </span>
        <span style={{ fontSize: '.7rem', verticalAlign: 'top' }}>{centStr}</span>
    </div>
}

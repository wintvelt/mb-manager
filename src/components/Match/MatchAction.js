// MatchAction.js
import React from 'react';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

export default props => {
    const { selected } = props;
    const selectedCount = selected && selected.length;

    return <Box display='flex' alignItems='center' justifyContent='flex-end' padding='8px 0 0 0'>
        <Typography style={{ marginRight: '16px' }} color={selectedCount? 'textPrimary':'textSecondary'}>
            {`${selectedCount || 'Nog geen'} betaling${selectedCount === 1 ? '' : `en`} gematcht`}
        </Typography>
        <Button variant='contained' color='primary' disabled={!selectedCount}>
            Verwerken
        </Button>
    </Box>
}
// Component for Active account (sub of Bankmutations)
import React from 'react';

export const ActiveAccount = (props) => {
    const { bankData } = props;
    return (
        <div>
            <p>I am here</p>
            <pre>{JSON.stringify(bankData, null, 2)}</pre>
        </div>
    );
}


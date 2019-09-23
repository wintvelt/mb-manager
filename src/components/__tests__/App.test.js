import React from 'react';

describe('App', () => {
  console.log({mykey: process.env.MY_KEY});
  console.log({react_mykey: process.env.REACT_APP_MY_KEY});
  it('does some test if true === true', () => {
    expect(true).toEqual(true)
  })
})
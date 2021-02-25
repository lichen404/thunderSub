import React from 'react';
import {hot} from 'react-hot-loader'
import Header from './components/Header';

const App: React.FC = () => {
    return (
        <>
        <h1>Hello World</h1>
            <span>12</span>
            <Header/>
            </>
    );
};
export default hot(module)(App);
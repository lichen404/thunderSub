import React from 'react';
import {hot} from 'react-hot-loader'
import Upload from './components/Upload';

const App: React.FC = () => {
    return (
        <>
        <h1>Hello World</h1>

            <Upload/>
            </>
    );
};
export default hot(module)(App);
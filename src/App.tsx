import {hot} from 'react-hot-loader'
import {HashRouter as Router, Route, Routes} from "react-router-dom";
import Upload from './views/Upload';
import List from "./views/List";
import NoMatch from "./views/NoMatch";
import Context from "./context";
import React, {FC} from "react";
import Nav from "./components/Nav";
import Index from "./views/Index";
import History from "./views/History";


const App: FC = () => {

    return (
        <Context>
            <Nav/>

            <main>
                <Router>
                    <Routes>
                        <Route path="/" element={<Index/>}>
                            <Route path="/:file/list" element={<List/>}/>
                            <Route element={<Upload/>} index/>
                            <Route path="/upload" element={<Upload/>}/>
                            <Route path="/history" element={<History/>}/>
                            <Route path="*" element={<NoMatch/>}>
                        </Route>
                        </Route>
                    </Routes>
                </Router>
            </main>

        </Context>

    );
};
export default hot(module)(App);
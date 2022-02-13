import {hot} from 'react-hot-loader'
import {HashRouter as Router, Switch, Route, Redirect} from "react-router-dom";
import Upload from './views/Upload';
import List from "./views/List";
import NoMatch from "./views/NoMatch";
import Context from "./context";
import React, {FC} from "react";
import Nav from "./components/Nav";


const App: FC = () => {

    return (
        <Context>
            <Nav/>

            <main>
                <Router>
                    <Switch>
                        <Route path="/upload" exact>
                            <Upload/>
                        </Route>
                        <Route path="/:file/list" exact>
                            <List/>
                        </Route>
                        <Redirect exact from="/" to='/upload'/>
                        <Route path="*">
                            <NoMatch/>
                        </Route>
                    </Switch>
                </Router>
            </main>

        </Context>

    );
};
export default hot(module)(App);
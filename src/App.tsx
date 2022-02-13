import {hot} from 'react-hot-loader'
import {HashRouter as Router, Switch, Route, Redirect} from "react-router-dom";
import Upload from './views/Upload';
import List from "./views/List";
import NoMatch from "./views/NoMatch";
import ContextProvider ,{Context}from "./context";
import React, {FC, useContext} from "react";
import Nav from "./components/Nav";
import SideBar from "./components/SideBar";
import styled from "styled-components";



const AppWrapper = styled.div`
  display: flex;
  min-height: calc(100vh - 30px);
  width: 100%;
  > main {
    flex:1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
`
const App: FC = () => {
   const {isSideBarVisible} = useContext(Context)
    return (
        <ContextProvider>
            <Nav/>
            <AppWrapper>
                <SideBar isVisible={isSideBarVisible}/>
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
            </AppWrapper>
        </ContextProvider>

    );
};
export default hot(module)(App);
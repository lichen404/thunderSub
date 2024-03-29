import React, {FC} from "react";
import styled from "styled-components";

import SideBar from "./SideBar";


const AppWrapper = styled.div`
  
  min-height: calc(100vh - 25px);
  display: flex;
  flex-direction: column;

`
const Layout: FC = ({children}) => {

    return (
        <AppWrapper>
            <SideBar/>
            {children}
        </AppWrapper>
    )

}

export default Layout;
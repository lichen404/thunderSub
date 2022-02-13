import React, {FC} from "react";
import styled from "styled-components";

import SideBar from "./SideBar";


const AppWrapper = styled.div`
  display: flex;
  min-height: calc(100vh - 30px);

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
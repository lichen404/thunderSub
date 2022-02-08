import {FC} from "react";
import styled from "styled-components";

const SideBarWrapper = styled.ul`
  
  width: 200px;
  background-color: #f0f0f0;
`
const SideBar: FC = () => {
    return (<SideBarWrapper>
        sidebar
    </SideBarWrapper>)
}

export default SideBar;
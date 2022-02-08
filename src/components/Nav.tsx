import {FC} from "react";
import styled from "styled-components";
import Icon from "./Icon";

const NavWrapper = styled.nav`
  height: 30px;
  -webkit-app-region: drag;

  > ul {
    width: 100%;
    text-align: right;

    > li {
      display: inline-block;
      padding: 6px;
      cursor: pointer;
      -webkit-app-region: no-drag;

      &:first-child {
        float: left;
      }

      &:last-child:hover {
        background: #fb7373;
      }

      &:hover {
        background: #e2e2e2;
      }
    }


  }
`

const Nav: FC = () => {
    return <NavWrapper>
        <ul>
            <li>
                <Icon name="menu-on"/>
            </li>
            <li>
                <Icon name="minus"/>
            </li>
            <li>
                <Icon name="max"/>
            </li>
            <li>
                <Icon name="close"/>
            </li>
        </ul>
    </NavWrapper>
}

export default Nav;
import {FC, useContext} from "react";
import styled from "styled-components";
import {NavLink} from "react-router-dom";
import Icon from "./Icon";
import ContextProvider, {Context} from "../context";

const SideBarWrapper = styled.ul`

  width: 200px;
  background-color: #f0f0f0;
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100vh;

  > li {
    line-height: 44px;
    height: 44px;
    cursor: pointer;


    &:hover {

      background-color: #b8bfc6;
    }

    &.close-button-wrapper {
      background: #f0f0f0;
      display: flex;
      align-items: center;
      padding: 0 8px 0 32px;
      justify-content: space-between;


      > h3 {
        font-size: 18px;
      }

      > svg {
        width: 1.5em;
        height: 1.5em;
        cursor: pointer;
        -webkit-app-region: no-drag;
      }

    }

    > a {
      display: block;
      width: 100%;
      padding-left: 32px;
      color: #000;

      &.selected {
        background-color: #b8bfc6;
      }


    }


  }


`
const SideBar: FC = () => {
    const {isSidebarVisible, setIsSidebarVisible} = useContext(Context)
    return (
        isSidebarVisible ? <SideBarWrapper>
            <li className='close-button-wrapper'>
                <h3>菜单</h3>
                <Icon name="menu-off" onClick={() => {
                    setIsSidebarVisible(false)
                }}/>
            </li>
            <li>
                <NavLink to="/upload" activeClassName="selected"> 上传</NavLink>

            </li>
            <li>
                <NavLink to="/history" activeClassName="selected"> 历史记录</NavLink>
            </li>

        </SideBarWrapper> : null
    )
}

export default SideBar;
import {FC, useContext} from "react";
import styled from "styled-components";
import {NavLink} from "react-router-dom";
import Icon from "./Icon";
import {Context} from "../context";

const SideBarWrapper = styled.aside`

  > ul {
    background-color: #42424e;
    transition: all .3s;
    position: absolute;
    top: 0;
    width: 200px;
    min-height: 100vh;
    left: -200px;

    &.open-sidebar {
      left: 0;
    }

    > li {
      line-height: 44px;
      height: 44px;
      cursor: pointer;


      &:hover {

        background-color: #2c2a38;
      }

      &.close-button-wrapper {

        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding-right: 20px;
        cursor: pointer;
        &:hover {
          background-color: #42424e;
        }


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


        &.selected {
          background-color: #2c2a38;
        }


      }


    }
  }






`
const SideBar: FC = () => {
    const {isSidebarVisible, setIsSidebarVisible} = useContext(Context)
    return (


        <SideBarWrapper>
            <ul className={isSidebarVisible ? 'open-sidebar' : undefined}>
                <li className='close-button-wrapper' onClick={() => {

                    setIsSidebarVisible(false)
                }}>

                    <Icon name="menu-off"/>
                </li>
                <li>
                    <NavLink to="/upload" activeClassName="selected"> 上传</NavLink>

                </li>
                <li>
                    <NavLink to="/history" activeClassName="selected"> 历史记录</NavLink>
                </li>
            </ul>


        </SideBarWrapper>


    )
}


export default SideBar;
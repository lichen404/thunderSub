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
    z-index: 2;

    &.open-sidebar {
      left: 0;
    }

    > li {
      line-height: 44px;
      height: 44px;
      cursor: pointer;


      &:hover {

        background-color: #343442;
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

  > .shadow {
    position: absolute;
    bottom: 0;
    min-height: calc(100vh - 25px);
    left: 0;
    display: block;
    min-width: 100%;
    z-index: 1;
    background-color: rgba(42, 42, 56, .8);
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
                    <NavLink to="/upload" className={({isActive}) => isActive ? "selected" : ""}> 上传</NavLink>

                </li>
                <li>
                    <NavLink to="/history" className={({isActive}) => isActive ? "selected" : ""}> 历史记录</NavLink>
                </li>
            </ul>
            {isSidebarVisible && <div className="shadow" onClick={() => {
                setIsSidebarVisible(false)
            }}/>}


        </SideBarWrapper>


    )
}


export default SideBar;
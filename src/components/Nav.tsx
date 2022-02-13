import {FC, useContext, useState} from "react";
import styled from "styled-components";
import {ipcRenderer} from "electron";
import Icon from "./Icon";
import {Context} from "../context";


const NavWrapper = styled.nav`
  max-height: 30px;
  -webkit-app-region: drag;

  > ul {
    width: 100%;
    text-align: right;

    > li {
      display: inline-block;
      padding: 4px 6px;
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
    const [isMaxWindow, setIsMaxWindow] = useState(false)
    const [isFixedWindow, setIsFixedWindow] = useState(false)
    const {isSideBarVisible, setIsSideBarVisible} = useContext(Context)
    return <NavWrapper>
        <ul>
            <li onClick={() => {
                setIsSideBarVisible(!isSideBarVisible)
            }
            }>
                <Icon name="menu-on"/>
            </li>
            <li onClick={() => {
                ipcRenderer.send('fixed-window',!isFixedWindow)
                setIsFixedWindow(!isFixedWindow)
            }
            } style={isFixedWindow ? {background: '#e2e2e2'} : {}}>
                <Icon name="fixed"/>
            </li>
            <li onClick={() => {
                ipcRenderer.send('minimize-window')
            }
            }>
                <Icon name="minus"/>
            </li>
            {isMaxWindow ? <li onClick={() => {
                    ipcRenderer.send('resize-window')
                    setIsMaxWindow(false)
                }}
                >
                    <Icon name="restore"/>
                </li> :
                <li onClick={() => {
                    ipcRenderer.send('maximize-window')
                    setIsMaxWindow(true)
                }
                }>
                    <Icon name="max"/>
                </li>}
            <li onClick={() => {
                ipcRenderer.send('close-window')
            }
            }>
                <Icon name="close"/>
            </li>
        </ul>
    </NavWrapper>
}

export default Nav;
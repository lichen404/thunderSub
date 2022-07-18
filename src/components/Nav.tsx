import {FC, useContext, useState} from "react";
import styled from "styled-components";
import Icon from "./Icon";
import {Context} from "../context";


const NavWrapper = styled.nav`
  max-height: 30px;
  -webkit-app-region: drag;
  background-color: #343442;

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
        background-color: hsla(0, 0%, 98%, .2);

      }
    }


  }
`

const Nav: FC = () => {
    const [isMaxWindow, setIsMaxWindow] = useState(false)
    const [isFixedWindow, setIsFixedWindow] = useState(false)
    const {setIsSidebarVisible} = useContext(Context)
    return <NavWrapper>
        <ul>
            <li onClick={() => {
                setIsSidebarVisible(true)

            }
            }>
                <Icon name="menu-on"/>
            </li>
            <li onClick={() => {
                window.electron.ipcRenderer.send('fixed-window', !isFixedWindow)
                setIsFixedWindow(!isFixedWindow)
            }
            } style={isFixedWindow ? {background: 'hsla(0,0%,98%,.2)'} : {}}>
                <Icon name="fixed"/>
            </li>
            <li onClick={() => {
                window.electron.ipcRenderer.send('minimize-window')
            }
            }>
                <Icon name="minus"/>
            </li>
            {isMaxWindow ? <li onClick={() => {
                    window.electron.ipcRenderer.send('resize-window')
                    setIsMaxWindow(false)
                }}
                >
                    <Icon name="restore"/>
                </li> :
                <li onClick={() => {
                    window.electron.ipcRenderer.send('maximize-window')
                    setIsMaxWindow(true)
                }
                }>
                    <Icon name="max"/>
                </li>}
            <li onClick={() => {
                window.electron.ipcRenderer.send('close-window')
            }
            }>
                <Icon name="close"/>
            </li>
        </ul>
    </NavWrapper>
}

export default Nav;
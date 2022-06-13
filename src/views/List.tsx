import React, {FC, useContext} from "react";
import {Context} from "../context";
import SubTable from "../components/Table";
import {ipcRenderer} from "electron";
import styled from "styled-components";
import Icon from "../components/Icon";

const Wrapper = styled.div`
  overflow: auto hidden;

  button {
    cursor: pointer;
    background-color: #2c2a38;
    > svg {
      width: 24px;
      height:24px;
    }
  }

`

const List: FC = () => {

    const {fileList} = useContext(Context)
    return (

        <Wrapper>
            <SubTable columns={
                [
                    {
                        dataIndex: "sname",
                        name: "名称",

                    },
                    {
                        dataIndex: "language",
                        name: "语言",
                        width: 180
                    },
                    {
                        dataIndex: "simility",
                        name: "匹配度",
                        render(value) {
                            return `${value * 100}%`
                        },
                        width: 160
                    },
                    {
                        dataIndex: "sext",
                        name: "类型",
                        width: 100
                    },
                    {
                        dataIndex: 'surl',
                        width: 80,
                        render(url, file) {
                            return <button onClick={() => {
                                ipcRenderer.send('download-sub', {url, name: `${file.sname}.${file.sext}`})
                            }
                            }><Icon name="download"/></button>
                        }
                    }
                ]
            } data={fileList}/>

        </Wrapper>

    )
}

export default List;
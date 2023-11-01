import {FC, useEffect, useState} from "react";
import SubTable from "../components/Table";
import {handleOpenDB, readLatestData} from "../store";
import ActionButton from "../components/ActionButton";
import styled from "styled-components";

const Wrapper = styled.div`
  overflow: auto hidden;

  button {
    cursor: pointer;
    background-color: #2c2a38;

    > svg {
      width: 24px;
      height: 24px;
    }
  }

`

const History: FC = () => {
    const [historyData, setHistoryData] = useState([])

    useEffect(() => {
            handleOpenDB('history', 'movieStore').then((db) => {
                readLatestData(db, 'movieStore').then((list) => {
                    setHistoryData(list)
                })
            })
        }
        , [])

    return <Wrapper>
        <SubTable columns={
            [
                {
                    dataIndex: "name",
                    name: "文件名"
                },
                {
                    dataIndex: "path",
                    width: 80,
                    name:"操作",
                    render(path, file) {
                        return <ActionButton url={file.surl} file={file} icon="view"/>
                    }

                }
            ]

        } data={
            historyData
        }/>
    </Wrapper>
}

export default History;
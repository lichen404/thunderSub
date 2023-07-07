import {FC, useEffect, useState} from "react";
import SubTable from "../components/Table";
import {handleOpenDB} from "../store";
import Icon from "../components/Icon";
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
                const transaction = db.transaction('movieStore', 'readonly');
                const objectStore = transaction.objectStore('movieStore');
                objectStore.openCursor().onsuccess = (event: any) => {
                    const cursor = event.target.result;
                    if (cursor && historyData.length < 10) {
                        historyData.push(cursor.value);
                        cursor.continue();
                    }
                    setHistoryData([...historyData])

                };

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
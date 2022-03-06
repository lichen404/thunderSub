import React, {FC, useContext} from "react";
import {useHistory} from "react-router-dom";
import {Context} from "../context";
import SubTable from "../components/Table";
import Layout from "../components/Layout";
import {ipcRenderer} from "electron";

const List: FC = () => {
    const history = useHistory()
    const {fileList} = useContext(Context)
    console.log(fileList)
    return (
        <Layout>
            <SubTable columns={
                [
                    {
                        dataIndex: "sname",
                        name: "名称",
                        width: 200
                    },
                    {
                        dataIndex: "language",
                        name: "语言"
                    },
                    {
                        dataIndex: "simility",
                        name: "匹配度"
                    },
                    {
                        dataIndex: "sext",
                        name: "类型"
                    },
                    {
                        dataIndex: 'surl',
                        render(url,file) {
                            return <button onClick={() => {
                                ipcRenderer.send('download-sub', {url,name:`${file.sname}.${file.sext}`})
                            }
                            }>下载</button>
                        }
                    }
                ]
            } data={fileList}/>
            <button onClick={() => {
                history.push('/')
            }}>back
            </button>
        </Layout>
    )
}

export default List;
import React, {FC, useContext} from "react";
import {useHistory} from "react-router-dom";
import {Context} from "../context";
import SubTable from "../components/Table";

const List: FC = () => {
    const history = useHistory()
    const {fileList} = useContext(Context)
    console.log(fileList)

    return (
        <>
            <SubTable columns={
                [
                    {
                        dataIndex:"sname",
                        name:"名称",
                        width:200
                    },
                    {dataIndex:"language",
                        name:"语言"
                    },
                    {
                        dataIndex:"simility",
                        name:"匹配度"
                    },
                    {
                        dataIndex:"sext",
                        name:"类型"
                    }
                ]
            } data={fileList.sublist}/>
            <button onClick={() => {
                history.push('/')
            }}>back
            </button>
        </>
    )
}

export default List;
import React, {FC, useContext} from "react";
import {useHistory} from "react-router-dom";
import {Context} from "../context";

const List: FC = () => {
    const history = useHistory()
    const {fileList} = useContext(Context)

    return (
        <>
            <ul>
                {
                    fileList.sublist && fileList.sublist.map((sub: any, index: number) => {
                        return (
                            sub.sname ?
                            <li key={index}>
                                <span>{sub.sname}</span>
                                <span>{sub.languate}</span>
                                <span>{sub.sext}</span>
                                <span>{sub.simility}</span>
                                <button>下载</button>
                            </li>:null
                        )
                    })
                }
            </ul>
            <button onClick={() => {
                history.push('/')
            }}>back
            </button>
        </>
    )
}

export default List;
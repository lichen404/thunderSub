import React, {FC, useContext} from "react";
import {useHistory} from "react-router-dom";
import {Context} from "../context";

const List: FC = () => {
    const history = useHistory()
    const {fileList} = useContext(Context)
    return (
        <>
            <div>{JSON.stringify(fileList)}</div>
            <button onClick={() => {
                history.push('/')
            }}>back
            </button>
        </>
    )
}

export default List;
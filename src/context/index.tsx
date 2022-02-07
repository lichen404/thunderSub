import React,{createContext, FC, useState} from "react";


export const Context = createContext<any>({})


const ContextProvider:FC = ({children})=>{
    const [fileList, setFileList] = useState([])

    return (
        <Context.Provider value={{fileList, setFileList}}>
            {children}
        </Context.Provider>
    )
}


export default ContextProvider;

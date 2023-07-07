import React, {FC, useState} from "react";
import Icon from "./Icon";
import {handleOpenDB} from "../store";

interface ButtonProps {
    url: string,
    file: any;
    icon?:'download' | 'loading' | 'view'
}

const ListButton: FC<ButtonProps> = ({url, file,icon = 'download'}) => {
    const [iconName, setIconName] = useState(icon)
    const [viewPath, setViewPath] = useState("")
    return <button onClick={async () => {

        if (iconName === 'download') {
            setIconName('loading')
            const path = await window.electron.ipcRenderer.invoke('download-sub', {
                url,
                name: `${file.sname}.${file.sext}`
            })
            const db = await  handleOpenDB('history','movieStore')
            const transaction = db.transaction('movieStore', 'readwrite');
            const movieStore = transaction.objectStore('movieStore');
            movieStore.add(
                {
                    name:`${file.sname}.${file.sext}`,
                    path,
                    ...file
                }
            )

            setViewPath(path)
            setIconName('view')

        }
        if (iconName === 'view') {
            const result = await window.electron.ipcRenderer.invoke('open-explore', viewPath)
            result || setIconName('download')
        }


    }
    }><Icon name={iconName}/></button>
}

export default ListButton;
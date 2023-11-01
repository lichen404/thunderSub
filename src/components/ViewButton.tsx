import React, {FC, useState} from "react";
import Icon from "./Icon";
import {addData, handleOpenDB, updateData} from "../store";

interface ButtonProps {
    url: string,
    file: any;
    icon?: 'download' | 'loading' | 'view'
}

const ViewButton: FC<ButtonProps> = ({url, file, icon = 'download'}) => {
    const [iconName, setIconName] = useState(icon)
    const [viewPath, setViewPath] = useState("")
    return <button onClick={async () => {

        if (iconName === 'download') {
            setIconName('loading')
            const path = await window.electron.ipcRenderer.invoke('download-sub', {
                url,
                name: `${file.sname}.${file.sext}`
            })
            const db = await handleOpenDB('history', 'movieStore')

            await addData(db, 'movieStore', {
                name: `${file.sname}.${file.sext}`,
                path,
                ...file
            }).catch(() => {
                updateData(db, 'movieStore', {
                    name: `${file.sname}.${file.sext}`,
                    path,
                    ...file
                })
            })

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

export default ViewButton;
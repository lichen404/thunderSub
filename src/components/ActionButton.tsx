import React, {FC, useState} from "react";
import Icon from "./Icon";

interface ButtonProps {
    url: string,
    file: any;
    icon?:'download' | 'loading' | 'view'
}

const ActionButton: FC<ButtonProps> = ({url, file,icon = 'download'}) => {
    const [iconName, setIconName] = useState(icon)
    const [viewPath, setViewPath] = useState(file.path)
    return <button onClick={async () => {

        if (iconName === 'download') {
            setIconName('loading')
            const path = await window.electron.ipcRenderer.invoke('download-sub', {
                url,
                name: `${file.sname}.${file.sext}`
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

export default ActionButton;
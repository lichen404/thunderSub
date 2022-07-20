import {useEffect, useRef} from "react";

export const useOutSideClick = (callback: (event: MouseEvent) => void):void => {
    const ref = useRef<any>()
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback(event)
            }
        }
        document.addEventListener('click', handleClick)
        return () => {
            document.removeEventListener('click', handleClick)
        }
    })


}
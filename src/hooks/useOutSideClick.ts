import {MutableRefObject, useEffect, useRef} from "react";

type fn<T> = (callback:(event:MouseEvent)=>void)=>MutableRefObject<T>

export const useOutSideClick:fn<any> = (callback) => {
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
    return ref;


}
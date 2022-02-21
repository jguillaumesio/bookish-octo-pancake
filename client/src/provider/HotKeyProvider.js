import React, {useEffect, useRef} from 'react';

export const context = React.createContext({setRef: null});

export const HotKeyProvider = ({children, onKeyPress}) => {

    const ref = useRef();

    const listener = (e) => {
        onKeyPress.find(key => key.name === e.key)?.callback();
    }

    useEffect(() => {
        ref.current.addEventListener('keydown', listener);
        return () => ref.current.removeEventListener("keydown", listener);
    }, [ref,onKeyPress]);

    return (
        <div ref={ref} tabIndex="0">
            {children}
        </div>
    )
}
import React, {useRef} from 'react';

export const context = React.createContext({setRef:null});

export const HotKeyProvider = ({children, onKeyPress}) =>{

    const ref = useRef();

    const setKeyListener = () => {
        ref.addEventListener('onKeyPress',(e) =>{
            onKeyPress.find(key => key === e.code)?.callback();
        })
    }

    return(
        <div ref={ref}>
            {children}
        </div>
    )
}
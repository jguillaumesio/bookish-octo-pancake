import React, {useEffect, useState} from 'react';
import {GlobalStyles} from "@mui/material";
import {Outlet} from 'react-router-dom';
import {ButtonBottomIndicator} from "../component/ButtonBottomIndicator";
import {HotKeyProvider} from "./HotKeyProvider";
import {makeStyles} from "@mui/styles";
import {VisualKeyboard} from "../component/VisualKeyboard";

const style = (hasKeys) => {
    return {
        'body': {
            overflow: 'overlay',
            margin: '0',
            fontFamily: "'Roboto', sans-serif",
        },
        '*': {
            boxSizing: 'border-box',
            margin: 0,
            padding:0
        },
        '.hg-theme-default':{
            borderRadius:"0",
            width:"100%",
            background:"#202020"
        },
        '.hg-button':{
            background:'#101010 !important',
            color:'#fff !important',
            borderBottomColor:"#000 !important"
            //borderBottom: 'none !important',
        },
        '.container': {
            background: '#121212',
            display: 'flex',
            minHeight: `${ !hasKeys ? '100vh' : 'calc(100vh - 50px)'}`,
            height: `${ !hasKeys ? '100vh' : 'calc(100vh - 50px)'}`,
            maxHeight: `${ !hasKeys ? '100vh' : 'calc(100vh - 50px)'}`,
            flexDirection: 'column'
        },
        '.content': {
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            maxHeight: '100%',
            height: '100%',
        }
    }
};

export const GlobalProvider = () => {

    const [keys, setKeys] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [keyboardCallback, setKeyboardCallback] = useState(null);
    const [keyboardCloseCallback, setKeyboardCloseCallback] = useState(null);

    return (
        <React.Fragment>
            <HotKeyProvider keys={keys} setKeys={setKeys}>
                <VisualKeyboard isOpen={isOpen} setIsOpen={setIsOpen} keyboardCloseCallback={keyboardCloseCallback} setKeyboardCloseCallback={setKeyboardCloseCallback} keyboardCallback={keyboardCallback} setKeyboardCallback={setKeyboardCallback}>
                    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:"hidden"}}>
                        <div style={{ height:`${ (keys.length === 0) ? '100%' : 'calc(100% - 50px)'}`}}>
                            <GlobalStyles styles={style(keys.length > 0)}/>
                            <Outlet/>
                        </div>
                        <ButtonBottomIndicator buttons={keys}/>
                    </div>
                </VisualKeyboard>
            </HotKeyProvider>
        </React.Fragment>
    )
}
import React, {useState} from 'react';
import {GlobalStyles} from "@mui/material";
import {Outlet} from 'react-router-dom';
import {ButtonBottomIndicator} from "../component/ButtonBottomIndicator";
import {HotKeyProvider} from "./HotKeyProvider";
import {makeStyles} from "@mui/styles";

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

export const StyleProvider = () => {

    const [keys, setKeys] = useState([]);

    return (
        <React.Fragment>
            <HotKeyProvider keys={keys} setKeys={setKeys}>
                <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:"hidden"}}>
                    <div style={{ height:`${ (keys.length === 0) ? '100%' : 'calc(100% - 50px)'}`}}>
                        <GlobalStyles styles={style(keys.length > 0)}/>
                        <Outlet/>
                    </div>
                    <ButtonBottomIndicator buttons={keys}/>
                </div>
            </HotKeyProvider>
        </React.Fragment>
    )
}
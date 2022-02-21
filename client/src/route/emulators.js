import {Button} from "@mui/material"
import {useState} from "react";
import {HotKeyProvider} from "../provider/HotKeyProvider";

export const EmulatorListIndex = ( ) => {

    const emulatorList = [['ps1','ps2','wii'],['ds','gamecube','megadrive']]
    const [selected,setSelected] = useState([0,0]);
    const transition = 330;

    const handleItemStyle = (item, indexes) => {
        let style = {
            height:'auto',
            maxWidth:'100%',
            filter: 'drop-shadow(0px 0px 1px rgba(0, 0, 0, 0))',
            transition: `all ${transition}ms ease-in-out`
        };
        return (selected[0] === indexes[0] && selected[1] === indexes[1]) ? {...style, filter: 'drop-shadow(0px 0px 1px rgba(0, 179, 255, 0.5))', transform:'scale(1.1)'} : style;
    }

    const modulo = (i , n) => {
        const m = (( i % n) + n) % n;
        return m < 0 ? m + Math.abs(n) : m;
    };

    const keyEvents = [
        {
            name:'ArrowLeft',
            callback:() => {
                const max = emulatorList[selected[0]].length;
                const tempSelected = [selected[0], modulo(selected[1] - 1, max)];
                setSelected(tempSelected);
            }
        },{
            name:'ArrowUp',
            callback:() => {
                const max = emulatorList.length;
                const tempSelected = [modulo(selected[0] - 1, max), selected[1]];
                setSelected(tempSelected);
            }
        },{
            name:'ArrowRight',
            callback:() => {
                const max = emulatorList[selected[0]].length;
                const tempSelected = [selected[0], modulo(selected[1] + 1, max)];
                setSelected(tempSelected);
            }
        },{
            name:'ArrowDown',
            callback:() => {
                const max = emulatorList.length
                const tempSelected = [modulo(selected[0] + 1, max), selected[1]];
                setSelected(tempSelected);
            }
        }
    ]

    return (
        <HotKeyProvider
            onKeyPress={keyEvents}
        >
            <div className="container">
                <div className="content">
                    <div style={{ display:'flex', flexDirection:'column',minHeight:'100%',maxWidth:'80vw',margin:'0 auto', justifyContent:'center', alignItems:'center'}}>
                        {emulatorList.map((row, rowIndex) =>
                            <ul key={rowIndex} style={{ display:'inline-flex', listStyleType:'none'}}>
                                {row.map((item, columnIndex) =>
                                    <li key={item} style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
                                        <img style={ handleItemStyle(item, [rowIndex, columnIndex]) } src={`/emulators/${item}.png`} alt={item}/>
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </HotKeyProvider>
    )
}
import {Button} from "@mui/material"
import {useState} from "react";

export const EmulatorListIndex = ( ) => {

    const emulatorList = [['ps1','ps2','wii'],['ds','gamecube','megadrive']]
    const [selected,setSelected] = useState(emulatorList[0][0]);

    const handleItemStyle = (item) => {
        let style = {
            height:'auto',
            maxWidth:'100%',
        };
        return (item === selected) ? {...style, filter: 'drop-shadow(0px 0px 1px rgba(0, 179, 255, 0.5))', transform:'scale(1.1)'} : style;
    }

    return (
        <div className="container">
            <div className="content">
                <div style={{ display:'flex', flexDirection:'column',minHeight:'100%',maxWidth:'80vw',margin:'0 auto', justifyContent:'center', alignItems:'center'}}>
                    {emulatorList.map((row, index) =>
                        <ul key={index} style={{ display:'inline-flex', listStyleType:'none'}}>
                            {row.map(item =>
                                <li key={item} style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
                                    <img style={ handleItemStyle(item) } src={`/emulators/${item}.png`} alt={item}/>
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
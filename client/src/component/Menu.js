import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {HotKeyProvider} from "../provider/HotKeyProvider";

export const Menu = (props) => {

    const {emulatorList, onBackspace} = props;
    const navigate = useNavigate();
    const [selected, setSelected] = useState([0, 0]);
    const transition = 330;

    const handleItemStyle = (item, indexes) => {
        let style = {
            height: 'auto',
            maxWidth: '100%',
            filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0, 0))',
            transition: `all ${transition}ms ease-in-out`
        };
        return (selected[0] === indexes[0] && selected[1] === indexes[1]) ? {
            ...style,
            filter: 'drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.2))',
            transform: 'scale(1.1)'
        } : style;
    }

    const modulo = (i, n) => {
        const m = ((i % n) + n) % n;
        return m < 0 ? m + Math.abs(n) : m;
    };

    const handleMoves = (direction, increment) => {
        let max, tempSelected;
        if (direction === "horizontal") {
            max = emulatorList[selected[0]].length;
            tempSelected = [selected[0], modulo(selected[1] + increment, max)];
        } else {
            max = emulatorList.length;
            tempSelected = [modulo(selected[0] + increment, max), selected[1]];
        }
        setSelected(tempSelected);
    }

    const keyEvents = [
        {
            name: 'ArrowLeft',
            callback: () => {
                handleMoves("horizontal", -1);
            }
        }, {
            name: 'ArrowUp',
            callback: () => {
                handleMoves("vertical", -1);
            }
        }, {
            name: 'ArrowRight',
            callback: () => {
                handleMoves("horizontal", +1);
            }
        }, {
            name: 'ArrowDown',
            callback: () => {
                handleMoves("vertical", +1);
            }
        },
        {
            name: 'Enter',
            callback: () => {
                navigate(emulatorList[selected[0]][selected[1]]);
            }
        }, {
            name: 'Backspace',
            callback: () => {
                if (onBackspace) {
                    onBackspace();
                }
            }
        }
    ]

    return (
        <HotKeyProvider onKeyPress={keyEvents}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                margin: '0 auto',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
            }}>
                {emulatorList.map((row, rowIndex) =>
                    <ul key={rowIndex}
                        style={{display: 'inline-flex', padding: '40px', margin: '0', listStyleType: 'none'}}>
                        {row.map((item, columnIndex) =>
                            <li key={item} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '20px'
                            }}>
                                <img style={handleItemStyle(item, [rowIndex, columnIndex])}
                                     src={`/emulators/${item}.png`} alt={item}/>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </HotKeyProvider>
    )
}
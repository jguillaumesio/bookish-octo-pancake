import {useEffect, useState} from "react";
import useWindowDimensions from "../hook/useWindowDimensions";
import * as React from "react";
import {KeyContext} from "../provider/HotKeyProvider";
import {buttons} from "../utils/pad";

export const GameCaroussel = (props) => {

    let {games} = props;
    const [width, margin, transition] = [300, 20, 500];
    const windowDimensions = useWindowDimensions();
    const [selected, setSelected] = useState(null);
    const offset = -selected?.index * (width + margin * 2) + (windowDimensions.width - (width + margin * 2)) / 2;//- selectedIndex * (width + margin * 2) + (windowDimensions.width - (width + margin * 2)) / 2;
    const [setKeys] = React.useContext(KeyContext);

    const handleMoves = (increment) => {
        const modulo = (i, n) => {
            return ((i % n) + n) % n;
        };
        const max = games.length;
        const selectedIndex = games.findIndex(game => game.index === selected.index);
        setSelected(games[modulo(selectedIndex + increment, max)]);
    }

    const keyEvents = [
        {
            ...buttons.left,
            label:"Se déplacer",
            args:{"increment":1},
            callback: ({increment}) => handleMoves(increment)
        }, {
            ...buttons.right,
            label:"Se déplacer",
            args:{"increment":-1},
            callback: ({increment}) => handleMoves(increment)
        },
        {
            ...buttons.cross,
            label:"Démarrer",
            callback: () => {
                console.log("toLaunch");
            }
        }, {
            ...buttons.circle,
            label:"Quitter",
            callback: () => {
                console.log("leave");
            }
        }
    ];

    useEffect(() => {
        setSelected(games[Math.floor(games.length / 2)]);
        setKeys(keyEvents);
    }, [games, setKeys, keyEvents]);

    useEffect(() => {
        setKeys(keyEvents);
    },[selected, setKeys, keyEvents]);

    const handleItemStyle = (item) => {
        let style = {
            transition: `${transition}ms ease-in-out`,
            minHeight: 'auto',
            width: `${width}px`,
            margin: `${margin}px`
        };
        return (item === selected) ? {...style, transform: `scale(${(item.index === selected.index) ? 1.1 : 1})`} : {
            ...style,
            filter: 'grayscale(100%)'
        };
    }

    return (
        <div style={{
            display: 'flex',
            transition: `transform ${transition}ms ease-in-out`,
            transform: `translateX(${offset}px)`,
            width: "100%"
        }}>
            {games.map((game, index) => (
                <img key={index} src={game.cover.url} alt={game.name}
                     style={handleItemStyle(game)}/>
            ))}
        </div>
    )
}
import {useEffect, useState} from "react";
import useWindowDimensions from "../hook/useWindowDimensions";

export const GameCaroussel = (props) => {

    let {games} = props;
    const [width, margin, transition] = [300, 20, 500];
    const windowDimensions = useWindowDimensions();
    const [selected, setSelected] = useState(null);
    const offset = -selected?.index * (width + margin * 2) + (windowDimensions.width - (width + margin * 2)) / 2;//- selectedIndex * (width + margin * 2) + (windowDimensions.width - (width + margin * 2)) / 2;

    useEffect(() => {
        setSelected(games[Math.floor(games.length / 2)]);
    }, [games]);

    useEffect(() => {
        setTimeout(()=>{
            console.log("ok");
        },1000)
    },[selected])

    const handleSelected = (increment) => {
        const modulo = (i, n) => {
            return ((i % n) + n) % n;
        };
        const max = games.length;
        const selectedIndex = games.findIndex(game => game.index === selected.index);
        setSelected(games[modulo(selectedIndex + increment, max)]);
    }

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
        <div style={{display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%'}}>
            <div style={{
                display: 'flex',
                transition: `transform ${transition}ms ease-in-out`,
                transform: `translateX(${offset}px)`
            }}>
                {games.map((game, index) => (
                    <img key={index} src={game.thumbnail} alt={game.name}
                         style={handleItemStyle(game)}/>
                ))}
            </div>
            <button onClick={() => handleSelected(+1)}>NEXT</button>
            <button onClick={() => handleSelected(-1)}>PREVIOUS</button>
        </div>
    )
}
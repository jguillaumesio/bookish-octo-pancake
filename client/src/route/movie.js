import {useContext, useEffect, useRef, useState} from "react";
import MovieDataService from "./../service/movie.service";
import {IconButton, ImageList, ImageListItem, ImageListItemBar, ListSubheader} from "@mui/material";
import {makeStyles} from "@mui/styles";
import {KeyContext} from "../provider/HotKeyProvider";
import {KeyboardContext} from "../component/VisualKeyboard";
import {buttons} from "../utils/pad";
import {useNavigate} from "react-router-dom";

const useStyle = makeStyles({
    'selectedContainer':{
        border:"4px solid #009dff",
    }
});

export const MovieIndex = () => {

    const classes = useStyle();

    const cols = 8;
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(-1);
    const [featuredItems, setFeaturedItems] = useState([]);
    const [searchedItems, setSearchedItems] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [setKeys] = useContext(KeyContext);
    const [setIsOpen, setKeyboardCallback, setKeyboardCloseCallback] = useContext(KeyboardContext);

    useEffect(() => {
        setKeys(keyEvents);
    },[selectedIndex, featuredItems, searchedItems]);

    useEffect(async () => {
        setKeys(keyEvents);
        const res = await MovieDataService.getNewMovies().then(res => res.data);
        if("type" in res && res.type === "success"){
            setFeaturedItems(res.value);
            if(selectedIndex > res.value.length){
                setSelectedIndex(0);
            }
        }
    },[]);

    const handleIndexSelection = ({setter, length, move}) => {
        let shift = 0;
        switch(move){
            case "top":
                shift = -cols;
                break;
            case "bottom":
                shift = cols;
                break;
            case "left":
                shift = -1;
                break;
            case "right":
                shift = 1;
                break;
        }
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => modulo(index + shift, length));
    }

    const searchFiltering = async (search, setSearchedItems, setSelectedIndex, setIsSearching) => {
        setIsSearching(1);
        const response = await MovieDataService.search(search);
        if("type" in response.data && response.data.type === "success"){
            setSelectedIndex(0);
            setIsSearching(0);
            setSearchedItems(response.data.value);
        }
    }

    const handleSearchFiltering = async ({setSearchedItems, setSelectedIndex, setIsSearching}) => {
        setKeyboardCallback(_ => async (search) => {
            await searchFiltering(search, setSearchedItems, setSelectedIndex, setIsSearching);
        });
        setKeyboardCloseCallback(_ => () => {
            setTimeout(() => setKeys(keyEvents), 100);
        })
        setIsOpen(true);
    }

    const keyEvents = [
        {
            ...buttons.bottom,
            display: false,
            continuous: true,
            args: {"move": "bottom", "setter": setSelectedIndex, "length": featuredItems.length},
            callback: handleIndexSelection
        },
        {
            ...buttons.top,
            display: false,
            continuous: true,
            args: {"move": "top", "setter": setSelectedIndex, "length": featuredItems.length},
            callback: handleIndexSelection
        },
        {
            ...buttons.right,
            continuous: true,
            display: false,
            args: {"move": "right", "setter": setSelectedIndex, "length": featuredItems.length},
            callback: handleIndexSelection
        },
        {
            ...buttons.left,
            continuous: true,
            display: false,
            args: {"move": "left", "setter": setSelectedIndex, "length": featuredItems.length},
            callback: handleIndexSelection
        },
        {
            ...buttons.square,
            label: "Réinitialiser",
            args:{},
            callback: () => {}
        },
        {
            ...buttons.triangle,
            label: "Chercher",
            args:({"setSearchedItems": setSearchedItems, "setSelectedIndex": setSelectedIndex, "setIsSearching": setIsSearching}),
            callback: handleSearchFiltering
        },
        {
            ...buttons.cross,
            label: "Voir",
            args:{},
            callback: () => {}
        },
        {
            ...buttons.circle,
            label: "Retour",
            callback: () => navigate("/")
        },
    ]

    return (
        <div className='container' >
            <div className='content'>
                <ImageList cols={cols} gap={20} sx={{ padding:"20px", width: "100%", height: "fit-content", overflowY:"hidden" }}>
                    {(isSearching === -1 ? featuredItems : searchedItems).map((item, index) => (
                        <ImageListItem key={index} className={`${(index === selectedIndex) ? classes.selectedContainer : ""}`}>
                            <img
                                src={item.cover}
                                srcSet={item.cover}
                                alt={item.title}
                                loading="lazy"
                            />
                            <ImageListItemBar
                                title={item.title}
                                actionIcon={
                                    <IconButton
                                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                        aria-label={`info about ${item.title}`}
                                    >
                                    </IconButton>
                                }
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </div>
        </div>
    )
}
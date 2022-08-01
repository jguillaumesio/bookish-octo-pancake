import {useEffect, useRef, useState} from "react";
import MovieDataService from "./../service/movie.service";
import {IconButton, ImageList, ImageListItem, ImageListItemBar, ListSubheader} from "@mui/material";
const {VideoJS} = require("../component/VideoJS");


export const MovieIndex = () => {

    const [featuredItems, setFeaturedItems] = useState({"movies":[],"series":[]});

    useEffect(async () => {
        const res = await MovieDataService.getNewMovies().then(res => res.data);
        if("type" in res && res.type === "success"){
            setFeaturedItems(res.value);
            console.log(res.value);
        }
    },[]);

    return (
        <div className='container' >
            <div className='content'>
                <ImageList sx={{ width: 500, height: 450 }}>
                    {featuredItems.movies.map((item) => (
                        <ImageListItem key={item.title}>
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
                    {featuredItems.series.map((item) => (
                        <ImageListItem key={item.title}>
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
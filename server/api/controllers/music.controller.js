const axios = require("axios");
const qs = require("qs");
const {stringsSimilarityPercentage, normaliseString} = require("../../utils");

const base64encode = string => Buffer.from(string).toString('base64');

const getAlbumCover = async (spotifyToken, id) => {
    try{
        const result = await axios.get(`https://api.spotify.com/v1/albums/${id}`,{
            "headers":{
                "Authorization":`Bearer ${spotifyToken}`
            }
        }).then(res => res.data);
        if("images" in result && result.images.length > 0){
            return result["images"][0]["url"];
        }
        else{
            return null
        }
    }catch(e){
        return null
    }
}

const authenticate = async _ => {
    const basic = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
    const data = qs.stringify({'grant_type':'client_credentials'});
    const token =
        await axios.post("https://accounts.spotify.com/api/token",
            data,
            {
                "headers":{
                    "Content-Type":"application/x-www-form-urlencoded",
                    "Authorization":`Basic ${base64encode(basic)}`
                }
            }).then(res => res.data["access_token"]);
    return token;
}

const keepBestMatch = (matches) => {
    return matches.reduce((bestMatch, element) => (element.similarity > bestMatch.similarity) ? element : bestMatch, matches[0]);
}

module.exports = (app, spotifyToken) => {
    const module = {};
    module.spotifySearch = async (req, res) => {
        const {search, type} = req.body;

        spotifyToken = (!spotifyToken) ? await authenticate(spotifyToken) : spotifyToken;

        try{
            const result = await axios.get(encodeURI(`https://api.spotify.com/v1/search?q=${search}&type=${type}&include_external=audio`),{
                "headers":{
                    "Authorization":`Bearer ${spotifyToken}`
                }
            }).then(res => res.data["tracks"]["items"]);
            if(type === "track"){
                for(const i in result){
                    const cover = await getAlbumCover(spotifyToken, result[i].album.id)
                    result[i] = {
                        "title":result[i].name,
                        "artist":result[i].artists.reduce((a, b) => [...a, b.name],[]).join(", "),
                        "duration":(result[i]["duration_ms"] / 1000).toFixed(0),
                        "cover": cover
                    }
                }
            }
            else if (type === "playlist"){

            }
            res.send({
                type:"success",
                value:result
            })
        }catch(e){
            console.log(e);
            res.send({
                type:"error",
                value:[]
            })
        }
    }
    module.getMp3Link = async (req, res) => {
        let { artist, title } = req.body;
        artist = normaliseString(artist);
        title = normaliseString(title);
        try{
            let musics = await axios.get(encodeURI(`https://slider.kz/vk_auth.php?q=${artist} ${title}`)).then(res => res.data["audios"][""]);
            musics = [...musics].filter(e => ("tit_art" in e && "id" in e && "duration" in e && "url" in e && "extra" in e)).map(e => {
                return {
                    "similarity": stringsSimilarityPercentage(e.tit_art.toLowerCase(), `${artist.toLowerCase()} - ${title.toLowerCase()}`),
                    "stream":`https://slider.kz/download/${e.id}/${e.duration}/${e.url}/${e.tit_art}.mp3?extra=${e.extra}`
                }
            });

            if(musics.length === 0){
                res.send({
                    type:"error",
                    value: null
                });
                return;
            }

            res.send({
                type:"success",
                value: keepBestMatch(musics)
            });

        }catch(e){
            console.log(e);
            res.send({
                type:'error',
                value:null
            })
        }
    }
    return module;
}
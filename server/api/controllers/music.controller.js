const YouTube = require('youtube-node');
const {logError} = require("server/utils");

module.exports = () => {
    const module = {};
    module.youtubeSearch = async (req, res) => {
        try{
            const {search} = req.body;
            let videos = []
            const youtube = new YouTube();
            youtube.setKey(process.env.YOUTUBE_API_KEY);
            youtube.search(search, 10, (error, result) => {
                if(error){
                    throw Error("Error while searching on youtube");
                }
                videos = result.items.filter(video => video.id.videoId !== undefined ).map( video => {
                    return {
                        "link": `https://www.youtube.com/watch?v=${video.id.videoId}`,
                        "title": video.snippet.title,
                        "thumbnail": video?.snippet?.thumbnails?.high?.url ?? video?.snippet?.thumbnails?.medium?.url ?? video?.snippet?.thumbnails?.default?.url
                    }
                });
                res.send({
                    type:"success",
                    value: videos
                })
            });
        }catch(e){
            logError("game.controller.js",e);
            res.send({
                type:"error",
                value:[]
            })
        }
    }
    return module;
}
const axios = require("axios");

module.exports = (app) => {
    const module = {};
    module.search = async (req, res) => {
        const { search } = req.body;
        try{
            const musics = await axios.get(`https://slider.kz/vk_auth.php?q=${search}`).then(res => res.data["audios"][""]);
            res.send({
                type:"success",
                value: [...musics].map(e => {
                    return {
                        ...e,
                        "stream":`https://slider.kz/download/${e.id}/${e.duration}/${e.url}/${e.tit_art}.mp3?extra=${e.extra}`
                    }
                })
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
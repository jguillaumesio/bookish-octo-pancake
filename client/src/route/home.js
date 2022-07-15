import {useRef} from "react";
import {VisualKeyboard} from "../component/VisualKeyboard";
const {VideoJS} = require("../component/VideoJS");


export const HomeIndex = () => {

    console.log(VideoJS);
    const channels = [
        "https://s12.tntendirect.com/tf1/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MTE6MzYgUE0maGFzaF92YWx1ZT14Mk1ZRTJFdEM5QkRxL2pjbEhjQWx3PT0mdmFsaWRtaW51dGVzPTMw",
        "https://s12.tntendirect.com/m6/live/chunks.m3u8?nimblesessionid=123947&wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MTU6MTQgUE0maGFzaF92YWx1ZT1nOGY1Uzl5K3JTSGcwMzN2UEhpTUdBPT0mdmFsaWRtaW51dGVzPTMw",
        "https://s13.tntendirect.com/arte/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MTc6MzUgUE0maGFzaF92YWx1ZT05NDF2NG1VTFFMQkJDZzFZU242ZFJ3PT0mdmFsaWRtaW51dGVzPTMw",
        "https://s13.tntendirect.com/d8/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MTc6NTYgUE0maGFzaF92YWx1ZT1KL2JYcWN3b3VMMnUzVzgzOHhLRy9BPT0mdmFsaWRtaW51dGVzPTMw",
        "https://s12.tntendirect.com/w9/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MTg6MTcgUE0maGFzaF92YWx1ZT1VNFFhODJheFpWOFdkWmxTa1Y0UG5nPT0mdmFsaWRtaW51dGVzPTMw",
        "https://s12.tntendirect.com/tmc/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MTg6MzcgUE0maGFzaF92YWx1ZT12bi9JVExaT0ptK25pOWo2czUzS3dBPT0mdmFsaWRtaW51dGVzPTMw",
        "https://s12.tntendirect.com/nt1/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MTg6NTQgUE0maGFzaF92YWx1ZT11RldNT2twaGFRSzNQY1pBRnFWMGR3PT0mdmFsaWRtaW51dGVzPTMw",
        "https://s13.tntendirect.com/nrj12/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MTk6MTIgUE0maGFzaF92YWx1ZT1kWU03alF1SlNZWkJrYXlrRDEybGtRPT0mdmFsaWRtaW51dGVzPTMw",
        "https://s13.tntendirect.com/d17/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MTk6NDIgUE0maGFzaF92YWx1ZT0wajhwdWJxbjRqZHYwTGJFM3N0NlZnPT0mdmFsaWRtaW51dGVzPTMw",
        "https://s12.tntendirect.com/hd1/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MjA6MDMgUE0maGFzaF92YWx1ZT1SOEh3a2NLM0c1VHlDVjJVZkFNL0xnPT0mdmFsaWRtaW51dGVzPTMw",
        "https://s13.tntendirect.com/lequipe21/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MjA6MjAgUE0maGFzaF92YWx1ZT1mREJrUkZ0a0o5RHBvMCsySVJVTDh3PT0mdmFsaWRtaW51dGVzPTMw",
        "https://s12.tntendirect.com/6ter/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MjA6MzQgUE0maGFzaF92YWx1ZT1Ub2J6Q1BsbW9uZ2prMU1hbjZaNnBBPT0mdmFsaWRtaW51dGVzPTMw",
        "https://s12.tntendirect.com/cherie25/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6MjA6NTMgUE0maGFzaF92YWx1ZT15ckFTaFBOUDIrbUV5VE9SN09GUW53PT0mdmFsaWRtaW51dGVzPTMw",
        "https://simulcast-p.ftven.fr/ZXhwPTE2NTYwMjM1NTd+YWNsPSUyZip+aG1hYz1jZTBmZDk4MDhhNDA5ZTgxNjhmMWI5OGJkZmY0YTE1ZjY4ZTQwZGM5NTBhZWUxYTYxMTFiN2EwZGYyOTM4OTc2/simulcast/France_2/hls_fr2/France_2-avc1_1400000=10001.m3u8",
        "https://s13.tntendirect.com/d17/live/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9Ni8yMy8yMDIyIDQ6Mzg6MzYgUE0maGFzaF92YWx1ZT1XR2w3K0VRZ3RIZ0NPYlpDVmFKdzd3PT0mdmFsaWRtaW51dGVzPTMw",
        "https://networkbest.ru.com/cdn/3TSNtZLyqk/playlist.m3u8",
        "https://networkbest.ru.com/cdn/p7b8oKcBP2/playlist.m3u8",
        "https://networkbest.ru.com/cdn/3TSNtZLyqk/playlist.m3u8",
        "http://stream.accessnetbd.com/hls/sky12.m3u8",
        "https://networkbest.ru.com/cdn/premium123/chunks.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium98/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium99/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium100/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium111/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium112/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium115/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium62/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium63/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium64/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium61/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium92/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium93/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://networkbest.ru.com/cdn/premium60/playlist.m3u8?|Referer=https://player.licenses4.me/",
        "https://origin-live-6play.video.bedrock.tech/6play/short/clr/gulli/hdeindex.m3u8"
    ]

    const playerRef = useRef(null);

    const videoJsOptions = {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: "https://networkbest.ru.com/cdn/premium123/chunks.m3u8?|Referer=https://player.licenses4.me/",
            type: 'application/x-mpegURL'
        }]
    };

    const handlePlayerReady = (player) => {
        playerRef.current = player;

        // You can handle player events here, for example:
        player.on('waiting', () => {
            console.log('player is waiting');
        });

        player.on('dispose', () => {
            console.log('player will dispose');
        });
    };

    return (
        <div className='container' >
            <div className='content'>
                {/*<VideoJS options={videoJsOptions} onReady={handlePlayerReady} />*/}
                <VisualKeyboard/>
            </div>
        </div>
    )
}
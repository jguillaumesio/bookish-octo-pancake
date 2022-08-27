import {useRef} from "react";
import VideoJS from "../component/VideoJS";


export const TVIndex = () => {

    const channels = Array(4).fill([1,2,3,4,5,6,7,8,9,10,11]).map((e,i) => e.map(y => `https://leet365.cc/fr/${i+1}/${y}`)).reduce((a,b) => [...a, ...b],[]);
    console.log(channels);

    const playerRef = useRef(null);

    const videoJsOptions = {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: "https://yatn9ng5b2d6a9e4.cdnexpress37.net:8443/hls/ysagetp2j4x.m3u8?s=795s5-fy6VVEdiYevWqj4g&e=1661638091",
            type: 'application/x-mpegURL'
        }]
    };

    const handlePlayerReady = (player) => {
        playerRef.current = player;

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
                <div style={{ display:"flex", flexDirection:"column", position:"absolute", left:0, background:"white", width:"20%"}}>
                    {
                        channels.map((channel, index) => <span style={{ width: "100%", overflow: "hidden", whiteSpace:"nowrap", textOverflow:"ellipsis"}}>{channel}</span>)
                    }
                </div>
                <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
                {/*<video autoPlay={true} tabIndex="-1" role="application" preload="none" src="https://tr232gd.dood.video/u5kj6srdjpglsdgge6wh4yqzlg5z4kaqgsmbc2uzt3m5rc7l645ssa6j4xgq/o2q3eevabn~xeQrmK5oVb?token=3y71nx74aj6smk0z3gg0mq8h&expiry=1659300895179"></video>*/}
            </div>
        </div>
    )
}
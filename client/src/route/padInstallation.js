import * as React from "react";
import {TopBar} from "../component/TopBar";

export const DownloadListIndex = ({breadCrumb}) => {

    return (
        <div className="container" style={{ maxHeight:"100%", minHeight:"100%", display:"flex"}}>
            <div className="content" style={{ backgroundColor:"#101010", zIndex:2, padding:"16px"}}>
                <div style={{ padding:"16px 16px 0 16px"}}>
                    <TopBar links={[]} breadCrumb={breadCrumb}/>
                </div>
            </div>
        </div>
    )
}
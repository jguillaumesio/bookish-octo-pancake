import {useState} from "react";

export const DownloadManager = () => {

    const [items, setItems] = useState([]);

    return (
        <div>
            {items.map( item =>
                <div>

                </div>
            )}
        </div>
    )
}
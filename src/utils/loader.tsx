import React from "react";
import loaderGif from '../assets/images/loaderNew.gif';
import './loader.css';
type LoaderProps = {
    showHide: boolean;
};
const Loader: React.FC<LoaderProps> = ({ showHide }) => {
    if (!showHide) {
        return null;
    }

    return (
        <div className="loader"><img src={loaderGif} alt="Loading..." /></div>
    );
}
export default Loader;
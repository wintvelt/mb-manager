// file-helpers.js

import React, { useState } from 'react';

export const FileZone = (props) => {
    const { fileHandler } = props;
    const [dragOver, setDragOver] = useState(false);

    const onDragEnter = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setDragOver(true);
    }

    const onDragLeave = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setDragOver(false);
    }

    const onFileDrop = (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("File Drop");
        fileHandler(e.dataTransfer.files);
        setDragOver(false);
    }

    const zoneStyle = (dragOver) ? "upload-zone dragover" : "upload-zone";
    return (
        <div style={{position: 'relative'}}>
            <label htmlFor='fileDing' className={zoneStyle}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={(e) => {
                    e.dataTransfer.dropEffect = 'copy';
                    e.stopPropagation();
                    e.preventDefault();
                }}
                onDrop={onFileDrop}>
                <div className="upload-border">
                    <i className="medium material-icons grey-text">file_download</i>
                    <span className="grey-text text-darken-2">
                        Drop .csv bestand met betalingen hier, of klik.
                    </span>
                </div>
            </label>
            <input type='file' id='fileDing' 
            className='upload-zone' accept='.csv'
            onChange={e => fileHandler(e.target.files)}/>
        </div>
    );

};
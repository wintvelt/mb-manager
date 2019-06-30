// file-helpers.js

import React, { Component } from 'react';

export class FileZone extends Component {
    constructor(props) {
        super(props);

        this.state = { dragOver: false };

        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onFileDrop = this.onFileDrop.bind(this);
    }

    onDragEnter(e) {
        e.stopPropagation();
        e.preventDefault();
        this.setState({ dragOver : true });
    }
  
    onDragLeave(e) {
        e.stopPropagation();
        e.preventDefault();
        this.setState({ dragOver : false });
    }

    onFileDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        console.log("onFileDrop");
        console.log(e.dataTransfer.files);
        alert("dropped");
        this.setState({ dragOver : false });
    }
  
    render() {
        const zoneStyle = (this.state.dragOver)? "upload-zone dragover" : "upload-zone";
        return (
            <div className={zoneStyle}
                onDragEnter={this.onDragEnter}
                onDragLeave ={this.onDragLeave}
                onDragOver={(e) => {
                    e.dataTransfer.dropEffect = 'copy';
                    e.stopPropagation();
                    e.preventDefault();
                }}
                onDrop={this.onFileDrop}>
                <div className="upload-border">
                    <i className="medium material-icons grey-text">file_download</i>
                    <span className="grey-text text-darken-2">Drop .csv bestand met betalingen hier</span>
                </div>
            </div>
        );
    }
};
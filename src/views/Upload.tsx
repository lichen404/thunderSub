import React, {useContext} from 'react';
import styled from "styled-components";
import {ipcRenderer} from "electron";
import {useHistory} from "react-router-dom";
import {Context} from "../context";


const UploadWrapper = styled.div`
  width: 256px;
  height: 256px;
  background: #fafafa;
  border: 1px dashed #d9d9d9;

  > label {
    width: 100%;
    height: 100%;
    display: block;

    input {
      display: none;
    }
  }
`


const Upload: React.FC = () => {
    const history = useHistory()
    const {setFileList} = useContext(Context)
    const handleUpload = async (e: any) => {
        const payload = {
            videoName: e.dataTransfer?.files[0].name || e.target.files[0].name,
            videoPath: e.dataTransfer?.files[0].path || e.target.files[0].path
        }
        const data = await ipcRenderer.invoke('upload-file', payload)
        setFileList(data)

        history.push(`/${payload.videoName}/list`)
    }
    return (
        <>
            <div>upload</div>
            <UploadWrapper>
                <label onDrop={handleUpload} onDragOver={
                    (e) => {
                        e.preventDefault();
                    }
                }>
                    <span>将文件拖拽至此，或点击上传</span>
                    <input type="file" onChange={
                        handleUpload
                    }/>
                </label>
            </UploadWrapper>


        </>
    )
}
export default Upload;
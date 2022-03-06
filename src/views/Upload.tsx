import React, {useContext, useState} from 'react';
import styled from "styled-components";
import {ipcRenderer} from "electron";
import {useHistory} from "react-router-dom";
import {Context} from "../context";
import Icon from "../components/Icon";
import Layout from "../components/Layout";


const UploadWrapper = styled.div`
  width: 256px;
  height: 256px;
  background: #fafafa;
  border: 2px dashed #d9d9d9;

  > label {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    input {
      display: none;
    }
  }
`
const Shadow = styled.div`
  width: 100%;
  height: calc(100vh - 30px);
  opacity: 0.4;
  background-color: rgba(0, 0, 0);
  position: fixed;
  top: 30px;
  left: 0;
  font-size: 256px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`


const Upload: React.FC = () => {
    const history = useHistory()
    const {setFileList} = useContext(Context)
    const [isLoading, setIsLoading] = useState(false)
    const handleUpload = async (e: any) => {

        const payload = {
            videoName: e.dataTransfer?.files[0].name || e.target.files[0].name,
            videoPath: e.dataTransfer?.files[0].path || e.target.files[0].path
        }
        setIsLoading(true)

        const data = await ipcRenderer.invoke('upload-file', payload).catch(e => {
            console.log(e)
        })
        if (data) {

            setFileList(data.sublist.filter(((sub: any) => sub.surl)))
            history.push(`/${payload.videoName}/list`)
        }
        setIsLoading(false)
        e.target.value = null
    }
    return (
        <Layout>
            {isLoading && <Shadow><Icon name="loading"/></Shadow>}
            <UploadWrapper>
                <label onDrop={handleUpload} onDragOver={
                    (e) => {
                        e.preventDefault();
                    }
                }><Icon name="upload-video" className="upload-video"/>
                    <span>将视频拖拽至此，或点击选择</span>
                    <input type="file" onChange={
                        handleUpload
                    }/>
                </label>
            </UploadWrapper>


        </Layout>
    )
}
export default Upload;
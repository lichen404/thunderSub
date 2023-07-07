import React, {useContext, useState} from 'react';
import styled from "styled-components";

import {useNavigate} from "react-router-dom";
import {Context} from "../context";
import Icon from "../components/Icon";
import {handleOpenDB} from "../store";


const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;

`
const UploadWrapper = styled.div`
  min-width: 256px;
  height: 256px;
  width: 60%;
  border: 4px dashed #42424e;

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

    > span {
      margin-top: 8px;
    }
  }
`
const Shadow = styled.div`
  width: 100%;
  height: calc(100vh - 25px);
  background-color: #2c2a38;
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 2;
`

const SideBarShadow = styled.div`
  width: 200px;
  height: calc(100vh - 25px);
`


const Upload: React.FC = () => {
    const navigate = useNavigate()
    const {setFileList, isSidebarVisible} = useContext(Context)
    const [isLoading, setIsLoading] = useState(false)


    const handleUpload = async (e: any) => {

        const payload = {
            videoName: e.dataTransfer?.files[0].name || e.target.files[0].name,
            videoPath: e.dataTransfer?.files[0].path || e.target.files[0].path
        }
        setIsLoading(true)

        const data = await window.electron.ipcRenderer.invoke('upload-file', payload).catch(e => {
            console.log(e)
        })
        if (data) {
            setIsLoading(false)
            e.target.value = null
            setFileList(data.sublist.filter(((sub: any) => sub.surl)))
            navigate(`/${payload.videoName}/list`)
        }

    }
    return (

        <Wrapper>
            {isLoading && <Shadow><Icon name="loading" className="loading-icon"/></Shadow>}
            {isSidebarVisible && <SideBarShadow/>}
            <UploadWrapper>
                <label onDrop={handleUpload} onDragOver={
                    (e) => {
                        e.preventDefault();
                    }
                }><Icon name="upload-video" className="upload-video-icon"/>
                    <span>将视频文件拖拽至此，或点击选择</span>
                    <input type="file" onChange={
                        handleUpload
                    }/>
                </label>
            </UploadWrapper>
        </Wrapper>


    )
}
export default Upload;
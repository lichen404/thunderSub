import React, {useContext, useState} from 'react';
import styled from "styled-components";
import {ipcRenderer} from "electron";
import {useHistory} from "react-router-dom";
import {Context} from "../context";
import Icon from "../components/Icon";
import Layout from "../components/Layout";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex:1;

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
  height: calc(100vh - 30px);
  opacity: 0.4;
  background-color: rgba(0, 0, 0);
  position: fixed;
  top: 30px;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const SideBarShadow = styled.div`
  width: 200px;
  height: calc(100vh - 30px);
`


const Upload: React.FC = () => {
    const history = useHistory()
    const {setFileList,isSidebarVisible} = useContext(Context)
    const [isLoading, setIsLoading] = useState(false)
    console.log(isSidebarVisible)

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

        </Layout>
    )
}
export default Upload;
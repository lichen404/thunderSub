import React from 'react';
import styled from "styled-components";
import * as Console from "console";


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
    return (
        <>
            <div>upload</div>
            <UploadWrapper>
                <label onDrop={(e) => {

                    console.log(e.dataTransfer.files)
                }} onDragOver={
                    (e) => {
                        e.preventDefault();
                    }
                }>
                    <span>将文件拖拽至此，或点击上传</span>
                    <input type="file" onChange={(file) => {
                        console.log(file)
                    }}/>
                </label>
            </UploadWrapper>


        </>
    )
}
export default Upload;
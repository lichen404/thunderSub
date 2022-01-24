import React from 'react';
import styled from "styled-components";


const UploadWrapper = styled.div`
  width:128px;
  height: 128px;
  background: #999;
`




const Upload: React.FC = () => {
    return (
        <>
            <div>upload</div>
            <UploadWrapper>
                <label>
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
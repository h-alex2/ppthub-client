import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaArrowDown, FaRegWindowMinimize } from "react-icons/fa";

import axios from "axios";
import styled, { keyframes, css } from "styled-components";

import pptxParser from "../utils/pptxParser";
import { registerData } from "../features/pptDataReducer";
import { changeNextSequence } from "../features/sequenceReducer";
import useDragAndDrop from "../hooks/useDragAndDrop";
import useToast from "../hooks/useToast";
import TOAST_MESSAGES from "../config/constants/toastMessages";
import THEME_COLORS from "../config/constants/themeColors";
import CONFIG from "../config/constants/config";

function FileAttachment({ fileType }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dragAndDropRef = useRef(null);
  const [CustomToast, handleSendToast] = useToast(false);

  const handleFileChanged = async (event) => {
    const fileName = event.target.files[0].name.replace(".pptx", "");

    try {
      const pptData = await pptxParser(event.target.files[0]);
      const response = await axios.post(`${CONFIG.API_SERVER_URL}/ppts/save`, {
        pptData,
        fileName,
      });
      dispatch(
        registerData({ type: fileType, pptId: response.data, data: pptData }),
      );
      dispatch(changeNextSequence());
    } catch (error) {
      navigate("/error");
    }
  };

  const handleDragAndDropFileChanged = async (event) => {
    if (event.dataTransfer.files[0].name.substr(-4, 4) !== "pptx") {
      handleSendToast();
      return false;
    }

    try {
      const fileName = event.dataTransfer.files[0].name.replace(".pptx", "");
      const pptData = await pptxParser(event.dataTransfer.files[0]);
      const response = await axios.post(`${CONFIG.API_SERVER_URL}/ppts/save`, {
        pptData,
        fileName,
      });

      dispatch(
        registerData({ type: fileType, pptId: response.data, data: pptData }),
      );
    } catch (error) {
      navigate("/error");
    }

    return dispatch(changeNextSequence());
  };

  const isDragging = useDragAndDrop({
    onChange: handleDragAndDropFileChanged,
    dragAndDropRef,
  });

  return (
    <FileInputLabel ref={dragAndDropRef} isDragging={isDragging}>
      <IconContainer>
        <DownIcon />
        <LineIcon />
      </IconContainer>
      <FileInput
        type="file"
        accept=".pptx"
        onChange={(event) => handleFileChanged(event)}
      />
      <CustomToast message={TOAST_MESSAGES.INVALID_FILE_MESSAGE} />
    </FileInputLabel>
  );
}

const iconAnimation = keyframes`
  0% {
    transform: translateY(-10px);
  }
  50% {
    transform: translateY(-55px);
  }
  100% {
    transform: translateY(-10px);
  }
`;

const DownIcon = styled(FaArrowDown)`
  margin-top: 1rem;
  margin-bottom: -2rem;
  font-size: 5rem;
  fill: ${THEME_COLORS.MAIN_COLOR};
`;

const LineIcon = styled(FaRegWindowMinimize)`
  height: 4rem;
  width: 5rem;
  fill: ${THEME_COLORS.MAIN_COLOR};
`;

const FileInputLabel = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  cursor: pointer;

  ${DownIcon} {
    animation: ${({ isDragging }) =>
      isDragging &&
      css`
        ${iconAnimation} 1s ease infinite
      `};
  }
`;

const IconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  width: 30vw;
  height: 40vh;
  border: 2px dashed ${THEME_COLORS.MAIN_COLOR};
`;

const FileInput = styled.input`
  display: none;
`;

export default FileAttachment;

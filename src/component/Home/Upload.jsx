import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadData } from "aws-amplify/storage";
import { filesize } from "filesize";
import api from "../../api";
import { buildFilePath } from "../../constant";
import { ProgressBar } from "../../common/ProgressBar";
import "./Upload.css";

// File extension without the dot, for example "report.final.pdf" -> "pdf"
const getFileType = (fileName) => {
  const index = fileName.lastIndexOf(".");
  return index > 0 ? fileName.slice(index + 1).toLowerCase() : "";
};

function Upload(props) {
  const { user, genInfor, setGenInfor } = props;
  // Each item: { info: document information saved to DynamoDB, data: File }
  const [items, setItems] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const inputFile = useRef(null);
  const inputFolder = useRef(null);
  const navigate = useNavigate();

  const backPage = () => {
    navigate("/");
  };

  const handleSelectFiles = () => {
    inputFile.current.value = "";
    inputFile.current.click();
  };
  const handleSelectFolder = () => {
    inputFolder.current.value = "";
    inputFolder.current.click();
  };

  const onChangeFiles = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const existingNames = new Set(items.map((item) => item.info.file));
    const duplicateNames = [];
    const newItems = [];

    selectedFiles.forEach((file) => {
      if (file.name === ".DS_Store") return;
      // Files are saved as protected/{identityId}/{file name},
      // so two files with the same name would overwrite each other.
      if (existingNames.has(file.name)) {
        duplicateNames.push(file.name);
        return;
      }
      existingNames.add(file.name);

      const folder = file.webkitRelativePath
        ? file.webkitRelativePath.slice(0, -file.name.length)
        : "";
      newItems.push({
        info: {
          user_id: user.id,
          identityId: user.identityId,
          folder: folder,
          file: file.name,
          type: getFileType(file.name),
          size: file.size,
          tag: "",
        },
        data: file,
      });
    });

    if (duplicateNames.length !== 0) {
      alert(`These files have the same name as another selected file and were skipped:\n${duplicateNames.join("\n")}`);
    }
    setItems([...newItems, ...items]);
  };

  const setTagFile = (index, value) => {
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, info: { ...item.info, tag: value } } : item
      )
    );
  };

  const updateProgress = (fileInfo, percentage, status) => {
    setHistoryList([
      {
        id: 0,
        percentage: percentage,
        filename: fileInfo.file,
        filetype: fileInfo.type,
        filesize: fileInfo.size,
        status: status,
      },
    ]);
  };

  const handleUploadFiles = async (event) => {
    event.preventDefault();
    if (items.length === 0) {
      return;
    }
    let totalSizeFile = genInfor.size;
    let totalUploadedFiles = genInfor.amount;

    try {
      for (const item of items) {
        updateProgress(item.info, 0, "in-progress");

        // Upload the file to S3: protected/{identityId}/{file name}
        await uploadData({
          path: buildFilePath(user.identityId, item.info.file),
          data: item.data,
          options: {
            contentType: item.data.type || undefined,
            onProgress: ({ transferredBytes, totalBytes }) => {
              const percentage = totalBytes
                ? Math.round((transferredBytes / totalBytes) * 100)
                : 100;
              updateProgress(item.info, percentage, percentage === 100 ? "success" : "in-progress");
            },
          },
        }).result;

        // Write document information to DynamoDB
        await api.post("/docs", item.info);

        totalSizeFile += item.info.size;
        totalUploadedFiles += 1;
      }
    } catch (error) {
      console.log(error);
      alert("Error occurred while uploading the documents");
    }

    // When you finish uploading, all items should be removed from the upload list
    setItems([]);
    setGenInfor({
      size: totalSizeFile,
      amount: totalUploadedFiles,
    });
    setTimeout(() => {
      setHistoryList([]);
    }, 3000);
  };

  const List = ({ list }) => (
    <>
      {list.map((item) => (
        <ProgressBar
          animated
          key={item.id}
          status={item.status}
          percentage={item.percentage}
          additionalInfo={item.filesize}
          description={item.filetype}
          label={item.filename}
        />
      ))}
    </>
  );

  return (
    <div className="upload-body">
      <List list={historyList} />
      <div className="title content-header">Upload files</div>
      <div className="content-body">
        <button
          type="button"
          className="btn btn-gray text-normal"
          onClick={handleSelectFolder}
        >
          Add folder
        </button>
        <input
          type="file"
          style={{ display: "none" }}
          webkitdirectory="true"
          mozdirectory="true"
          directory=""
          ref={inputFolder}
          onChange={onChangeFiles}
        />
        &nbsp;&nbsp;
        <input
          id="myInput"
          type="file"
          ref={inputFile}
          style={{ display: "none" }}
          onChange={onChangeFiles}
          multiple
        />
        <button
          type="button"
          className="btn btn-gray text-normal"
          onClick={handleSelectFiles}
        >
          Add files
        </button>
        &nbsp;
        <div className="upload-content">
          <div className="mt-4 pt-25">
            <div className="table-title">
              <div className="row-custome text-normal text-black pt-70 pb-70">
                <div className="col-3">Name</div>
                <div className="col-3 bleft">Folder</div>
                <div className="col-2 bleft">Size</div>
                <div className="col bleft">Tag</div>
              </div>
            </div>

            <div className="document-table">
              {items.length !== 0 &&
                items.map((item, index) => {
                  return (
                    <div
                      className="row-custome table-body text-normal pt-25 pb-25 mt-2"
                      key={item.info.file}
                    >
                      <div className="col-3 hidden-long">{item.info.file}</div>
                      <div className="col-3 hidden-long">{item.info.folder}</div>
                      <div className="col-2">{filesize(item.info.size, { standard: "jedec" })}</div>
                      <div className="col">
                        <input
                          type="text"
                          className="text-normal text-line"
                          value={item.info.tag}
                          onChange={(e) => setTagFile(index, e.target.value)}
                        ></input>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      <div className="content-footer">
        <button
          type="button"
          className="btn btn-cancel text-normal"
          onClick={backPage}
        >
          Cancel
        </button>
        &nbsp;&nbsp;
        <button
          type="button"
          className="btn btn-blue text-normal"
          onClick={handleUploadFiles}
        >
          Upload
        </button>
      </div>
    </div>
  );
}

export default Upload;

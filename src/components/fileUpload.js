import React from "react";
import "react-dropzone-uploader/dist/styles.css";
import Dropzone from "react-dropzone-uploader";
import { getDroppedOrSelectedFiles } from "html5-file-selector";
import axios from "axios";

class FileUpload extends React.Component {
  constructor() {
    super();
    this.state = {
      formData: new FormData(),
      isFileAvailable: false,
      fileIdentity: "No file Submitted",
      file: null,
    };
  }

  fileParams = ({ meta }) => {
    return { url: "https://httpbin.org/post" };
  };

  onFileChange = async ({ meta, file }, status) => {
    console.table({ meta, file, status });
  };

  onSubmit = async (files, allFiles) => {
    this.state.formData.append("photo", allFiles[0]);

    await axios
      .post("http://localhost:5000/documents/identify", this.state.formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((data) => {
        if (data.data.passport) {
          this.setState({
            file: allFiles[0],
            fileIdentity: "Passport",
            isFileAvailable: true,
          });
        } else if (data.data.national_id) {
          this.setState({
            file: allFiles[0],
            fileIdentity: "National Id",
            isFileAvailable: true,
          });
        } else {
          this.setState({
            file: allFiles[0],
            fileIdentity: "error",
            isFileAvailable: true,
          });
        }
      })
      .catch((err) => {
        this.setState({
          file: null,
          fileIdentity: "error",
          isFileAvailable: true,
        });
        console.error(err);
      });
  };

  getFilesFromEvent = (e) => {
    return new Promise((resolve) => {
      getDroppedOrSelectedFiles(e).then((chosenFiles) => {
        resolve(chosenFiles.map((f) => f.fileObject));
      });
    });
  };

  selectFileInput = ({ accept, onFiles, files, getFilesFromEvent }) => {
    const textMsg = files.length > 0 ? "Upload Again" : "Select Files";

    return (
      <label className="btn btn-danger mt-4">
        {textMsg}
        <input
          style={{ display: "none" }}
          type="file"
          accept={accept}
          multiple
          name="photo"
          onChange={(e) => {
            getFilesFromEvent(e).then((chosenFiles) => {
              onFiles(chosenFiles);
            });
          }}
        />
      </label>
    );
  };

  render() {
    return (
      <>
        <Dropzone
          onSubmit={this.onSubmit}
          onChangeStatus={this.onFileChange}
          InputComponent={this.selectFileInput}
          getUploadParams={this.fileParams}
          getFilesFromEvent={this.getFilesFromEvent}
          accept="image/*"
          maxFiles={1}
          inputContent="Drop A File"
          styles={{
            dropzone: { width: 400, height: 200 },
            dropzoneActive: { borderColor: "blue" },
          }}
        />
        <div className="container">
          <div className="row">
            <div className="col-4"></div>
            <div className="col-4">
              <div className="image-rounded h-50">
                <p className="text-muted">{this.state.fileIdentity}</p>
              </div>
            </div>
            <div className="col-4"></div>
          </div>
        </div>
      </>
    );
  }
}

export default FileUpload;

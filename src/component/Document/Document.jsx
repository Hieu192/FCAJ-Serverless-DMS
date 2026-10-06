import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { remove } from "aws-amplify/storage";
import api, { calculateGeneralInfor } from "../../api";
import { resolveFilePath } from "../../constant";
import DocumentTable from "./DocumentTable";

// Search results from OpenSearch keep the DynamoDB attribute format,
// for example { file: { S: "a.pdf" }, size: { N: "1024" } }.
// Convert them to the same format as the document list.
const fromSearchHit = (hit) => {
  const source = hit._source || {};
  const value = (attribute) =>
    attribute ? attribute.S ?? attribute.N ?? "" : "";
  return {
    user_id: value(source.user_id),
    identityId: value(source.identityId),
    file: value(source.file),
    folder: value(source.folder),
    modified: value(source.modified),
    type: value(source.type),
    size: Number(value(source.size)) || 0,
    tag: value(source.tag),
    path: value(source.path),
  };
};

function Document(props) {
  const { user, setGenInfor } = props;
  const [docs, setDocs] = useState([]);
  const [mod, setMod] = useState(0); // 1 is selecting mode, other values are normal mode
  const [deleteList, setDeleteList] = useState([]);
  const navigate = useNavigate();
  const deleteEl = useRef(null);
  const selectEl = useRef(null);
  const timer = useRef(null);
  const fieldTrans = {
    name: "file.S",
    tag: "tag.S",
    type: "type.S",
  };
  const [keyword, setKeyword] = useState("");
  const [attribute, setAttribute] = useState("name");
  const [searchResult, setSearchResult] = useState([]);
  const [searchMessage, setSearchMessage] = useState("Files not found");

  const loadDocs = useCallback(() => {
    api
      .get(`/docs/${user.id}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setDocs(list);
        setGenInfor(calculateGeneralInfor(list));
      })
      .catch((err) => {
        console.log("Cannot load the document list: ", err);
      });
  }, [user.id, setGenInfor]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const redirectPage = () => {
    navigate("/upload");
  };

  async function search(key) {
    const params = {
      key: key,
      field: fieldTrans[attribute],
    };
    try {
      // Search document follow attribute
      const response = await api.get(`/docs/${user.id}/search`, { params });
      const hits = response.data?.hits?.hits || [];
      setSearchMessage("Files not found");
      setSearchResult(hits.map(fromSearchHit));
    } catch (error) {
      console.log("Search fail: ", error);
      setSearchMessage("Search is not available. Please check the search API.");
      setSearchResult([]);
    }
  }

  useEffect(() => {
    if (keyword) {
      search(keyword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attribute]);

  const searchDocs = (event) => {
    clearTimeout(timer.current);
    const value = event.target.value;
    setKeyword(value);
    if (value) {
      timer.current = setTimeout(() => search(value), 250);
    }
  };

  useEffect(() => {
    if (mod === 1) {
      selectEl.current.classList.add("non-active");
      deleteEl.current.classList.remove("non-active");
    }
    if (mod === 2) {
      deleteEl.current.classList.add("non-active");
      selectEl.current.classList.remove("non-active");
    }
  }, [mod]);

  const checkedDoc = (doc, event) => {
    const isChecked = event.target.checked;
    setDeleteList((currentList) =>
      isChecked
        ? [...currentList.filter((item) => item.file !== doc.file), doc]
        : currentList.filter((item) => item.file !== doc.file)
    );
  };

  const navigateToDetailPage = (docItem) => {
    if (mod === 1) return;
    navigate(`detail/${encodeURIComponent(docItem.file)}`, { state: docItem });
  };

  const deleteDocs = async (e) => {
    e.preventDefault();
    if (deleteList.length === 0) return;
    if (window.confirm("Are you sure you wish to delete these files?")) {
      await onConfirm();
    }
  };

  const onConfirm = async () => {
    for (const doc of deleteList) {
      try {
        await remove({
          path: resolveFilePath(doc.file, doc.path, user.identityId),
        });

        await api.delete(`/docs/${user.id}`, {
          params: {
            file: doc.file,
          },
        });
      } catch (error) {
        console.log(error);
        alert("Error occurred while deleting the documents");
        break;
      }
    }

    setDeleteList([]);
    setMod(2);
    loadDocs();
    if (keyword) search(keyword);
  };

  return (
    <div className="upload-body">
      <div className="title content-header">My Document</div>
      <div className="content-body">
        <div className="row" ref={selectEl}>
          <div className="col">
            <input
              className="text-normal"
              placeholder="Search..."
              onKeyUp={searchDocs}
            ></input>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ width: "10%" }}
            ></i>
            <div className="row pt-2">
              <div className="col-5">
                <div className="attribute-item">
                  <input
                    className="check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="name"
                    value="Name"
                    defaultChecked
                    onChange={(e) => setAttribute(e.target.id)}
                  />
                  &nbsp;&nbsp;
                  <label className="text-normal">Name</label>
                </div>
                <div className="attribute-item">
                  <input
                    className="check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="type"
                    value="Type"
                    onChange={(e) => setAttribute(e.target.id)}
                  />
                  &nbsp;&nbsp;
                  <label className="text-normal">Type</label>
                </div>
              </div>
              <div className="col-5">
                <div className="attribute-item">
                  <input
                    className="check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="tag"
                    value="Tag"
                    onChange={(e) => setAttribute(e.target.id)}
                  />
                  &nbsp;&nbsp;
                  <label className="text-normal">Tag</label>
                </div>
              </div>
            </div>
          </div>
          <div className="col" style={{ textAlign: "right" }}>
            <button
              type="button"
              className="btn btn-gray text-normal"
              onClick={redirectPage}
            >
              <i className="fa-solid fa-upload icon-sm" aria-hidden="true"></i>
              &nbsp;Upload
            </button>
            &nbsp;&nbsp;
            <button
              type="button"
              className="btn btn-outline-secondary btn-gray text-normal"
              onClick={() => setMod(1)}
            >
              <i className="fa-solid fa-arrow-pointer"></i>
              &nbsp;Select
            </button>
          </div>
        </div>
        <div className="mod-delete non-active" ref={deleteEl}>
          <button
            type="button"
            className="btn btn-outline-secondary btn-gray text-normal"
            onClick={deleteDocs}
          >
            <i className="fa-solid fa-trash"></i>
            &nbsp;Delete
          </button>
          &nbsp;&nbsp;
          <button
            type="button"
            className="btn btn-outline-secondary btn-gray text-normal"
            onClick={() => {
              setDeleteList([]);
              setMod(2);
            }}
          >
            <i className="fa-sharp fa-regular fa-circle-check"></i>
            &nbsp;Done
          </button>
        </div>
        <DocumentTable
          data={keyword ? searchResult : docs}
          user={user}
          mod={mod}
          message={keyword ? searchMessage : "No file exists"}
          deleteList={deleteList}
          checkedDoc={checkedDoc}
          navigateToDetailPage={navigateToDetailPage}
        ></DocumentTable>
      </div>
    </div>
  );
}

export default Document;

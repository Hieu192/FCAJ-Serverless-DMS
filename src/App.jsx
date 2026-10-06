import { useRef, useState, useEffect, useCallback } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";
import Menu from "./component/Menu/Menu";
import Start from "./component/Home/Start";
import Home from "./component/Home/Home";
import Login from "./component/Authen/Login";
import Logout from "./component/Authen/Logout";
import Register from "./component/Authen/Register";
import Upload from "./component/Home/Upload";
import MyProfile from "./component/Profile/MyProfile";
import UpdateProfile from "./component/Profile/UpdateProfile";
import Document from "./component/Document/Document";
import DocumentDetail from "./component/Document/DocumentDetail";

// Read the signed-in user from the current Amplify session.
// - id         : Cognito user `sub`, used as `user_id` in DynamoDB
// - identityId : Cognito identity ID, used in the S3 path protected/{identityId}/
// - username   : display name (preferred_username), or the email
export async function loadCurrentUser() {
  const session = await fetchAuthSession();
  const payload = session.tokens?.idToken?.payload;
  if (!payload) return null;
  return {
    id: payload.sub,
    identityId: session.identityId,
    email: payload.email,
    username: payload.preferred_username || payload.email,
  };
}

function App() {
  // Get element menu-toggle and col-menu
  const menu_toggle = useRef(null);
  const col_menu = useRef(null);
  // to check close or open menu
  const [isCheckMenuItem, setIsCheckMenuItem] = useState(false);

  const [genInfor, setGenInfor] = useState({
    size: 0,
    amount: 0,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [checkAuthen, setCheckAuthen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const user = await loadCurrentUser();
      setCurrentUser(user);
      setCheckAuthen(Boolean(user));
    } catch (error) {
      console.log(error);
      setCurrentUser(null);
      setCheckAuthen(false);
    }
  }, []);

  // Check if user logged or not
  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  // Responsive
  // Remove active class to close menu after select
  useEffect(() => {
    if (isCheckMenuItem) {
      menu_toggle.current.classList.remove("is-active");
      col_menu.current.classList.remove("is-active");
      setIsCheckMenuItem(false);
    }
  }, [isCheckMenuItem]);

  // Open menu when click hamb
  function openMenu() {
    menu_toggle.current.classList.toggle("is-active");
    col_menu.current.classList.toggle("is-active");
  }

  if (isLoading) {
    return <div className="App" />;
  }

  return (
    <div className="App">
      {!checkAuthen && (
        <Router>
          <Routes>
            <Route path="/" element={<Start />}></Route>
            <Route
              path="/signin"
              element={<Login refreshUser={refreshUser} />}
            ></Route>
            <Route path="/signup" element={<Register />}></Route>
            <Route path="*" element={<Start />}></Route>
          </Routes>
        </Router>
      )}
      {checkAuthen && currentUser && (
        <Router>
          <div
            className="menu-toggle"
            ref={menu_toggle}
            onClick={() => openMenu()}
          >
            <div className="hamburger">
              <span></span>
            </div>
          </div>
          <div className="col-menu" ref={col_menu}>
            <Menu setIsCheckMenuItem={setIsCheckMenuItem} />
          </div>
          <div className="col-content">
            <Routes>
              <Route path="/" element={<Home user={currentUser} setGenInfor={setGenInfor} genInfor={genInfor} />}></Route>
              <Route path="/upload" element={<Upload user={currentUser} genInfor={genInfor} setGenInfor={setGenInfor} />}></Route>
              <Route path="/profile" element={<MyProfile user={currentUser} genInfor={genInfor} />}></Route>
              <Route path="/logout" element={<Logout setCheckAuthen={setCheckAuthen} setCurrentUser={setCurrentUser} />}></Route>
              <Route path="/profile/update" element={<UpdateProfile refreshUser={refreshUser} />}></Route>
              <Route path="/document" element={<Document user={currentUser} genInfor={genInfor} setGenInfor={setGenInfor} />}></Route>
              <Route
                path="/document/detail/:name"
                element={<DocumentDetail user={currentUser} />}
              ></Route>
              <Route path="*" element={<Home user={currentUser} setGenInfor={setGenInfor} genInfor={genInfor} />}></Route>
            </Routes>
          </div>
        </Router>
      )}
    </div>
  );
}

export default App;

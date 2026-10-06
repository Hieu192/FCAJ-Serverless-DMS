import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { signOut } from "aws-amplify/auth";

function Logout(props) {
  const { setCheckAuthen, setCurrentUser } = props;
  const navigate = useNavigate();

  useEffect(() => {
    async function handleSignOut() {
      try {
        await signOut();
      } catch (error) {
        console.log("Sign out fail: ", error);
      }
      setCurrentUser(null);
      setCheckAuthen(false);
      navigate("/");
    }
    handleSignOut();
  }, [navigate, setCheckAuthen, setCurrentUser]);

  return null;
}

export default Logout;

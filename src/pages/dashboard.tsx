import axios from "axios";

const dashboard = () => {
  const logoutService = async () => {
    try {
      await axios.post(
        import.meta.env.VITE_API_URL + "/auth/logout",
        {},
        { withCredentials: true }
      );
      // Redirect to login page
      window.location.replace("/");
    } catch (error) {
      console.error("Error logging out");
    }
  };
  return <div onClick={logoutService}>dashboard</div>;
};

export default dashboard;

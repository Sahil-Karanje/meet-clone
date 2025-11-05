import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.name || "Guest";

  const handleCreateMeeting = () => {
    console.log("clicked");
    const newRoomId = crypto.randomUUID();
    navigate(`/room/${newRoomId}`, { state: { username } });
  };

  const validationSchema = Yup.object({
    roomId: Yup.string().required("Room ID is required"),
  });

  const formik = useFormik({
    initialValues: { roomId: "" },
    validationSchema,
    onSubmit: (values) => {
      navigate(`/room/${values.roomId}`, { state: { username } });
    },
  });

  return (
    <Box className="home-container">
      <Paper elevation={3} className="home-paper">
        <Typography variant="h5" gutterBottom style={{ color: "#9486bd" }}>
          Join a Meeting
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            value={username}
            disabled
          />
          <TextField
            fullWidth
            margin="normal"
            id="roomId"
            name="roomId"
            label="Room ID"
            value={formik.values.roomId}
            onChange={formik.handleChange}
            error={formik.touched.roomId && Boolean(formik.errors.roomId)}
            helperText={formik.touched.roomId && formik.errors.roomId}
          />
          <Button color="primary" variant="contained" fullWidth type="submit">
            Join Room
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => { handleCreateMeeting() }}
            style={{ marginTop: "1rem", backgroundColor: "#6b8c3b", color: "white" }}
          >
            Create Meeting
          </Button>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            style={{ marginTop: "1rem", backgroundColor: "#FF0000", color: "white" }}
          >
            Logout
          </Button>
        </form>
      </Paper>

    </Box>
  );
};

export default Home;

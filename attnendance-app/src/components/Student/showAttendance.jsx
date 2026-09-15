
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  Box,
  LinearProgress,
  Chip,
  TextField,
  Button,
} from "@mui/material";
import { apiFetch } from "../api";

export default function ShowAttendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem("email");

  const [attendanceData, setAttendanceData] = useState({
    student: {
      name: "",
      email: "",
      dep :"",
      u_roll: "",
      c_roll: "",
      year: "",
      sem: "",
    },
    subjects: [],
  });

  const [target, setTarget] = useState(75);

  useEffect(() => {
    apiFetch(`/student_attendance/${email}`)
      .then((data) => setAttendanceData(data))
      .catch((err) => console.error(err));
  }, [email]);

  const calculateOverallPercentage = () => {
    if (!attendanceData.subjects || attendanceData.subjects.length === 0)
      return 0;

    let totalClasses = 0;
    let attendedClasses = 0;

    attendanceData.subjects.forEach((subj) => {
      totalClasses += subj.total_classes;
      attendedClasses += subj.attended_classes;
    });

    if (totalClasses === 0) return 0;
    return ((attendedClasses / totalClasses) * 100).toFixed(2);
  };

  const calculateNeededClasses = (attended, total, target) => {
    let required = 0;
    if (total === 0) return "-";
    while (((attended + required) / (total + required)) * 100 < target) {
      required++;
      if (required > 1000) break; // safety
    }
    return required === 0 ? "On Track" : `${required} more`;
  };

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // change to "/" if you want home page
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      {/* ✅ Page Header with Logout */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          color="primary"
        >
          Student Attendance
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* ✅ Student Info Card */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
            Student Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ lineHeight: 2 }}>
            <Typography><strong>Name:</strong> {attendanceData.student.name}</Typography>
            <Typography><strong>Email:</strong> {attendanceData.student.email}</Typography>
            <Typography><strong>Department:</strong> {attendanceData.student.dep}</Typography>
            <Typography><strong>University Roll:</strong> {attendanceData.student.u_roll}</Typography>
            <Typography><strong>Class Roll:</strong> {attendanceData.student.c_roll}</Typography>
            <Typography><strong>Year:</strong> {attendanceData.student.year}</Typography>
            <Typography><strong>Semester:</strong> {attendanceData.student.sem}</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* ✅ Attendance Table */}
      <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
        Subject-wise Attendance
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.200" }}>
              <TableCell><strong>Subject</strong></TableCell>
              <TableCell align="center"><strong>Total Classes</strong></TableCell>
              <TableCell align="center"><strong>Attended</strong></TableCell>
              <TableCell align="center"><strong>Progress</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceData.subjects.map((subj, idx) => {
              const isLow = subj.attendance_percentage < 75;
              return (
                <TableRow key={idx} hover>
                  <TableCell>{subj.sub}</TableCell>
                  <TableCell align="center">{subj.total_classes}</TableCell>
                  <TableCell align="center">{subj.attended_classes}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={subj.attendance_percentage}
                          sx={{
                            height: 8,
                            borderRadius: 5,
                            bgcolor: "grey.300",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: isLow ? "error.main" : "success.main",
                            },
                          }}
                        />
                      </Box>
                      <Chip
                        label={`${subj.attendance_percentage}%`}
                        color={isLow ? "error" : "success"}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✅ Overall Attendance */}
      <Card
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: "primary.main",
          borderRadius: 3,
          boxShadow: 4,
          textAlign: "center",
          color: "white",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Overall Attendance: {calculateOverallPercentage()}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={calculateOverallPercentage()}
          sx={{
            mt: 2,
            height: 10,
            borderRadius: 5,
            bgcolor: "rgba(255,255,255,0.2)",
            "& .MuiLinearProgress-bar": {
              bgcolor: "white",
            },
          }}
        />
      </Card>

      {/* ✅ Target Attendance Planner */}
      <Card sx={{ mt: 5, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
            🎯 Target Attendance Planner
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TextField
            label="Set Target %"
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            InputProps={{ inputProps: { min: 1, max: 100 } }}
            sx={{ mb: 3, width: 150 }}
          />

          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.100" }}>
                  <TableCell><strong>Subject</strong></TableCell>
                  <TableCell align="center"><strong>Current %</strong></TableCell>
                  <TableCell align="center"><strong>Need to Attend</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.subjects.map((subj, idx) => {
                  const need = calculateNeededClasses(
                    subj.attended_classes,
                    subj.total_classes,
                    target
                  );
                  return (
                    <TableRow key={idx} hover>
                      <TableCell>{subj.sub}</TableCell>
                      <TableCell align="center">
                        {subj.attendance_percentage}%
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={need}
                          color={need === "On Track" ? "success" : "error"}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}

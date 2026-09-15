

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  TextField,
  Box,
  CircularProgress
} from "@mui/material";

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;
  const sem = data?.semester;
  const did = Number(data?.department);

  useEffect(() => {
    if (did && sem) {
      setLoading(true);
      apiFetch(`/student_list/${did}/${sem}`)
        .then((res) => setStudents(res))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [did, sem]);

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    if (!date) {
      alert("Please select a date");
      return;
    }

    const statusMap = { P: "Present", A: "Absent", L: "Late" };

    const requests = students
      .filter((s) => attendance[s.id])
      .map((s) =>
        apiFetch("/attendance/", "POST", {
          Sub_id: Number(data.subject),
          Sid: Number(s.id),
          Tid: data.id,
          date: date,
          status: statusMap[attendance[s.id]]
        })
      );

    try {
      await Promise.all(requests);
      // alert("Attendance submitted successfully!");
      navigate("/teacher/details")
    } catch (err) {
      console.error(err);
      alert("Error submitting attendance");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
        {/* 🔹 Header with Logout Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            📋 Attendance
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Logout
          </Button>
        </Box>

        {data ? (
          <>
            {/* 🔹 Date Picker */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap"
              }}
            >
              <TextField
                type="date"
                label="Select Date"
                InputLabelProps={{ shrink: true }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={{ minWidth: 200 }}
              />
            </Box>

            {/* 🔹 Loading State */}
            {loading ? (
              <CircularProgress />
            ) : students.length > 0 ? (
              <>
                {/* 🔹 Students Table */}
                <TableContainer
                  component={Paper}
                  sx={{
                    maxHeight: 500,
                    borderRadius: 2,
                    border: "1px solid #ddd"
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          University Roll
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Class Roll
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Semester
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student, index) => (
                        <TableRow
                          key={student.id}
                          sx={{
                            backgroundColor:
                              index % 2 === 0 ? "#fafafa" : "white"
                          }}
                        >
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.u_roll}</TableCell>
                          <TableCell>{student.c_roll}</TableCell>
                          <TableCell>{student.sem}</TableCell>
                          <TableCell>
                            <RadioGroup
                              row
                              value={attendance[student.id] || ""}
                              onChange={(e) =>
                                handleStatusChange(student.id, e.target.value)
                              }
                            >
                              <FormControlLabel
                                value="P"
                                control={<Radio color="success" />}
                                label="P"
                              />
                              <FormControlLabel
                                value="A"
                                control={<Radio color="error" />}
                                label="A"
                              />
                              <FormControlLabel
                                value="L"
                                control={<Radio color="warning" />}
                                label="L"
                              />
                            </RadioGroup>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* 🔹 Submit Button */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{
                      px: 4,
                      py: 1,
                      fontSize: "1rem",
                      fontWeight: "bold",
                      borderRadius: 2
                    }}
                  >
                    ✅ Submit Attendance
                  </Button>
                </Box>
              </>
            ) : (
              <Typography variant="body1">No students found.</Typography>
            )}
          </>
        ) : (
          <Typography variant="body1">No data received</Typography>
        )}
      </Paper>
    </Container>
  );
}

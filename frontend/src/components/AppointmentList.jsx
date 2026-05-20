const filterAppointments = (appointments) => {
  const now = new Date();

  return appointments.filter((appt) => {
    const apptTime = new Date(`${appt.date}T${appt.endTime}`);
    return apptTime >= now;
  });
};
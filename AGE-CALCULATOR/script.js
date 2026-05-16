const ageForm = document.getElementById("ageForm");
const dayInput = document.getElementById("day");
const monthInput = document.getElementById("month");
const yearInput = document.getElementById("year");
const yearsEl = document.getElementById("years");
const monthsEl = document.getElementById("months");
const daysEl = document.getElementById("days");
const errorMessageEl = document.getElementById("errorMessage");

ageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const day = Number.parseInt(dayInput.value, 10);
  const month = Number.parseInt(monthInput.value, 10);
  const year = Number.parseInt(yearInput.value, 10);

  if (!isValidInput(day, month, year)) {
    return;
  }

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birthDate > today) {
    showError("Date of birth cannot be in the future.");
    return;
  }

  const age = calculateAge(birthDate, today);
  yearsEl.textContent = String(age.years);
  monthsEl.textContent = String(age.months);
  daysEl.textContent = String(age.days);
});

function isValidInput(day, month, year) {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    showError("Please enter day, month, and year.");
    return false;
  }

  if (year < 1900) {
    showError("Year must be 1900 or later.");
    return false;
  }

  if (month < 1 || month > 12) {
    showError("Month must be between 1 and 12.");
    return false;
  }

  const maxDay = getDaysInMonth(year, month);
  if (day < 1 || day > maxDay) {
    showError(`Day must be between 1 and ${maxDay} for the selected month.`);
    return false;
  }

  return true;
}

function calculateAge(birthDate, currentDate) {
  let years = currentDate.getFullYear() - birthDate.getFullYear();
  let months = currentDate.getMonth() - birthDate.getMonth();
  let days = currentDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = currentDate.getMonth() === 0 ? 12 : currentDate.getMonth();
    const previousMonthYear =
      currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
    days += getDaysInMonth(previousMonthYear, previousMonth);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function showError(message) {
  errorMessageEl.textContent = message;
}

function clearError() {
  errorMessageEl.textContent = "";
}

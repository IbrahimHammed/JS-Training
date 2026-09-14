const username = document.getElementById("username");
const password = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");

const userError = document.getElementById("userError");
const passError = document.getElementById("passError");

const togglePassword = document.getElementById("togglePassword");
const themeSwitch = document.getElementById("themeSwitch");

// Enable button only when both fields have values
function validateForm() {
    const userValid = username.value.trim() !== "";
    const passValid = password.value.trim() !== "";

    signInBtn.disabled = !(userValid && passValid);

    userError.classList.toggle("show", !userValid && username.value.length > 0);
    passError.classList.toggle("show", !passValid && password.value.length > 0);
}

username.addEventListener("input", validateForm);
password.addEventListener("input", validateForm);

// Show/Hide password
togglePassword.addEventListener("click", () => {
    const type = password.type === "password" ? "text" : "password";
    password.type = type;
    togglePassword.textContent = type === "password" ? "Show" : "Hide";
});

// Dark mode toggle
themeSwitch.addEventListener("change", () => {
    document.body.classList.toggle("dark", themeSwitch.checked);
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", (event) => {
        const password = document.getElementById("password").value;
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

        if (!passwordPattern.test(password)) {
            event.preventDefault(); // Prevent form submission
            alert("Password must be 8-16 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
        }
    });
});

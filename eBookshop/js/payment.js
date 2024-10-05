// Listens for the full HTML document to load before executing the functions
document.addEventListener('DOMContentLoaded', function() {
    populateDateFields();  // Calls function to populate the date fields on the form
    document.getElementById('cardNumber').addEventListener('keypress', allowOnlyNumbers); // Adds an event listener to ensure only numbers are entered in the card number field
    document.getElementById('cvv').addEventListener('keypress', allowOnlyNumbers); // Adds an event listener to ensure only numbers are entered in the CVV field
    document.getElementById('paymentForm').addEventListener('submit', validateAndSubmit); // Adds an event listener to handle form submission
});

// Function to populate the expiry month and year select fields dynamically
function populateDateFields() {
    const monthSelect = document.getElementById('expiryMonth');
    const yearSelect = document.getElementById('expiryYear');
    const currentYear = new Date().getFullYear(); // Gets the current year
    const endYear = currentYear + 20; // Sets the end year for the credit card validity

    monthSelect.innerHTML = ''; // Clears the month select
    yearSelect.innerHTML = ''; // Clears the year select

    // Populates the month select with options
    for (let i = 1; i <= 12; i++) {
        monthSelect.appendChild(new Option(i < 10 ? '0' + i : i, i));
    }
    // Populates the year select with options from the current year to the current year + 20
    for (let i = currentYear; i <= endYear; i++) {
        yearSelect.appendChild(new Option(i, i));
    }
}

// Function to prevent any non-numeric characters from being entered into input fields for card number and CVV
function allowOnlyNumbers(event) {
    if (!/[0-9]/.test(event.key)) {
        event.preventDefault(); // Prevents the default action if the key pressed is not a number
    }
}

// Function to validate and submit the payment form
function validateAndSubmit(event) {
    event.preventDefault(); // Prevents the form from submitting normally
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s+/g, ''); // Removes any spaces from the card number
    const expiryMonth = document.getElementById('expiryMonth').value;
    const expiryYear = document.getElementById('expiryYear').value;
    const cvv = document.getElementById('cvv').value;

    // Validates the MasterCard number format
    if (!/^(5[1-5][0-9]{14})$/.test(cardNumber)) {
        document.getElementById('message').textContent = 'Invalid MasterCard number, please confirm Card Numbers and type again.';
        return;
    }
    // Checks if the card is expired
    if (expiryYear < new Date().getFullYear() || (expiryYear == new Date().getFullYear() && expiryMonth < new Date().getMonth() + 1)) {
        document.getElementById('message').textContent = 'Credit card is expired, please check your card details and type again.';
        return;
    }
    // Validates the CVV to ensure it is 3 or 4 digits long
    if (!/^\d{3,4}$/.test(cvv)) {
        document.getElementById('message').textContent = 'Invalid CVV.';
        return;
    }

    // Sends a POST request with the card details to the server
    fetch('http://mudfoot.doc.stu.mmu.ac.uk/node/api/creditcard', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ master_card: cardNumber, exp_year: expiryYear, exp_month: expiryMonth, cvv_code: cvv })
    }).then(response => {
        if (!response.ok) throw new Error('Response not OK'); // Checks if the HTTP response status is not OK
        return response.json(); // Parses the JSON response from the server
    })
    .then(data => {
        if (data && data.message) { // If there is a message in the response
            window.location.href = `success.html?cardNumber=${cardNumber.slice(-4)}`; // Redirects to the success page with the last four digits of the card number
        } else {
            document.getElementById('message').textContent = 'Error processing payment'; // Displays an error message if there is no message in the response
        }
    })  
    .catch(error => {
        document.getElementById('message').textContent = error.message; // Displays an error message if the fetch request fails
    });
}

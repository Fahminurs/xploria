// Initialize EmailJS with your public key
(function() {
    emailjs.init({
        publicKey: "1TYzbZ67kFLMI0z_d"
    });
})();

/*
 * Previous Version (v1.0)
 * This version includes form validation and more detailed error handling
 * Kept for reference and potential future use
 */
 
/* Version 1.0 Code Start
(function() {
    // Initialize EmailJS with your public key
    emailjs.init("4AqtSma3LGPbGNRzy"); // Your public key

    // Get form elements
    const contactForm = document.getElementById('contact-form');
    const submitButton = document.getElementById('submit-btn');
    const formContainerElement = document.getElementById('form-container');
    const successMessageElement = document.getElementById('form-success');

    // Form validation
    function validateForm() {
        let isValid = true;
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Reset error messages
        document.querySelectorAll('.form-error').forEach(error => error.textContent = '');

        // Name validation
        if (name === '') {
            document.getElementById('name-error').textContent = 'Name is required';
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email === '') {
            document.getElementById('email-error').textContent = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            document.getElementById('email-error').textContent = 'Please enter a valid email';
            isValid = false;
        }

        // Message validation
        if (message === '') {
            document.getElementById('message-error').textContent = 'Message is required';
            isValid = false;
        }

        return isValid;
    }

    // Handle form submission
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            // Disable submit button and show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            try {
                // Prepare template parameters
                const templateParams = {
                    to_name: 'Admin', // The recipient's name
                    from_name: document.getElementById('name').value,
                    from_email: document.getElementById('email').value,
                    message: document.getElementById('message').value,
                    reply_to: document.getElementById('email').value, // This ensures replies go to the sender
                };

                // Send email using EmailJS
                await emailjs.send(
                    'service_io72edn', // Your service ID
                    'template_rfjqjb9', // Your template ID
                    templateParams
                );

                // Show success message
                formContainerElement.style.display = 'none';
                successMessageElement.style.display = 'block';
            } catch (error) {
                console.error('Error sending email:', error);
                alert('Failed to send message. Please try again later.');
            } finally {
                // Reset submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }
        });
    }
})();
Version 1.0 Code End */

/*
 * Previous Version (v2.0)
 * Simplified implementation with basic error handling
 */
 
/* Version 2.0 Code Start
function sendMail() {
    // Get form values
    var params = {
        from_name: document.getElementById("name").value,
        from_email: document.getElementById("email").value,
        message: document.getElementById("message").value,
        reply_to: document.getElementById("email").value
    };

    const serviceID = "service_g12z5uf";
    const templateID = "template_lvau7oc";

    // Show loading state
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    emailjs
        .send(serviceID, templateID, params)
        .then((res) => {
            // Clear form
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("message").value = "";
            
            // Show success message
            document.getElementById("form-container").style.display = "none";
            document.getElementById("form-success").style.display = "block";
        })
        .catch((err) => {
            console.error("Error sending email:", err);
            alert("Failed to send message. Please try again later.");
        })
        .finally(() => {
            // Reset submit button
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
        });
}
Version 2.0 Code End */

/*
 * Previous Version (v3.0)
 * Enhanced implementation with validation and proper recipient handling
 */
 
/* Version 3.0 Code Start
function sendMail() {
    // Form validation
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    
    // Basic validation
    if (!name || !email || !message) {
        alert("Please fill in all fields");
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
    }

    // Get form values
    var params = {
        to_name: "Admin", // Required recipient name
        to_email: "cs@irostech.com", // Required recipient email
        from_name: name,
        from_email: email,
        message: message,
        reply_to: email
    };

    const serviceID = "service_g12z5uf";
    const templateID = "template_lvau7oc";

    // Show loading state
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    emailjs
        .send(serviceID, templateID, params)
        .then((res) => {
            // Clear form
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("message").value = "";
            
            // Show success message
            document.getElementById("form-container").style.display = "none";
            document.getElementById("form-success").style.display = "block";
        })
        .catch((err) => {
            console.error("Error sending email:", err);
            if (err.text) {
                alert("Error: " + err.text);
            } else {
                alert("Failed to send message. Please try again later.");
            }
        })
        .finally(() => {
            // Reset submit button
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
        });
}
Version 3.0 Code End */

// Current Version (v4.0)
// Simplified implementation focusing on template requirements
function sendMail() {
    // Form validation
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    
    // Basic validation
    if (!name || !email || !message) {
        alert("Please fill in all fields");
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    // Get form values - matching exactly with your template parameters
    const templateParams = {
        title: "New Message from Xploria Website",
        to_name: "Owner",
        to_email: "auriel.muhammadkece@gmail.com",
        from_name: name,
        from_email: email,
        message: message,
        reply_to: email,
    };

    // Make sure we're using the correct service and template IDs
    const serviceID = "service_g12z5uf";
    const templateID = "template_lvau7oc";

    console.log("Sending email with params:", templateParams);  // Debug log

    emailjs
        .send(serviceID, templateID, templateParams)
        .then((res) => {
            console.log("Email sent successfully:", res);
            // Clear form
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("message").value = "";
            
            // Show success message
            document.getElementById("form-container").style.display = "none";
            document.getElementById("form-success").style.display = "block";
        })
        .catch((err) => {
            console.error("Detailed error information:", {
                error: err,
                status: err.status,
                text: err.text,
                templateParams: templateParams
            });
            if (err.text) {
                alert("Error: " + err.text);
            } else {
                alert("Failed to send message. Please try again later.");
            }
        })
        .finally(() => {
            // Reset submit button
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
        });
}


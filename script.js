const publicKey = "2ebawWCyeoWH8z1PF";
const serviceId = "service_aadd28i";
const templateId = "template_r06vc5r";

// Initialize EmailJS
if (publicKey) {
  emailjs.init(publicKey);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("portfolioContactForm");
  const submitBtn = document.getElementById("submitBtn");
  const responseMsg = document.getElementById("response-msg");
  let messageTimeout; // Store timeout to prevent overlaps

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validation check for configuration
    if (!publicKey || !serviceId || !templateId) {
      showResponse(
        "Email service not configured. Please add your EmailJS keys.",
        "error",
      );
      return;
    }

    // Clear any existing message immediately
    clearTimeout(messageTimeout);
    responseMsg.style.display = "none";
    responseMsg.className = "";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (name.length < 2) {
      showResponse("Name is too short.", "error");
      return;
    }

    if (!validateEmail(email)) {
      showResponse("Please enter a valid email address.", "error");
      return;
    }

    if (message.length < 10) {
      showResponse("Message must be at least 10 characters long.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.value = "Sending...";

    // Send email function with basic retry logic
    const sendWithRetry = async (retries = 3, delay = 1000) => {
      try {
        // sendForm takes (service_id, template_id, form_element)
        await emailjs.sendForm(serviceId, templateId, form);

        showResponse(
          `Thank you, ${name}! Your message has been sent.`,
          "success",
        );
        form.reset();
      } catch (error) {
        if (retries > 0) {
          await new Promise((res) => setTimeout(res, delay));
          return sendWithRetry(retries - 1, delay * 2);
        } else {
          console.error("EmailJS Error:", error);
          showResponse(
            "Failed to send message. Please try again later.",
            "error",
          );
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.value = "Send Message";
      }
    };

    await sendWithRetry();
  });

  function showResponse(text, type) {
    // Clear previous timeout if user clicks rapidly
    clearTimeout(messageTimeout);

    responseMsg.textContent = text;
    responseMsg.style.display = "block"; // Ensure it is visible
    responseMsg.className = type + " fade-in";

    messageTimeout = setTimeout(() => {
      // Remove the class that has !important so display: none can work
      responseMsg.className = type + " fade-out";
      responseMsg.style.display = "none";
      console.log("Message hidden");
    }, 3000);
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});

// To align the timeline divider height dynamically based on the last box in each section
function alignTimelineDivider(sectionId, dividerId) {
  const section = document.getElementById(sectionId);
  const divider = document.getElementById(dividerId);
  if (!section || !divider) return;

  const boxes = section.querySelectorAll(
    ".timeline-left-box, .timeline-right-box",
  );
  if (boxes.length === 0) return;

  const lastBox = boxes[boxes.length - 1];
  const timelineTop = section
    .querySelector(".timeline")
    .getBoundingClientRect().top;
  const lastBoxTop = lastBox.getBoundingClientRect().top;
  const dotRadius = 7.5;

  divider.style.height = lastBoxTop - timelineTop + dotRadius + "px";
}

function alignAllDividers() {
  alignTimelineDivider("experience", "experience-divider");
  alignTimelineDivider("education", "education-divider");
}

window.addEventListener("load", alignAllDividers);
window.addEventListener("resize", alignAllDividers);

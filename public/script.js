document.addEventListener("DOMContentLoaded", () => {
  // Mobile detection
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // DOM Elements
  const chatContainer = document.querySelector(".chat-container");
  const chatMessages = document.getElementById("chatMessages");
  const initialInput = document.getElementById("userInput");
  const activeInput = document.getElementById("userInputActive");
  const sendButtons = document.querySelectorAll(
    "#sendButton, #sendButtonActive"
  );
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  let isFirstMessage = true;

  // Sidebar Elements
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".sidebar");
  const sidebarIcon = sidebarToggle.querySelector("i");

  // Initialize mobile state
  if (isMobile) {
    sidebar.classList.add("collapsed");
    sidebarIcon.classList.replace("fa-chevron-left", "fa-chevron-right");
  }

  // Chat Activation
  function activateChat() {
    chatContainer.classList.add("active");
    isFirstMessage = false;
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);
  }

  // Message Creation
  function addMessage(text, isUser = true) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;
    messageDiv.innerHTML = isUser ? text : `<i>${text}</i>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Sidebar Management
  const dynamicLinkContainer = document.getElementById("dynamicSidebarLinks");
  function updateSidebarWithPrompt(promptText) {
    const newLink = document.createElement("div");
    newLink.className = "sidebar-link suggestion-btn";
    newLink.textContent = promptText;

    if (dynamicLinkContainer.children.length >= 3) {
      dynamicLinkContainer.removeChild(dynamicLinkContainer.firstChild);
    }
    dynamicLinkContainer.appendChild(newLink);

    newLink.addEventListener("click", () => {
      activeInput.value = promptText;
      sendMessage();
    });
  }

  // Message Sending
  async function sendMessage() {
    const question = initialInput.value.trim() || activeInput.value.trim();
    if (!question) return;

    if (isFirstMessage) activateChat();
    addMessage(question, true);
    updateSidebarWithPrompt(question);

    initialInput.value = "";
    activeInput.value = "";
    sendButtons.forEach((btn) => (btn.disabled = true));

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message bot-message";
    loadingDiv.innerHTML = `<div class="loading-dots"><div></div><div></div><div></div><div></div></div>`;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch(
        "https://recipe-assistant-17he.onrender.com/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question }),
        }
      );

      const data = await response.json();
      chatMessages.removeChild(loadingDiv);

      if (!response.ok) {
        addMessage(data.answer || "Error processing request", false);
        return;
      }

      addMessage(data.answer, false);
    } catch (error) {
      chatMessages.removeChild(loadingDiv);
      addMessage("Connection error. Please try again.", false);
      console.error("Network Error:", error);
    } finally {
      sendButtons.forEach((btn) => (btn.disabled = false));
      (activeInput || initialInput).focus();
    }
  }

  // Event Listeners
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    sidebarIcon.classList.toggle("fa-chevron-right");
    sidebarIcon.classList.toggle("fa-chevron-left");
  });

  document.querySelectorAll(".suggestion-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const query = e.target.textContent.trim();
      if (isFirstMessage) {
        initialInput.value = query;
      } else {
        activeInput.value = query;
      }
      sendMessage();
    });
  });

  sendButtons.forEach((btn) => btn.addEventListener("click", sendMessage));

  [initialInput, activeInput].forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  });

  chatMessages.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("visible", chatMessages.scrollTop > 200);
  });

  scrollTopBtn.addEventListener("click", () => {
    chatMessages.scrollTo({ top: 0, behavior: "smooth" });
  });
});

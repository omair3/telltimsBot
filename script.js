document.addEventListener('DOMContentLoaded', function () {
  
  document.getElementById('survey-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    
    const code = document.getElementById('code').value.trim();
    const isValid = /^\d{21}$/.test(code);

    if (!isValid) {
      alert("Please enter a valid 21-digit survey code.");
      return;
    }

    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden');
    resultDiv.textContent = "⏳ Starting survey bot... Please wait.";

    try {
      const response = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (data.coupon) {
        resultDiv.textContent = `🎉 Here's your coupon code: ${data.coupon}`;
      } else {
        resultDiv.textContent = `❌ Failed to get coupon: ${data.error || "Unknown error"}`;
      }

    } catch (error) {
      resultDiv.textContent = "❌ Something went wrong: " + error.message;
    }
  });
});

// 📦 TellTims Bot Server

// Import required modules
const express = require('express');          
const bodyParser = require('body-parser');   
const path = require('path');                
const fillTellTimsSurvey = require('./telltimsBot');

const app = express();                       
const PORT = 5000;                           


app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));


app.post('/submit', async (req, res) => {
  const { code } = req.body; 

  try {
  
    const coupon = await fillTellTimsSurvey(code);

    
    if (coupon) {
      res.json({ coupon });
    } else {
      
      res.status(500).json({ error: "Automation failed. Could not get coupon code." });
    }
  } catch (err) {
    
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// 🖥️ Start the server
app.listen(PORT, () => {
  console.log(`📦 TellTims Bot is running on http://localhost:${PORT}`);
});

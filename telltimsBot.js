const puppeteer = require('puppeteer');

async function fillTellTimsSurvey(code) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const surveyURL = 'https://rbixm.qualtrics.com/jfe/form/SV_3lMYn8fpUtkEu7c?CountryCode=CAN&InviteType=Coupon&SC=21';
    await page.goto(surveyURL, { waitUntil: 'networkidle2' });

    //  Enter survey code 
    const visibleInput = await page.evaluateHandle(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
      return inputs.find(input => {
        const style = window.getComputedStyle(input);
        return input.offsetParent !== null && !input.disabled &&
               style.visibility !== 'hidden' &&
               style.display !== 'none';
      });
    });

    if (!visibleInput) throw new Error("No visible input field found.");
    await visibleInput.focus();
    await visibleInput.click({ clickCount: 3 });
    await visibleInput.press('Backspace');
    await visibleInput.type(code);
    console.log("✅ Entered survey code");

    const nextBtn = await page.$('.NextButton');
    if (nextBtn) {
      await nextBtn.click();
      console.log("➡️ Starting survey...");
    }

    //  Loop through survey pages 
    let attempts = 0;
    while (attempts < 30) {
      attempts++;

      await new Promise(resolve => setTimeout(resolve, 2000));

      const pageText = await page.evaluate(() => document.body.innerText);
      console.log("📄 PAGE TEXT:\n" + pageText); 

      const match = pageText.match(/Validation Code:\s*([A-Z0-9\-]+)/i);

      if (match) {
        const coupon = match[1].trim();
        console.log("🎯 Coupon code captured:", coupon); 
        await browser.close();
        return coupon;
      }

      
      await page.evaluate(() => {
        const radioGroups = new Map();
        const radios = Array.from(document.querySelectorAll('input[type="radio"]')).filter(r => {
          const style = window.getComputedStyle(r);
          return r.offsetParent !== null && !r.disabled &&
                 style.visibility !== 'hidden' &&
                 style.display !== 'none';
        });

        radios.forEach(radio => {
          const name = radio.name;
          if (!radioGroups.has(name)) {
            radioGroups.set(name, []);
          }
          radioGroups.get(name).push(radio);
        });

        const bodyText = document.body.innerText.toLowerCase();

        radioGroups.forEach(group => {
          if (
            bodyText.includes("would you like to recognize") ||
            bodyText.includes("recognize a member")
          ) {
            if (group.length >= 2) {
              group[1].click(); // select "No"
            }
          } else {
            group[0].click(); // default: select first option
          }
        });
      });
      console.log("✔️ Answered visible radio groups");

      //  Checkboxes 
      const checks = await page.$$('input[type="checkbox"]');
      if (checks.length > 0) {
        await checks[0].click();
        console.log("✔️ Checked a box");
      }

      //  Dropdowns 
      const selects = await page.$$('select');
      for (let s of selects) {
        await s.select('1');
        console.log("✔️ Selected from dropdown");
      }

      //  Textareas 
      const textareas = await page.$$('textarea');
      for (let area of textareas) {
        await area.type('Everything was great!');
        console.log("📝 Filled a comment box");
      }

      //  Click Next 
      const next = await page.$('.NextButton');
      if (next) {
        await next.click();
        console.log("➡️ Clicked Next");
      } else {
        console.log("⏳ Waiting for Next...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log("⚠️ Survey completed but coupon not found.");
    await browser.close();
    return null; 

  } catch (err) {
    console.error("❌ Puppeteer Error:", err.message);
    await browser.close();
    return null;
  }
}

module.exports = fillTellTimsSurvey;

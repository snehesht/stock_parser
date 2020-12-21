const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
  const page = await browser.newPage();
  await page.goto('https://www.barchart.com/options/most-active/stocks?orderBy=optionsTotalVolume&orderDir=desc&page=all');
  await new Promise((resolve) => setTimeout(resolve, 15000));
  const text = await page.evaluate(() => {
    exclude_words = ['Expand Row', 'Quote Overview', 'Interactive Chart', 'Options Quotes', 'Barchart Opinion', 'Add to Watchlist', 'Add to Portfolio', 'Add Alert']
    data = []
    row = []
    let reset_row = false
    let col_idx = 0;
    document.querySelector('div.barchart-content-block.invisible.border-top-0.visible').textContent.split('\n').filter(el => el.trim().length > 0).forEach((el) => {
      if (exclude_words.includes(el.trim())) {
        reset_row = true
        col_idx = 0
        data.push(row)
        row = []
      } else {
        row.push(el.trim())
      }
    })

    formatted_data = []
    data.forEach(el => {
      if (el.length === 23) {
        el = el.slice(12)
        formatted_data.push({
          'symbol': el[0],
          'name': el[1],
          'last': el[2],
          'change': el[3],
          'percent_change': el[4],
          'iv_rank': el[5],
          'options_volume': el[6],
          'percent_put': el[7],
          'percent_call': el[8],
          'put_call_ratio': el[9],
          'time': el[10],
        })
      }
      if (el.length === 11) {
        formatted_data.push({
          'symbol': el[0],
          'name': el[1],
          'last': el[2],
          'change': el[3],
          'percent_change': el[4],
          'iv_rank': el[5],
          'options_volume': el[6],
          'percent_put': el[7],
          'percent_call': el[8],
          'put_call_ratio': el[9],
          'time': el[10],
        })
      }
    })
    return formatted_data
  });
  fs.writeFileSync('options_by_total_volume.json', JSON.stringify(text, null, 2))
  } catch(error) {
    console.log(error)
  }
  await browser.close();
})();
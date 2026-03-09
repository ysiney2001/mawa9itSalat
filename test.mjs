import * as cheerio from "cheerio";

async function test() {
  const city = "129";
  const response = await fetch(`https://www.habous.gov.ma/prieres/horaire_hijri_2.php?ville=${city}`);
  const html = await response.text();
  const $ = cheerio.load(html);

  const currentRow = $("table#horaire tr.cournt");

  if (currentRow.length === 0) {
    console.error("No current row found.");
    return;
  }
  const tds = currentRow.find("td");
  console.log("Fajr:", $(tds[3]).text().trim());
  console.log("Shuruq:", $(tds[4]).text().trim());
  console.log("Dhuhr:", $(tds[5]).text().trim());
  console.log("Asr:", $(tds[6]).text().trim());
  console.log("Maghrib:", $(tds[7]).text().trim());
  console.log("Isha:", $(tds[8]).text().trim());
}

test();

import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import https from "https";

export const revalidate = 3600; // Cache for 1 hour

const fetchHabousHTML = (city: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    https.get(
      `https://www.habous.gov.ma/prieres/horaire_hijri_2.php?ville=${city}`,
      {
        rejectUnauthorized: false, // Bypass SSL verification errors for Habous
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      },
      (res) => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          return reject(new Error(`Status Code: ${res.statusCode}`));
        }
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(data);
        });
      }
    ).on("error", (err) => {
      reject(err);
    });
  });
};

export async function GET(request: NextRequest) {
  // Hardcoded to Rissani as per V2 requirements
  const city = "129";

  try {
    const html = await fetchHabousHTML(city);
    const $ = cheerio.load(html);

    const rows = $("table#horaire tr:not(:first-child)"); // Skip header row

    const monthlySchedule: any[] = [];

    rows.each((index, element) => {
      const tds = $(element).find("td");
      if (tds.length >= 9) {
        // According to Habous:
        // td[0] = Day string (e.g. الخميس)
        // td[1] = Hijri Day
        // td[2] = Gregorian Day (which we need for accurate matching)
        // td[3] = Fajr
        // td[4] = Shuruq
        // td[5] = Dhuhr
        // td[6] = Asr
        // td[7] = Maghrib
        // td[8] = Isha
        
        const gregorianDay = parseInt($(tds[2]).text().trim(), 10);
        
        if (!isNaN(gregorianDay)) {
          monthlySchedule.push({
            gregorianDay,
            fajr: $(tds[3]).text().trim(),
            shuruq: $(tds[4]).text().trim(),
            dhuhr: $(tds[5]).text().trim(),
            asr: $(tds[6]).text().trim(),
            maghrib: $(tds[7]).text().trim(),
            isha: $(tds[8]).text().trim(),
          });
        }
      }
    });

    if (monthlySchedule.length === 0) {
      return NextResponse.json(
        { error: "Could not parse timetable schedule from Habous" },
        { status: 404 }
      );
    }

    return NextResponse.json(monthlySchedule);
  } catch (error) {
    console.error("Error fetching prayers:", error);
    return NextResponse.json(
      { error: "Failed to fetch prayer times" },
      { status: 500 }
    );
  }
}

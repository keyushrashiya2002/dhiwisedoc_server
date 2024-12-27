import moment from "moment-timezone";
import { investmentStatusEnum } from "../config/enum.js";
import puppeteer from "puppeteer";

export const paginationFun = (data) => {
  const { page = 1, limit = 10 } = data;

  return {
    limit: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
  };
};

export const paginationDetails = ({ page = 1, totalItems, limit }) => {
  const totalPages = Math.ceil(totalItems / limit);
  return { page: Number(page), totalPages, totalItems, limit };
};

export const monthFilter = (query) => {
  const { from, to } = query;

  // Get current month's range
  let fromDate = moment().startOf("month");
  let toDate = moment().endOf("month").add(1, "day");

  // If from and to are provided, use them
  if (from && to) {
    fromDate = moment(from);
    toDate = moment(to).add(1, "day");
  }

  return { fromDate, toDate };
};

export const countIntrest = ({
  investedDate,
  amount,
  intrest,
  manirityDuration,
}) => {
  // Set the timezone to 'Asia/Kolkata' for IST
  const investDate = moment.tz(investedDate, "Asia/Kolkata").startOf("day");
  const currentDate = moment.tz("Asia/Kolkata").startOf("day");

  const diffInDays = currentDate.diff(investDate, "days");

  const days = diffInDays >= manirityDuration ? manirityDuration : diffInDays;
  const status =
    diffInDays >= manirityDuration
      ? investmentStatusEnum.COMPLETED
      : investmentStatusEnum.ONGOING;

  // Calculate the interest for full months
  const monthlyInterest = (amount * intrest) / 100; // Interest for one full 30-day month

  // Calculate interest for the remaining days
  const dailyInterest = monthlyInterest / 30; // Interest per day

  // Calculate interest of total spend days
  const total = dailyInterest * days;
  return {
    investmentReturnAmount: total.toFixed(2),
    status,
    dailyInterest: dailyInterest.toFixed(2),
  };
};

export const convertHtmlToImage = async (
  htmlContent,
  width = 1242,
  height = 874
) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();

  await page.setViewport({ width, height });

  // Set the content of the page with the provided HTML
  await page.setContent(htmlContent);

  // Capture a screenshot of the page and get the image as a buffer
  const imageBuffer = await page.screenshot();

  // Close the browser
  await browser.close();

  return imageBuffer;
};

export const calculateTotalInterestAmount = ({
  intrest,
  manirityDuration,
  amount,
}) => {
  const interestFactor = (intrest / 100) * (manirityDuration / 30);
  return Math.floor(interestFactor * amount);
};

export const calculateTotalAmount = (investment, interestRate, days) => {
  const interestAmount = (investment * interestRate * days) / (100 * 365);
  const totalAmount = Number(investment) + Number(interestAmount);
  const totalAmountWithInterest = Number(totalAmount) + Number(interestAmount);
  return totalAmountWithInterest;
};

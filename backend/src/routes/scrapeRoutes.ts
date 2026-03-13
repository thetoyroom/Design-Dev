import express from "express";
import { scrapeInstagram } from "../services/instagramScraper";

const router = express.Router();

router.get("/instagram", async (req, res) => {
  await scrapeInstagram();
  res.json({ message: "Instagram import complete" });
});

export default router;

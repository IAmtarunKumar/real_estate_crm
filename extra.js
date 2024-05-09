function MiddleWares(app) {
    const dotenv = require("dotenv");
    const cookieParser = require("cookie-parser")
    const express = require("express");
    // const { Configuration, OpenAIApi } = require("openai");
    const bodyParser = require("body-parser");
    const cors = require("cors");
    dotenv.config();

    // Set up OpenAI API
    // const configuration = new Configuration({
        // apiKey: process.env.OPENAI_API_KEY,
    // });
    // const openai = new OpenAIApi(configuration);
    app.use(cors())
    app.use(express.json());
    app.use(cookieParser());
    // Create a new express app

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    const allowedDomains = [
        "http://127.0.0.1:5173", "https://ocpl.tech",
        "https://*.ocpl.tech",
        "https://aestra.ocpl.tech",
        "https://demo-aestra-organisation.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://aestra.vercel.app",
        "https://crm-dashboard-lime.vercel.app",
        "https://marketing-strategy.vercel.app",
        "https://aestra-organisation.vercel.app",
        "https://aestra-finance-frontend.vercel.app", "https://crm-dashboard-o1sx.vercel.app", "https://crm-dashboard-git-aestrajewellers-nexgenauth.vercel.app", "https://aestra-jewellers.vercel.app", "https://www.non-dit-middleware.vercel.app", "https://non-dit-middleware.vercel.app", "https://raspy-grass-2310.on.fleek.co", "https://thenonditedit.com", "https://www.thenonditedit.com", "https://aestra-finance-frontend.vercel.app",
        "https://crm-dashboard-o1sx.vercel.app",
        "https://aestra-voice-call.vercel.app", "https://ocpl.tech", "https://browse-prospect.vercel.app", "https://payments-multitenant.onrender.com", "https://effective-spoon-grx9ggx75vrcvj45-3000.app.github.dev", "https://email-management.vercel.app", "https://legal-papers-india.vercel.app", "https://payment-emailsender.onrender.com", "https://legalpapers-payments.onrender.com",
        "https://testsub1.ocpl.tech", "https://legalpapersindia.com", "https://fssairegistrationportal.org", "http://iec-codeindia.org","https://a-yurveda-crm.vercel.app", //previously we dont have to allow kit in extra file making it automatic. i dont know why we cant start it now
        // "https://testsub2.ocpl.tech"
    ];

    // Middleware to handle CORS dynamically
    app.use((req, res, next) => {
        const requestOrigin = req.get("origin");

        // console.log("requestorigin", requestOrigin)
        if (requestOrigin && requestOrigin.endsWith(".ocpl.tech")) {
            // Allow subdomains of ocpl.tech
            res.setHeader("Access-Control-Allow-Origin", requestOrigin);
        } else if (allowedDomains.includes(requestOrigin)) {
            // Allow other specified origins without subdomains
            res.setHeader("Access-Control-Allow-Origin", requestOrigin);
        }

        res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Credentials", true);

        if (req.method === "OPTIONS") {
            // Handle preflight requests
            res.sendStatus(200);
        } else {
            next();
        }
    });
}

module.exports = MiddleWares;

import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport";
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/userRoutes";
import profesorRoutes from "./routes/Profesor/profesorRoutes";
import projektiRoutesp from "./routes/Profesor/projektiRoutesp";  // ✅ ADD: Mount projekt routes
import studentRoutes from "./routes/Student/studentRoutes";
import adminRoutes from "./routes/Admin/adminRoutes";
import setupRoutes from "./routes/setup";
import authRoutes from "./routes/authRoutes";


dotenv.config();

const app: Application = express();
const PORT = 5000;  // Port i fiksuar në 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Welcome to Feedelate API" });
});

// Serve uploaded files
import path from "path";
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

//intex i bashkon krejt me routes entetis edhe nis serverin pa u kan ky okej nuk nis.
// API Routes 
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profesoret", profesorRoutes);
app.use("/api/projektip", projektiRoutesp);  // ✅ FIX: Mount projekt routes (was causing 404)
app.use("/api/studentet", studentRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api", setupRoutes);



// Initialize Database and Start Server
AppDataSource.initialize()
    .then(() => {


        console.log("Database connected successfully");
      

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });

export default app;

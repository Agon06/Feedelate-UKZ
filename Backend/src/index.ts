import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/userRoutes";
import profesorRoutes from "./routes/Profesor/profesorRoutes";
import studentRoutes from "./routes/Student/studentRoutes";
import adminRoutes from "./routes/Admin/adminRoutes";
import projektiRoutes from "./routes/Student/projektiRoutes";
import setupRoutes from "./routes/setup";


dotenv.config(); 

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Welcome to Feedelate API" });
});

// Serve uploaded files
import path from "path";
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

//intex i bashkon krejt me routes entetis edhe nis serverin pa u kan ky okej nuk nis.
// API Routes 
app.use("/api/users", userRoutes);
app.use("/api/profesoret", profesorRoutes);
app.use("/api/studentet", studentRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/projekti", projektiRoutes);
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

import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { Admin } from "./entities/Admin/Admin";
import { Profesor } from "./entities/Profesor/Profesor";
import { Student } from "./entities/Student/Student";
import { Idete } from "./entities/Student/Idete";
import { Lendet } from "./entities/Student/Lendet";
import { DorezimiIdes } from "./entities/Student/dorezimiIdes";
import { Projekti } from "./entities/Student/projekti";
import { dorzimiProjektit } from "./entities/Student/dorzimiProjektit";
import { ProfesorLendetMapping } from "./entities/Student/ProfesorLendetMapping";
import { stdZgjedhore } from "./entities/Student/stdZgjedhore";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "feedelate",
  synchronize: false, // Auto-create tables from entities
  logging: false,
  entities: [
    Admin,
    Profesor,
    Student,
    Idete,
    Lendet,
    DorezimiIdes,
    Projekti,
    dorzimiProjektit,
    ProfesorLendetMapping,
    stdZgjedhore
  ],
  migrations: ["dist/migrations/**/*.js"],
  subscribers: [],
});

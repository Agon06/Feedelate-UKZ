import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
// Explicit entity imports so TypeORM always picks them up in dev/prod
import { User } from "./entities/User";
import { Admin } from "./entities/Admin/Admin";
import { Admin2 } from "./entities/Admin/admin2";
import { Profesor } from "./entities/Profesor/Profesor";
import { Profesor22 } from "./entities/Profesor/prof";
import { Student } from "./entities/Student/Student";
import { Idete } from "./entities/Student/Idete";
import { Lendet } from "./entities/Student/Lendet";
import { DorezimiIdes } from "./entities/Student/dorezimiIdes";
import { Projekti } from "./entities/Student/projekti";
import { dorzimiProjektit } from "./entities/Student/dorzimiProjektit";
import { Test } from "./entities/test";

dotenv.config();
//e lidh bc me db,  i k

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "feedelate",
  synchronize: false,
  logging: false,
  entities: [
    User,
    Admin,
    Admin2,
    Profesor,
    Profesor22,
    Student,
    Idete,
    Lendet,
    DorezimiIdes,
    Projekti,
    dorzimiProjektit,
    Test,
  ],
  migrations: ["dist/migrations/**/*.js"],
  subscribers: [],
});

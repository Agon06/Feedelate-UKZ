import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
// Explicit entity imports so TypeORM always picks them up in dev/prod
import { User } from "./entities/User";
import { Admin } from "./entities/Admin/Admin";
import { Admin2 } from "./entities/Admin/admin2";
import { Profesor } from "./entities/Profesor/Profesor";
import { Profesor22 } from "./entities/Profesor/prof";
import { Lendetp } from "./entities/Profesor/Lendetp";
import { Idetep } from "./entities/Profesor/Idetep";
import { DorezimiIdesp } from "./entities/Profesor/dorezimiIdesp";
import { Projektip } from "./entities/Profesor/projektip";
import { Student } from "./entities/Student/Student";
import { Idete } from "./entities/Student/Idete";
import { Lendet } from "./entities/Student/Lendet";
import { DorezimiIdes } from "./entities/Student/dorezimiides";
import { Projekti } from "./entities/Student/projekti";
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
  synchronize: true, // Set to true for development to auto-create tables
  logging: false,
  entities: [
    User,
    Admin,
    Admin2,
    Profesor,
    Profesor22,
    Lendetp,
    Idetep,
    DorezimiIdesp,
    Projektip,
    Student,
    Idete,
    Lendet,
    DorezimiIdes,
    Projekti,
    Test,
  ],
  migrations: ["dist/migrations/**/*.js"],
  subscribers: [],
});

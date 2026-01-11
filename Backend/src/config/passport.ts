import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { AppDataSource } from "../data-source";
import { Student } from "../entities/Student/Student";

const studentRepository = AppDataSource.getRepository(Student);

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, { id: user.id, type: user.type, email: user.email, roles: user.roles });
});

// Deserialize user
passport.deserializeUser(async (data: any, done) => {
  try {
    const Profesor = require("../entities/Profesor/Profesor").Profesor;
    const Admin = require("../entities/Admin/Admin").Admin;
    const profesorRepository = AppDataSource.getRepository(Profesor);
    const adminRepository = AppDataSource.getRepository(Admin);

    // Collect all roles from all tables for this email
    const roles = new Set<string>();
    let userEmail = data.email;
    let userData: any = null;

    const student = await studentRepository.findOneBy({ email: userEmail });
    if (student) {
      roles.add("student");
      userData = student; // Use first found as base data
    }

    const profesor = await profesorRepository.findOneBy({ email: userEmail });
    if (profesor) {
      roles.add("profesor");
      userData = userData || profesor;
    }

    const admin = await adminRepository.findOneBy({ email: userEmail });
    if (admin) {
      roles.add("admin");
      userData = userData || admin;
    }

    if (userData && roles.size > 0) {
      // Determine primary type for redirect (priority: student > profesor > admin)
      let primaryType = "student";
      if (roles.has("student")) primaryType = "student";
      else if (roles.has("profesor")) primaryType = "profesor";
      else if (roles.has("admin")) primaryType = "admin";

      done(null, {
        ...userData,
        type: primaryType,
        roles: JSON.stringify(Array.from(roles)),
      } as any);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        
        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        // Check if email is from uni-gjilan.net domain
        if (!email.endsWith("@uni-gjilan.net")) {
          return done(new Error("Only @uni-gjilan.net emails are allowed"), undefined);
        }

        const Profesor = require("../entities/Profesor/Profesor").Profesor;
        const Admin = require("../entities/Admin/Admin").Admin;
        const profesorRepository = AppDataSource.getRepository(Profesor);
        const adminRepository = AppDataSource.getRepository(Admin);

        // Find user in any table
        let userData: any = null;
        let isNewUser = true;
        let userRoles: string[] = [];

        const student = await studentRepository.findOneBy({ email });
        if (student) {
          userData = student;
          isNewUser = false;
          // Parse roles from database column
          userRoles = student.roles ? JSON.parse(student.roles) : ["student"];
          // Update SSO info if not already set
          if (!student.ssoProvider) {
            student.ssoProvider = "google";
            student.ssoProviderId = profile.id;
            student.profilePicture = profile.photos?.[0]?.value || student.profilePicture;
            await studentRepository.save(student);
          }
        } else {
          const profesor = await profesorRepository.findOneBy({ email });
          if (profesor) {
            userData = profesor;
            isNewUser = false;
            userRoles = profesor.roles ? JSON.parse(profesor.roles) : ["profesor"];
            // Update SSO info if not already set
            if (!profesor.ssoProvider) {
              profesor.ssoProvider = "google";
              profesor.ssoProviderId = profile.id;
              profesor.profilePicture = profile.photos?.[0]?.value || profesor.profilePicture;
              await profesorRepository.save(profesor);
            }
          } else {
            const admin = await adminRepository.findOneBy({ email });
            if (admin) {
              userData = admin;
              isNewUser = false;
              userRoles = admin.roles ? JSON.parse(admin.roles) : ["admin"];
              // Update SSO info if not already set
              if (!admin.ssoProvider) {
                admin.ssoProvider = "google";
                admin.ssoProviderId = profile.id;
                admin.profilePicture = profile.photos?.[0]?.value || admin.profilePicture;
                await adminRepository.save(admin);
              }
            }
          }
        }

        // If user exists, return with their roles from database
        if (!isNewUser && userData && userRoles.length > 0) {
          // Determine primary type for redirect (priority: student > profesor > admin)
          let primaryType = "student";
          const rolesSet = new Set(userRoles);
          if (rolesSet.has("student")) primaryType = "student";
          else if (rolesSet.has("profesor")) primaryType = "profesor";
          else if (rolesSet.has("admin")) primaryType = "admin";

          return done(null, { ...userData, type: primaryType, roles: JSON.stringify(userRoles) } as any);
        }

        // New user - create based on email pattern
        if (email.endsWith(".st@uni-gjilan.net")) {
          // Create new student account
          const nameParts = profile.displayName?.split(" ") || ["", ""];
          const newStudent = await studentRepository.save({
            email: email,
            emri: profile.name?.givenName || nameParts[0] || "N/A",
            mbiemri: profile.name?.familyName || nameParts[1] || "N/A",
            ssoProvider: "google",
            ssoProviderId: profile.id,
            profilePicture: profile.photos?.[0]?.value || null,
            password: null,
            roles: JSON.stringify(["student"]),
          } as any);
          return done(null, { ...newStudent, type: "student", roles: JSON.stringify(["student"]) } as any);
        } else {
          // Non-student email without existing account
          return done(new Error("User account not found. Please contact admin."), undefined);
        }
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;

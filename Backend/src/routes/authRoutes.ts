import { Router, Request, Response } from "express";
import passport from "../config/passport";

const router = Router();

// Check if Google OAuth is configured
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// Initiate Google OAuth (supports popup via state)
// Forwards firstTime, academicYear, studentCardId as query params in state
router.get(
  "/google",
  (req, res, next) => {
    console.log('✅ /google route hit:', req.query);
    if (!isGoogleConfigured) {
      return res.status(503).json({ 
        error: "SSO_NOT_CONFIGURED",
        message: "Google OAuth nuk është konfiguruar. Kontaktoni administratorin." 
      });
    }
    // Compose state for Google OAuth
    let state = req.query.popup === "1" ? "popup" : undefined;
    // Add extra info for first time login
    if (req.query.firstTime === '1') {
      const extra = {
        firstTime: '1',
        academicYear: req.query.academicYear,
        studentCardId: req.query.studentCardId,
        popup: req.query.popup === '1' ? '1' : undefined
      };
      state = Buffer.from(JSON.stringify(extra)).toString('base64');
    }
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state,
    })(req, res, next);
  }
);

// Google OAuth callback
router.get(
  "/google/callback",
  (req: Request, res: Response, next) => {
    console.log('✅ /google/callback route hit:', { query: req.query, hasUser: !!req.user });
    if (!isGoogleConfigured) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/login?error=sso_not_configured`);
    }
    

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    let isPopup = false;
    let firstTime = false;
    let academicYear = null;
    let studentCardId = null;
    // Parse state for extra info
    if (req.query.state) {
      try {
        // If state is base64, decode
        const stateRaw = req.query.state;
        const stateStr = typeof stateRaw === 'string' ? Buffer.from(stateRaw, 'base64').toString('utf8') : '';
        const stateObj = stateStr ? JSON.parse(stateStr) : {};
        if (stateObj.popup === '1' || stateObj.popup === true) isPopup = true;
        if (stateObj.firstTime === '1') firstTime = true;
        if (stateObj.academicYear) academicYear = stateObj.academicYear;
        if (stateObj.studentCardId) studentCardId = stateObj.studentCardId;
      } catch {
        // fallback: check if state is just 'popup'
        isPopup = req.query.state === 'popup';
      }
    } else {
      isPopup = req.query.popup === '1';
    }

    // Attach academicYear and studentCardId to req for use in GoogleStrategy
    (req as any).academicYear = academicYear;
    (req as any).studentCardId = studentCardId;
    passport.authenticate("google", async (err: any, user: any) => {
      console.log('✅ Passport authentication result:', { hasError: !!err, hasUser: !!user });
      if (err || !user) {
        console.error('❌ Authentication error:', err);
        const message = err?.message || "auth_failed";
        if (isPopup) {
          const script = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Auth Error</title></head><body style="font-family:Arial;padding:20px;text-align:center;"><h2 style="color:red;">❌ Error</h2><p>${message}</p><script>try{if(window.opener&&!window.opener.closed){window.opener.postMessage({type:"auth-error",message:"${message}"},"*")}setTimeout(function(){window.close()},2000)}catch(e){window.close()}<\/script></body></html>`;
          return res.send(script);
        }
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
      }

      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          const message = loginErr.message || "auth_failed";
          if (isPopup) {
            const script = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Auth Error</title></head><body style="font-family:Arial;padding:20px;text-align:center;"><h2 style="color:red;">❌ Error</h2><p>${message}</p><script>try{if(window.opener&&!window.opener.closed){window.opener.postMessage({type:"auth-error",message:"${message}"},"*")}setTimeout(function(){window.close()},2000)}catch(e){window.close()}<\/script></body></html>`;
            return res.send(script);
          }
          return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
        }


        // If first time login, update student info in DB
        if (firstTime && user.type === 'student') {
          try {
            const { getRepository } = require('typeorm');
            const studentRepo = getRepository('Student');
            await studentRepo.update(
              { email: user.email },
              {
                academicYear: academicYear || null,
                nrIdCard: studentCardId || null,
              }
            );
            // Also update user object for frontend
            user.academicYear = academicYear;
            user.nrIdCard = studentCardId;
          } catch (e) {
            // ignore DB error, continue login
          }
        }
        // Store user in session (typing workaround)
        (req.session as any).user = user;

        if (isPopup) {
          console.log('✅ Popup login successful, sending postMessage for user:', user.email);
          const payload = {
            user: {
              id: user.id,
              emri: user.emri,
              mbiemri: user.mbiemri,
              email: user.email,
              profilePicture: user.profilePicture,
              roles: user.roles,
              type: user.type,
            },
            type: user.type,
          };
          const script = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Signing in...</title></head><body style="font-family:Arial;padding:20px;text-align:center;"><script>try{if(window.opener&&!window.opener.closed){window.opener.postMessage({type:"auth",payload:${JSON.stringify(payload)}},"*");setTimeout(function(){window.close()},100)}else{window.close()}}catch(e){console.error(e);window.close()}<\/script></body></html>`;
          return res.send(script);
        }

        // Non-popup redirect
        if (user.type === "student") {
          const userData = encodeURIComponent(JSON.stringify({
            id: user.id,
            emri: user.emri,
            mbiemri: user.mbiemri,
            email: user.email,
            profilePicture: user.profilePicture,
            roles: user.roles,
            type: user.type,
          }));
          return res.redirect(`${frontendUrl}/auth/callback?user=${userData}&type=student`);
        } else if (user.type === "profesor") {
          const userData = encodeURIComponent(JSON.stringify({
            id: user.id,
            emri: user.emri,
            mbiemri: user.mbiemri,
            email: user.email,
            profilePicture: user.profilePicture,
            roles: user.roles,
            type: user.type,
          }));
          return res.redirect(`${frontendUrl}/auth/callback?user=${userData}&type=profesor`);
        } else if (user.type === "admin") {
          const userData = encodeURIComponent(JSON.stringify({
            id: user.id,
            emri: user.emri,
            mbiemri: user.mbiemri,
            email: user.email,
            profilePicture: user.profilePicture,
            roles: user.roles,
            type: user.type,
          }));
          return res.redirect(`${frontendUrl}/auth/callback?user=${userData}&type=admin`);
        }

        res.redirect(`${frontendUrl}/login`);
      });
    })(req, res, next);
  }
);

// Logout
router.get("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed", error: err });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Session destruction failed", error: err });
      }
      // Set cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.json({ message: "Logged out successfully" });
    });
  });
});

// Check authentication status
router.get("/status", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;
//authRoutes
//passport

import { Router, Request, Response } from "express";
import passport from "../config/passport";

const router = Router();

// Initiate Google OAuth (supports popup via state)
router.get(
  "/google",
  (req, res, next) =>
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: req.query.popup === "1" ? "popup" : undefined,
    })(req, res, next)
);

// Google OAuth callback
router.get(
  "/google/callback",
  (req: Request, res: Response, next) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const isPopup = (req.query.state === "popup") || (req.query.popup === "1");

    passport.authenticate("google", (err: any, user: any) => {
      if (err || !user) {
        const message = err?.message || "auth_failed";
        if (isPopup) {
          const script = `<!DOCTYPE html><html><head><meta charset=\"utf-8\" /><title>Auth error</title></head><body><script>(function(){try{var msg=${JSON.stringify(message)};var target='${frontendUrl}';if(window.opener){window.opener.postMessage({type:'auth-error', message: msg}, target);}window.close();}catch(e){console.error(e);}})();<\/script></body></html>`;
          return res.send(script);
        }
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          const message = loginErr.message || "auth_failed";
          if (isPopup) {
            const script = `<!DOCTYPE html><html><head><meta charset=\"utf-8\" /><title>Auth error</title></head><body><script>(function(){try{var msg=${JSON.stringify(message)};var target='${frontendUrl}';if(window.opener){window.opener.postMessage({type:'auth-error', message: msg}, target);}window.close();}catch(e){console.error(e);}})();<\/script></body></html>`;
            return res.send(script);
          }
          return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
        }

        // Store user in session (typing workaround)
        (req.session as any).user = user;

        if (isPopup) {
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
          const script = `<!DOCTYPE html><html><head><meta charset=\"utf-8\" /><title>Signing in...</title></head><body><script>(function(){try{var payload=${JSON.stringify(payload)};var target='${frontendUrl}';if(window.opener){window.opener.postMessage({type:'auth', payload: payload}, target);}window.close();}catch(e){console.error(e);}})();<\/script></body></html>`;
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

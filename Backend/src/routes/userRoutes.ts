import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

const router = Router();
const userRepository = AppDataSource.getRepository(User);

// Get all users
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await userRepository.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

// Get user by id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
});

// Create user
router.post("/", async (req: Request, res: Response) => {
  try {
    const user = userRepository.create(req.body);
    const result = await userRepository.save(user);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
});

// Update user
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    userRepository.merge(user, req.body);
    const result = await userRepository.save(user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});

// Delete user
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await userRepository.delete(req.params.id);
    if (result.affected === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
});

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import skillsRouter from "./skills";
import telegramRouter from "./telegram";

const router: IRouter = Router();

router.use(healthRouter);
router.use(skillsRouter);
router.use(telegramRouter);

export default router;

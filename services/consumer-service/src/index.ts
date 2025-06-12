import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import sequelize from "./config/database";
import attributeTemplateRoutes from "./routes/attribute-template.routes";
import consumerQueryRoutes from "./routes/consumer-query.routes";
import consumerSearchRoutes from "./routes/consumer-search.routes";
import { EventHandlerService } from "./services/event-handler.service";

// Load environment variables
dotenv.config();
const app = express();
const port = process.env.PORT || 3008;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/attribute-templates", attributeTemplateRoutes);
app.use("/api/consumers", consumerQueryRoutes);
app.use("/api/consumers", consumerSearchRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong!",
    });
  }
);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync database (in development)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("Database synced");
    }

    app.listen(port, () => {
      console.log(`Consumer service running on port ${port}`);
      const eventHandlerService = EventHandlerService.getInstance();
      eventHandlerService.subscribeToEvents();
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();

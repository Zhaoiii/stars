import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ResponseUtil } from "../utils/response";

// 验证中间件工厂函数
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 根据请求方法选择验证的数据源
      let dataToValidate;
      if (req.method === "GET") {
        dataToValidate = req.query;
      } else {
        dataToValidate = req.body;
      }

      // 执行验证
      const validatedData = schema.parse(dataToValidate);

      // 将验证后的数据替换原始数据
      if (req.method === "GET") {
        req.query = validatedData as any;
      } else {
        req.body = validatedData;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // 处理验证错误
        const errorMessages = error.issues.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });

        ResponseUtil.error(
          res,
          `数据验证失败: ${errorMessages.join(", ")}`,
          400
        );
        return;
      }

      // 其他错误
      ResponseUtil.error(res, "数据验证过程中发生错误", 500);
    }
  };
};

// 验证路径参数
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });

        ResponseUtil.error(
          res,
          `参数验证失败: ${errorMessages.join(", ")}`,
          400
        );
        return;
      }

      ResponseUtil.error(res, "参数验证过程中发生错误", 500);
    }
  };
};

// 验证查询参数
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });

        ResponseUtil.error(
          res,
          `查询参数验证失败: ${errorMessages.join(", ")}`,
          400
        );
        return;
      }

      ResponseUtil.error(res, "查询参数验证过程中发生错误", 500);
    }
  };
};

// 验证请求体
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedBody = schema.parse(req.body);
      req.body = validatedBody;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });

        ResponseUtil.error(
          res,
          `请求体验证失败: ${errorMessages.join(", ")}`,
          400
        );
        return;
      }

      ResponseUtil.error(res, "请求体验证过程中发生错误", 500);
    }
  };
};

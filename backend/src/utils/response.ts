import { Response } from "express";

// 基础响应接口
export interface BaseResponse {
  success: boolean;
  message: string;
}

// 不分页响应接口
export interface ApiResponse<T = any> extends BaseResponse {
  data?: T;
}

// 分页响应接口
export interface PaginatedResponse<T = any> extends BaseResponse {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

// 响应工具类
export class ResponseUtil {
  // 成功响应（不分页）
  static success<T>(
    res: Response,
    data: T,
    message: string = "操作成功",
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    res.status(statusCode).json(response);
  }

  // 成功响应（分页）
  static successPaginated<T>(
    res: Response,
    data: T[],
    page: number,
    pageSize: number,
    total: number,
    message: string = "操作成功",
    statusCode: number = 200
  ): Response {
    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      page,
      pageSize,
      total,
    };
    return res.status(statusCode).json(response);
  }

  // 错误响应
  static error(
    res: Response,
    message: string = "操作失败",
    statusCode: number = 500
  ): void {
    const response: BaseResponse = {
      success: false,
      message,
    };
    res.status(statusCode).json(response);
  }

  // 未找到响应
  static notFound(res: Response, message: string = "资源不存在"): void {
    this.error(res, message, 404);
  }

  // 未授权响应
  static unauthorized(res: Response, message: string = "未授权访问"): void {
    this.error(res, message, 401);
  }

  // 禁止访问响应
  static forbidden(res: Response, message: string = "禁止访问"): void {
    this.error(res, message, 403);
  }
}

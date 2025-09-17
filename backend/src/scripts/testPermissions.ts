import { UserRole } from "../types/enums";

// 测试权限系统
export const testPermissions = () => {
  console.log("=== 权限系统测试 ===");

  // 测试角色定义
  console.log("用户角色:", {
    ADMIN: UserRole.ADMIN,
    MANAGER_TEACHER: UserRole.MANAGER_TEACHER,
    TEACHER: UserRole.TEACHER,
  });

  // 测试权限逻辑
  const testUserAccess = (userRole: UserRole, requiredRole: UserRole) => {
    // 管理员可以看到所有页面
    if (userRole === UserRole.ADMIN) return true;
    // 管理教师可以看到团队管理和学生管理
    if (
      userRole === UserRole.MANAGER_TEACHER &&
      (requiredRole === UserRole.MANAGER_TEACHER ||
        requiredRole === UserRole.TEACHER)
    )
      return true;
    // 普通教师只能看到学生管理
    if (userRole === UserRole.TEACHER && requiredRole === UserRole.TEACHER)
      return true;
    return false;
  };

  // 测试各种权限组合
  const testCases = [
    { user: UserRole.ADMIN, required: UserRole.ADMIN, expected: true },
    {
      user: UserRole.ADMIN,
      required: UserRole.MANAGER_TEACHER,
      expected: true,
    },
    { user: UserRole.ADMIN, required: UserRole.TEACHER, expected: true },
    {
      user: UserRole.MANAGER_TEACHER,
      required: UserRole.ADMIN,
      expected: false,
    },
    {
      user: UserRole.MANAGER_TEACHER,
      required: UserRole.MANAGER_TEACHER,
      expected: true,
    },
    {
      user: UserRole.MANAGER_TEACHER,
      required: UserRole.TEACHER,
      expected: true,
    },
    { user: UserRole.TEACHER, required: UserRole.ADMIN, expected: false },
    {
      user: UserRole.TEACHER,
      required: UserRole.MANAGER_TEACHER,
      expected: false,
    },
    { user: UserRole.TEACHER, required: UserRole.TEACHER, expected: true },
  ];

  console.log("\n权限测试结果:");
  testCases.forEach(({ user, required, expected }, index) => {
    const result = testUserAccess(user, required);
    const status = result === expected ? "✅" : "❌";
    console.log(
      `${status} 测试 ${
        index + 1
      }: ${user} 访问 ${required} 页面 - 期望: ${expected}, 实际: ${result}`
    );
  });

  console.log("\n=== 权限系统测试完成 ===");
};

// 如果直接运行此脚本
if (require.main === module) {
  testPermissions();
}

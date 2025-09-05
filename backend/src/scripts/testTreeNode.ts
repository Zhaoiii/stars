import { connectDB } from "../config/database";
import TreeNode from "../models/TreeNode";

async function testTreeNodeOperations() {
  try {
    await connectDB();
    console.log("连接数据库成功");

    // 清空现有数据
    await TreeNode.deleteMany({});
    console.log("清空现有数据");

    // 创建根节点
    const root1 = new TreeNode({
      name: "根节点1",
      description: "第一个根节点",
      isRoot: true,
      isLeaf: false,
      index: 0,
    });
    await root1.save();
    console.log("创建根节点1:", root1.name);

    const root2 = new TreeNode({
      name: "根节点2",
      description: "第二个根节点",
      isRoot: true,
      isLeaf: false,
      index: 1,
    });
    await root2.save();
    console.log("创建根节点2:", root2.name);

    // 创建子节点
    const child1 = new TreeNode({
      name: "子节点1-1",
      description: "根节点1的第一个子节点",
      isRoot: false,
      isLeaf: false,
      parentId: root1._id,
      index: 0,
    });
    await child1.save();
    console.log("创建子节点1-1:", child1.name);

    const child2 = new TreeNode({
      name: "子节点1-2",
      description: "根节点1的第二个子节点",
      isRoot: false,
      isLeaf: false,
      parentId: root1._id,
      preLevelNode: child1._id,
      index: 1,
    });
    await child2.save();
    console.log("创建子节点1-2:", child2.name);

    // 更新前级节点的nextLevelNode
    child1.nextLevelNode = child2._id as any;
    await child1.save();

    // 创建叶子节点
    const leaf1 = new TreeNode({
      name: "叶子节点1-1-1",
      description: "这是一个叶子节点",
      isRoot: false,
      isLeaf: true,
      parentId: child1._id,
      index: 0,
    });
    await leaf1.save();
    console.log("创建叶子节点1-1-1:", leaf1.name);

    const leaf2 = new TreeNode({
      name: "叶子节点1-1-2",
      description: "这是另一个叶子节点",
      isRoot: false,
      isLeaf: true,
      parentId: child1._id,
      preLevelNode: leaf1._id,
      index: 1,
    });
    await leaf2.save();
    console.log("创建叶子节点1-1-2:", leaf2.name);

    // 更新前级节点的nextLevelNode
    leaf1.nextLevelNode = leaf2._id as any;
    await leaf1.save();

    // 查询所有根节点
    const roots = await TreeNode.find({ isRoot: true }).sort({ index: 1 });
    console.log(
      "所有根节点:",
      roots.map((r: any) => r.name)
    );

    // 查询某个节点的所有子节点
    const children = await TreeNode.find({ parentId: root1._id }).sort({
      index: 1,
    });
    console.log(
      "根节点1的子节点:",
      children.map((c: any) => c.name)
    );

    // 查询所有叶子节点
    const leaves = await TreeNode.find({ isLeaf: true });
    console.log(
      "所有叶子节点:",
      leaves.map((l: any) => l.name)
    );

    // 测试前级关系
    const nodeWithPre = await TreeNode.findById(child2._id).populate(
      "preLevelNode"
    );
    console.log(
      "子节点1-2的前级节点:",
      (nodeWithPre?.preLevelNode as any)?.name
    );

    const nodeWithNext = await TreeNode.findById(child1._id).populate(
      "nextLevelNode"
    );
    console.log(
      "子节点1-1的后级节点:",
      (nodeWithNext?.nextLevelNode as any)?.name
    );

    console.log("所有测试操作完成！");
  } catch (error) {
    console.error("测试失败:", error);
  } finally {
    process.exit(0);
  }
}

testTreeNodeOperations();

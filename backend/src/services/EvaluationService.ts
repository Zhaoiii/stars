import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { EvaluationToolNode } from "../entities/EvaluationToolNode";
import { EvaluationScoringOption } from "../entities/EvaluationScoringOption";
import { MultipleChoiceAnswer } from "../entities/MultipleChoiceAnswer";
import { ShortTermGoal } from "../entities/ShortTermGoal";
import { EvaluationNodeType, EvaluationScoringType } from "../types/enums";

export interface CreateToolData {
  title: string;
  description?: string | null;
  order?: number;
}

export interface CreateNodeData {
  parentId: string | null;
  nodeType: EvaluationNodeType;
  title: string;
  description?: string | null;
  targetAge?: number | null;
  order?: number;
  scoringType: EvaluationScoringType;
  scoringConfig?: any | null;
}

export interface UpdateNodeData extends Partial<CreateNodeData> {}

export interface CreateOptionData {
  label: string;
  score: number;
}

export interface UpdateOptionData extends Partial<CreateOptionData> {}

export class EvaluationService {
  private nodeRepo: Repository<EvaluationToolNode>;
  private optionRepo: Repository<EvaluationScoringOption>;
  private multipleChoiceAnswerRepo: Repository<MultipleChoiceAnswer>;
  private shortTermGoalRepo: Repository<ShortTermGoal>;

  constructor() {
    this.nodeRepo = AppDataSource.getRepository(EvaluationToolNode);
    this.optionRepo = AppDataSource.getRepository(EvaluationScoringOption);
    this.multipleChoiceAnswerRepo =
      AppDataSource.getRepository(MultipleChoiceAnswer);
    this.shortTermGoalRepo = AppDataSource.getRepository(ShortTermGoal);
  }

  // 工具管理
  async createTool(data: CreateToolData): Promise<EvaluationToolNode> {
    const root = this.nodeRepo.create({
      parentId: null,
      nodeType: EvaluationNodeType.ROOT,
      title: data.title,
      description: data.description ?? null,
      order: data.order ?? 0,
      scoringType: EvaluationScoringType.NONE,
      scoringConfig: null,
    });
    return await this.nodeRepo.save(root);
  }

  async getTools(): Promise<EvaluationToolNode[]> {
    return await this.nodeRepo.find({
      where: { nodeType: EvaluationNodeType.ROOT },
    });
  }

  // 节点管理
  async getChildren(id: string): Promise<EvaluationToolNode[]> {
    return await this.nodeRepo.find({
      where: { parentId: id },
      order: { order: "ASC", id: "ASC" },
    });
  }

  async createNode(data: CreateNodeData): Promise<EvaluationToolNode> {
    if (data.nodeType === EvaluationNodeType.ROOT) {
      throw new Error("不能创建 root 类型节点");
    }

    if (!data.parentId) {
      throw new Error("parentId 必填");
    }

    const parent = await this.nodeRepo.findOne({
      where: { id: data.parentId },
    });
    if (!parent) throw new Error("父节点不存在");

    // 分类/none 时，scoringConfig 必须为 null
    if (
      data.nodeType === EvaluationNodeType.CATEGORY ||
      data.scoringType === EvaluationScoringType.NONE
    ) {
      data.scoringConfig = null;
    }

    // 自动排序：追加到同级末尾（若未显式提供 order）
    let computedOrder = data.order ?? null;
    if (computedOrder == null) {
      const last = await this.nodeRepo.find({
        where: { parentId: data.parentId },
        order: { order: "DESC" },
        take: 1,
      });
      computedOrder = last.length ? (last[0].order ?? 0) + 1 : 0;
    }

    const node = this.nodeRepo.create({
      parentId: data.parentId,
      nodeType: data.nodeType,
      title: data.title,
      description: data.description ?? null,
      targetAge: data.targetAge ?? null,
      order: computedOrder,
      scoringType: data.scoringType,
      scoringConfig: data.scoringConfig ?? null,
    });
    return await this.nodeRepo.save(node);
  }

  async updateNode(
    id: string,
    data: UpdateNodeData
  ): Promise<EvaluationToolNode | null> {
    const node = await this.nodeRepo.findOne({ where: { id } });
    if (!node) return null;

    if (data.nodeType === EvaluationNodeType.ROOT) {
      throw new Error("不支持将节点改为 root 类型");
    }

    if (
      data.nodeType === EvaluationNodeType.CATEGORY ||
      data.scoringType === EvaluationScoringType.NONE
    ) {
      data.scoringConfig = null;
    }

    Object.assign(node, data);
    return await this.nodeRepo.save(node);
  }

  async deleteNode(id: string): Promise<boolean> {
    // 先检查节点是否存在
    const node = await this.nodeRepo.findOne({ where: { id } });
    if (!node) {
      return false;
    }

    // 使用事务确保所有相关数据都被正确删除
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 手动删除多选答案（确保外键约束正确工作）
      await queryRunner.manager.delete(MultipleChoiceAnswer, {
        longTermGoalId: id,
      });

      // 2. 手动删除短期目标
      await queryRunner.manager.delete(ShortTermGoal, { longTermGoalId: id });

      // 3. 手动删除评分选项
      await queryRunner.manager.delete(EvaluationScoringOption, { nodeId: id });

      // 4. 删除节点本身
      const result = await queryRunner.manager.delete(EvaluationToolNode, id);

      if (result.affected === 0) {
        await queryRunner.rollbackTransaction();
        return false;
      }

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 重排同级子节点顺序
  async reorderChildren(
    parentId: string,
    orderedChildIds: string[]
  ): Promise<void> {
    const children = await this.nodeRepo.find({
      where: { parentId },
      order: { order: "ASC", id: "ASC" },
    });
    const existingIds = new Set(children.map((c) => String(c.id)));
    const incomingIds = new Set(orderedChildIds.map(String));
    if (
      existingIds.size !== incomingIds.size ||
      [...existingIds].some((id) => !incomingIds.has(id))
    ) {
      throw new Error("重排的 ID 列表与现有子节点不一致");
    }

    // 依序写入 order
    for (let i = 0; i < orderedChildIds.length; i++) {
      const id = orderedChildIds[i];
      await this.nodeRepo.update({ id }, { order: i });
    }
  }

  // 选项管理（仅多选型）
  async addOption(
    nodeId: string,
    data: CreateOptionData
  ): Promise<EvaluationScoringOption> {
    const node = await this.nodeRepo.findOne({ where: { id: nodeId } });
    if (!node) throw new Error("节点不存在");
    if (node.scoringType !== EvaluationScoringType.MULTIPLE_CHOICE) {
      throw new Error("只有多选型节点才能添加选项");
    }
    const option = this.optionRepo.create({
      nodeId,
      label: data.label,
      score: data.score,
    });
    return await this.optionRepo.save(option);
  }

  async updateOption(
    id: string,
    data: UpdateOptionData
  ): Promise<EvaluationScoringOption | null> {
    const option = await this.optionRepo.findOne({ where: { id } });
    if (!option) return null;
    Object.assign(option, data);
    return await this.optionRepo.save(option);
  }

  async deleteOption(id: string): Promise<boolean> {
    const result = await this.optionRepo.delete(id);
    return result.affected !== 0;
  }

  async listOptions(nodeId: string): Promise<EvaluationScoringOption[]> {
    const node = await this.nodeRepo.findOne({ where: { id: nodeId } });
    if (!node) throw new Error("节点不存在");
    if (node.scoringType !== EvaluationScoringType.MULTIPLE_CHOICE) {
      return [];
    }
    const res = await this.optionRepo.find({ where: { nodeId } });
    console.log(res);
    return res;
  }

  // 树形查询：返回某个工具（root 节点）的完整树
  async getToolTree(rootId: string): Promise<any> {
    const root = await this.nodeRepo.findOne({ where: { id: rootId } });
    if (!root) throw new Error("工具不存在");
    if (root.nodeType !== EvaluationNodeType.ROOT)
      throw new Error("不是工具根节点");

    const buildTree = async (node: EvaluationToolNode): Promise<any> => {
      const children = await this.nodeRepo.find({
        where: { parentId: node.id },
        order: { order: "ASC", id: "ASC" },
      });
      let options: EvaluationScoringOption[] = [];
      if (node.scoringType === EvaluationScoringType.MULTIPLE_CHOICE) {
        options = await this.optionRepo.find({ where: { nodeId: node.id } });
      }

      const childTrees = await Promise.all(children.map(buildTree));
      return {
        id: node.id,
        parentId: node.parentId,
        nodeType: node.nodeType,
        title: node.title,
        description: node.description,
        targetAge: node.targetAge,
        order: node.order,
        scoringType: node.scoringType,
        scoringConfig: node.scoringConfig,
        options:
          node.scoringType === EvaluationScoringType.MULTIPLE_CHOICE
            ? options
            : undefined,
        children: childTrees,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
      };
    };

    return await buildTree(root);
  }
}

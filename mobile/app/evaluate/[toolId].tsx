import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { treeAPI, evaluationRecordAPI } from "@/services/api";
import Toast from "react-native-toast-message";
import Sidebar from "@/components/vbmapp/Sidebar";
import Chip from "@/components/vbmapp/Chip";
import MilestoneCard from "@/components/vbmapp/MilestoneCard";
import { Milestone, TreeNodeItem } from "@/types/vbmapp";

export default function EvaluateScreen() {
  const { toolId, studentId, evaluationRecordId } = useLocalSearchParams<{
    toolId: string;
    studentId: string;
    evaluationRecordId?: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [fullTree, setFullTree] = useState<TreeNodeItem>(); // 完整树结构（全部根）
  const [moduleItems, setModuleItems] = useState<TreeNodeItem[]>([]); // 根下一级：评估模块
  const [selectedModuleId, setSelectedModuleId] = useState<
    string | undefined
  >();

  const [stageItems, setStageItems] = useState<TreeNodeItem[]>([]); // 模块下一级：阶段
  const [selectedStageId, setSelectedStageId] = useState<string | undefined>();

  const [subDomainItems, setSubDomainItems] = useState<TreeNodeItem[]>([]); // 阶段下一级：领域
  const [selectedSubDomainId, setSelectedSubDomainId] = useState<
    string | undefined
  >();

  const [milestones, setMilestones] = useState<Milestone[]>([]); // 领域下所有叶子：渲染卡片
  const [evaluationRecord, setEvaluationRecord] = useState<any>(null); // 评估记录数据
  const [updatingNodes, setUpdatingNodes] = useState<Set<string>>(new Set()); // 正在更新的节点ID
  const updateTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map()); // 防抖定时器

  const findNodeById = (
    nodes: TreeNodeItem[],
    id: string
  ): TreeNodeItem | undefined => {
    for (const n of nodes) {
      if (n._id === id) return n;
      if (n.children && n.children.length) {
        const found = findNodeById(n.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const collectLeaves = (nodes: TreeNodeItem[]): TreeNodeItem[] => {
    const result: TreeNodeItem[] = [];
    const walk = (arr: TreeNodeItem[]) => {
      for (const n of arr) {
        if (n.isLeaf) result.push(n);
        else if (n.children && n.children.length) walk(n.children);
      }
    };
    walk(nodes);
    return result;
  };

  // 加载评估记录数据
  const loadEvaluationRecord = async () => {
    if (!evaluationRecordId) return;

    try {
      const response = await evaluationRecordAPI.getEvaluationRecord(
        evaluationRecordId
      );
      if (response.data.success) {
        setEvaluationRecord(response.data.data);
      }
    } catch (error) {
      console.error("加载评估记录失败:", error);
      Toast.show({
        type: "error",
        text1: "加载评估记录失败",
      });
    }
  };

  // 根据评估记录初始化里程碑的完成数
  const initializeMilestoneCounts = (milestones: Milestone[]) => {
    if (!evaluationRecord?.evaluationScores) return milestones;

    return milestones.map((milestone) => {
      const score = evaluationRecord.evaluationScores.find(
        (score: any) => score.nodeId === milestone.id
      );
      return {
        ...milestone,
        count: score?.completedCount || 0,
      };
    });
  };

  const loadHierarchy = async (rootId: string) => {
    try {
      setLoading(true);
      // 一次性获取完整树
      const structureRes = await treeAPI.getSubtree(rootId);
      const fullTree: TreeNodeItem = structureRes?.data?.data || [];
      setFullTree(fullTree);

      // 以传入 rootId 定位根节点
      const rootNode = fullTree;
      const modules = rootNode?.children || [];
      setModuleItems(modules);
      const firstModuleId = modules[0]?._id;
      setSelectedModuleId(firstModuleId);

      // 2) 阶段
      if (firstModuleId) {
        const moduleNode = findNodeById(modules, firstModuleId);
        const stages = moduleNode?.children || [];
        setStageItems(stages);
        const firstStageId = stages[0]?._id;
        setSelectedStageId(firstStageId);

        // 3) 阶段下：领域
        if (firstStageId) {
          const domainNode = findNodeById(stages, firstStageId);
          const subs = domainNode?.children || [];
          setSubDomainItems(subs);
          const firstSubDomainId = subs[0]?._id;
          setSelectedSubDomainId(firstSubDomainId);

          // 4) 领域下：具体项目
          if (firstSubDomainId) {
            const subNode = findNodeById(subs, firstSubDomainId);
            // const leafNodes = collectLeaves(subNode?.children || []);
            const leafNodes = subNode?.children || [];
            const ms: Milestone[] = leafNodes.map((n) => ({
              id: n._id,
              title: n.name,
              totalCount: (n as any).totalCount,
              count: 0,
            }));
            setMilestones(initializeMilestoneCounts(ms));
          } else {
            setMilestones([]);
          }
        } else {
          setSubDomainItems([]);
          setMilestones([]);
        }
      } else {
        setStageItems([]);
        setSubDomainItems([]);
        setMilestones([]);
      }
    } catch (e) {
      Toast.show({ type: "error", text1: "加载评估数据失败" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof toolId === "string") {
      loadHierarchy(toolId);
    }
  }, [toolId]);

  // 加载评估记录
  useEffect(() => {
    loadEvaluationRecord();
  }, [evaluationRecordId]);

  const onSelectModule = (id: string) => {
    setSelectedModuleId(id);
  };

  const onSelectStage = (id: string) => {
    setSelectedStageId(id);
  };

  const onSelectSubDomain = (id: string) => {
    setSelectedSubDomainId(id);
  };

  // 当选择的模块变化时，计算阶段并默认选中第一项
  useEffect(() => {
    if (!selectedModuleId) {
      setStageItems([]);
      setSelectedStageId(undefined);
      return;
    }
    const moduleNode = findNodeById(moduleItems, selectedModuleId);
    const stages = moduleNode?.children || [];
    setStageItems(stages);
    setSelectedStageId(stages[0]?._id);
  }, [selectedModuleId, moduleItems]);

  // 当选择的阶段变化时，计算子领域并默认选中第一项；若无子领域则直接计算里程碑
  useEffect(() => {
    if (!selectedStageId) {
      setSubDomainItems([]);
      setSelectedSubDomainId(undefined);
      setMilestones([]);
      return;
    }
    const stageNode = findNodeById(stageItems, selectedStageId);
    const subs = stageNode?.children || [];
    setSubDomainItems(subs);
    if (subs.length > 0) {
      setSelectedSubDomainId(subs[0]._id);
    } else {
      // 无子领域，直接展示阶段下项目
      const leafNodes = stageNode?.children || [];
      const ms: Milestone[] = (leafNodes || []).map((n) => ({
        id: n._id,
        title: n.name,
        totalCount: (n as any).totalCount,
        count: 0,
      }));
      setMilestones(initializeMilestoneCounts(ms));
    }
  }, [selectedStageId, stageItems]);

  // 当选择的子领域变化时，计算其下项目
  useEffect(() => {
    if (!selectedSubDomainId) {
      // 可能处于无子领域场景，里程碑已在上一层设置
      return;
    }
    const node = findNodeById(subDomainItems, selectedSubDomainId);
    const leafNodes = node?.children || [];
    const ms: Milestone[] = (leafNodes || []).map((n) => ({
      id: n._id,
      title: n.name,
      totalCount: (n as any).totalCount,
      count: 0,
    }));
    setMilestones(initializeMilestoneCounts(ms));
  }, [selectedSubDomainId, subDomainItems]);

  // 防抖更新完成数
  const debouncedUpdateCount = useCallback(
    (nodeId: string, completedCount: number) => {
      // 清除之前的定时器
      const existingTimeout = updateTimeouts.current.get(nodeId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // 设置新的定时器
      const timeout = setTimeout(async () => {
        if (!evaluationRecordId) return;

        try {
          setUpdatingNodes((prev) => new Set(prev).add(nodeId));

          await evaluationRecordAPI.updateNodeScore(
            evaluationRecordId,
            nodeId,
            {
              completedCount,
            }
          );

          // 更新本地评估记录数据
          setEvaluationRecord((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              evaluationScores: prev.evaluationScores.map((score: any) =>
                score.nodeId === nodeId ? { ...score, completedCount } : score
              ),
            };
          });

          // 静默更新，不显示成功提示
        } catch (error) {
          console.error("更新完成数失败:", error);
          Toast.show({
            type: "error",
            text1: "更新失败，请重试",
          });
        } finally {
          setUpdatingNodes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(nodeId);
            return newSet;
          });
        }
      }, 500); // 500ms 防抖延迟

      updateTimeouts.current.set(nodeId, timeout);
    },
    [evaluationRecordId]
  );

  const handleChangeCount = (id: string, next: number) => {
    // 立即更新本地状态
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, count: next } : m))
    );

    // 防抖更新服务器
    debouncedUpdateCount(id, next);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      updateTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      updateTimeouts.current.clear();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载评估内容...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]}>
      <Stack.Screen
        options={{
          title: "评估",
          headerBackTitle: "返回",
        }}
      />
      <View style={styles.container}>
        <Sidebar
          items={moduleItems}
          selectedId={selectedModuleId}
          stageItems={stageItems}
          selectedStageId={selectedStageId}
          onSelect={onSelectModule}
          onSelectStage={onSelectStage}
          sectionTitle="评估模块"
        />
        <View style={{ flex: 1 }}>
          {/* <View style={styles.chipList}>
            <ScrollView horizontal>
              {stageItems.map((d) => (
                <Chip
                  key={d._id}
                  text={d.name}
                  active={selectedStageId === d._id}
                  onPress={() => onSelectStage(d._id)}
                />
              ))}
            </ScrollView>
          </View> */}
          {subDomainItems.length > 0 ? (
            <View style={styles.chipList}>
              <ScrollView horizontal>
                {subDomainItems.map((d) => (
                  <Chip
                    key={d._id}
                    text={d.name}
                    active={selectedSubDomainId === d._id}
                    onPress={() => onSelectSubDomain(d._id)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
          <ScrollView
            style={{ padding: 8 }}
            contentContainerStyle={{ paddingBottom: 130 }}
            showsVerticalScrollIndicator={false}
          >
            {milestones.map((m) => (
              <MilestoneCard
                key={m.id}
                m={m}
                onChangeCount={handleChangeCount}
                isUpdating={updatingNodes.has(m.id)}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    display: "flex",
  },
  chipList: {
    padding: 8,
    backgroundColor: "white",
    marginBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: { marginTop: 12, color: "#666" },
});

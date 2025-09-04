import React, { useEffect, useState } from "react";
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
import { treeAPI } from "@/services/api";
import Toast from "react-native-toast-message";
import Sidebar from "@/components/vbmapp/Sidebar";
import Chip from "@/components/vbmapp/Chip";
import MilestoneCard from "@/components/vbmapp/MilestoneCard";
import { Milestone, TreeNodeItem } from "@/types/vbmapp";

export default function EvaluateScreen() {
  const { toolId, studentId } = useLocalSearchParams<{
    toolId: string;
    studentId: string;
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
            }));
            setMilestones(ms);
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
      }));
      setMilestones(ms);
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
    }));
    setMilestones(ms);
  }, [selectedSubDomainId, subDomainItems]);

  const handleChangeScore = (id: string, score: Milestone["score"]) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, score } : m))
    );
  };

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
          <ScrollView style={{ padding: 8 }}>
            {milestones.map((m) => (
              <MilestoneCard
                key={m.id}
                m={m}
                onChangeScore={handleChangeScore}
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
